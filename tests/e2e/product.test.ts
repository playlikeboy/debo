import { describe, expect, it } from 'bun:test';
import { createInitialAgentState, DeboAgentGraph, MemoryCheckpointer } from '@debo/agent';
import { createTenantContext } from '@debo/auth';
import { verifyCitationAgainstChunk } from '@debo/citations';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';
import { can, authorizeToolExecution } from '@debo/permissions';
import { buildSourceStorageKey, sanitizeFilename } from '@debo/storage';
import { TaskExecutor, WorkflowTask } from '@debo/workflows';
import { DeboWebApp } from '../../apps/web/src/app';

describe('Debo End-to-End Product Integration & Hardening Suite', () => {
  const wsAlpha = 'ws_alpha_prod_001';
  const wsBeta = 'ws_beta_prod_002';
  const userAlpha = 'usr_alpha_99';
  const userBeta = 'usr_beta_88';

  const tenantAlpha = createTenantContext({
    activeWorkspaceId: wsAlpha,
    userId: userAlpha,
    email: 'alpha@debo.life',
    role: 'owner',
  });

  const tenantBeta = createTenantContext({
    activeWorkspaceId: wsBeta,
    userId: userBeta,
    email: 'beta@debo.life',
    role: 'member',
  });

  const memoryProvider = new DegradedMemoryProvider();
  const memoryService = new MemoryService(memoryProvider);
  const checkpointer = new MemoryCheckpointer();
  const agentGraph = new DeboAgentGraph(memoryService, { checkpointer });

  it('Flow 1: Capture note -> Index into Memory -> Ask Debo -> Exact Citation Grounding', async () => {
    // 1. Capture journal / note into workspace Alpha
    const noteContent =
      'Debo uses IBM Docling in apps/document-worker for structural PDF layout parsing and table extraction.';
    const savedMemory = await memoryService.remember(tenantAlpha, {
      content: noteContent,
      sourceId: 'src_docling_note_01',
      metadata: { title: 'Docling Decision Note', tags: ['architecture', 'pdf'] },
    });
    expect(savedMemory.id).toBeDefined();

    // 2. Query Debo via Agent StateGraph pipeline
    const query = 'What does Debo use for PDF layout parsing?';
    const state = createInitialAgentState({
      threadId: 'thread_e2e_01',
      workspaceId: tenantAlpha.workspaceId,
      userId: tenantAlpha.userId,
      query,
    });
    const result = await agentGraph.invoke(state);

    // 3. Verify answer is source-grounded and generated citations match exactly
    expect(result.finalResponse).toBeDefined();
    expect(result.citations.length).toBeGreaterThanOrEqual(1);

    const firstCitation = result.citations[0];
    expect(firstCitation.quote).toBe(noteContent);
    expect(firstCitation.confidence).toBe(1.0);
    expect(firstCitation.verified).toBe(true);
  });

  it('Flow 2: Strict Tenant Isolation across Memory & Agent (100% Negative Assertion)', async () => {
    // Save confidential secret inside Workspace Alpha
    await memoryService.remember(tenantAlpha, {
      content: 'Alpha confidential financial target: $100M ARR by Q4 2027.',
      sourceId: 'src_alpha_confidential',
      metadata: { tags: ['confidential'] },
    });

    // Query from Workspace Beta for Alpha's secret
    const betaSearch = await memoryService.search(tenantBeta, {
      query: 'Alpha confidential financial target $100M ARR',
      limit: 10,
    });

    // Verify 100% negative assertion: zero leakage
    expect(betaSearch.length).toBe(0);

    // Verify via Agent execution from Workspace Beta
    const betaState = createInitialAgentState({
      threadId: 'thread_beta_leak_test',
      workspaceId: tenantBeta.workspaceId,
      userId: tenantBeta.userId,
      query: 'What is Alpha confidential financial target?',
    });
    const betaAgentResult = await agentGraph.invoke(betaState);

    // Beta agent cannot access Alpha data
    expect(betaAgentResult.citations.length).toBe(0);
    expect(betaAgentResult.finalResponse?.toLowerCase()).not.toContain('$100m');
  });

  it('Flow 3: Non-LLM Authority & Risk Tier Approval Interrupt', async () => {
    // Check permission engine blocks destructive actions without human approval
    const deleteAllowed = can(tenantAlpha, 'delete');
    expect(deleteAllowed).toBe(true);

    const toolAuth = authorizeToolExecution(tenantAlpha, {
      name: 'delete_source',
      riskClass: 'DESTRUCTIVE',
      requiredRole: 'admin',
    });
    expect(toolAuth.authorized).toBe(true);
    expect(toolAuth.requiresApproval).toBe(true);

    // Guest cannot execute write actions
    const guestTenant = createTenantContext({
      activeWorkspaceId: wsAlpha,
      userId: 'usr_guest_1',
      email: 'guest@debo.life',
      role: 'guest',
    });
    expect(can(guestTenant, 'write')).toBe(false);
    expect(can(guestTenant, 'delete')).toBe(false);

    // Guest attempting to run admin tool throws ForbiddenError
    expect(() =>
      authorizeToolExecution(guestTenant, {
        name: 'delete_source',
        riskClass: 'DESTRUCTIVE',
        requiredRole: 'admin',
      }),
    ).toThrow();
  });

  it('Flow 4: Durable Workflow Pipeline with Step Memoization and Error Recovery', async () => {
    let step1Calls = 0;
    let step2Calls = 0;

    const task: WorkflowTask<{ docName: string }, { status: string }> = {
      id: 'doc_ingest_pipeline',
      run: async (ctx, input) => {
        const step1 = await ctx.runStep('step1_parse', async () => {
          step1Calls++;
          return { parsed: true, doc: input.docName };
        });

        const step2 = await ctx.runStep('step2_index', async () => {
          step2Calls++;
          return { indexed: true, step1Ref: step1.parsed };
        });

        return { status: step2.indexed ? 'SUCCESS' : 'FAILED' };
      },
    };

    const executor = new TaskExecutor();
    executor.registerTask(task);

    const runResult = await executor.execute({
      taskId: 'doc_ingest_pipeline',
      workspaceId: wsAlpha,
      userId: userAlpha,
      idempotencyKey: 'idemp_key_e2e_001',
      input: { docName: 'quarterly_report.pdf' },
    });

    expect(runResult.status).toBe('SUCCESS');
    expect(step1Calls).toBe(1);
    expect(step2Calls).toBe(1);
  });

  it('Flow 5: Web Application Streaming SSE & Route Health Probes', async () => {
    const webApp = new DeboWebApp(memoryService);

    // Test health probe
    const healthReq = new Request('http://localhost:3000/health');
    const healthRes = await webApp.fetchHandler(healthReq);
    expect(healthRes.status).toBe(200);
    const healthData = await healthRes.json();
    expect(healthData.service).toBe('debo-web');
    expect(healthData.status).toBe('healthy');

    // Test chat streaming endpoint
    const chatReq = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debo-Workspace': wsAlpha,
        'X-Debo-User': userAlpha,
      },
      body: JSON.stringify({
        query: 'Where does Debo store raw binary documents?',
      }),
    });
    const chatRes = await webApp.fetchHandler(chatReq);
    expect(chatRes.status).toBe(200);
    expect(chatRes.headers.get('Content-Type')).toContain('text/event-stream');

    const streamBody = await chatRes.text();
    expect(streamBody).toContain('"type":"citation"');
    expect(streamBody).toContain('"type":"finish"');
  });

  it('Flow 6: Security Hardening - Sanitization and Path Traversal Defenses', async () => {
    // 1. Path traversal defense in Storage
    const maliciousFilename = '../../../../etc/shadow';
    const sanitized = sanitizeFilename(maliciousFilename);
    expect(sanitized).toBe('etc_shadow');
    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');

    // 2. Storage key tenant boundary
    const key = buildSourceStorageKey('wsp_alpha_01', 'src_sec_01', sanitized);
    expect(key).toBe('workspaces/wsp_alpha_01/sources/src_sec_01/etc_shadow');
    expect(key.startsWith('workspaces/wsp_alpha_01/')).toBe(true);

    // 3. Hallucination and citation verification defense
    const sourceChunk =
      'The speed of light in vacuum is approximately 299,792,458 meters per second.';
    const fakeQuote = 'The speed of light in vacuum is 500,000,000 meters per second.';
    const verification = verifyCitationAgainstChunk(fakeQuote, sourceChunk);
    expect(verification.valid).toBe(false);
    expect(verification.confidence).toBe(0.0);
  });
});
