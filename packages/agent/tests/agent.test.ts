import { describe, expect, it } from 'bun:test';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';
import { TenantMismatchError } from '@debo/types';
import { createDeboAgentGraph, createInitialAgentState } from '../src/graph';
import { validateNode } from '../src/nodes/validate';
import { AgentState } from '../src/state';

describe('@debo/agent StateGraph runtime', () => {
  it('executes full graph pipeline: plan -> retrieve -> reason -> validate -> respond', async () => {
    const memoryService = new MemoryService(new DegradedMemoryProvider());
    await memoryService.remember(
      { workspaceId: 'ws_agent_test', userId: 'usr_alice', role: 'member' },
      { content: 'Project Debo was architected on October 4, 2026.' },
    );

    const graph = createDeboAgentGraph(memoryService);
    const initialState = createInitialAgentState({
      workspaceId: 'ws_agent_test',
      userId: 'usr_alice',
      query: 'When was Debo architected?',
    });

    const finalState = await graph.invoke(initialState);

    expect(finalState.stepCount).toBeGreaterThan(0);
    expect(finalState.plan.length).toBeGreaterThan(0);
    expect(finalState.retrievedChunks.length).toBe(1);
    expect(finalState.citations.length).toBe(1);
    expect(finalState.citations[0]?.verified).toBe(true);
    expect(finalState.messages.length).toBe(2);
    expect(finalState.messages[1]?.role).toBe('assistant');
    expect(finalState.messages[1]?.content).toContain(
      'Project Debo was architected on October 4, 2026.',
    );
  });

  it('citation gate strips hallucinated references and appends disclaimer if confidence is low', async () => {
    const mockState: AgentState = {
      threadId: 'th_test',
      workspaceId: 'ws_test',
      userId: 'usr_test',
      messages: [],
      query: 'test',
      plan: [],
      retrievedChunks: [{ id: 'chunk_real', content: 'Real retrieved memory.' }],
      citations: [
        {
          chunkId: 'chunk_real',
          claim: 'Real',
          quote: 'Real retrieved memory.',
          verified: false,
          confidence: 1.0,
        },
      ],
      pendingApproval: null,
      finalResponse:
        'This fact is true [^chunk_real], but this other fact is fake [^chunk_hallucinated] and another [^chunk_fake2].',
      stepCount: 3,
      isInterrupted: false,
      disclaimerAppended: false,
    };

    const validatedPatch = await validateNode(mockState);
    expect(validatedPatch.finalResponse).toBeDefined();
    // Hallucinated references should be stripped
    expect(validatedPatch.finalResponse).not.toContain('[^chunk_hallucinated]');
    expect(validatedPatch.finalResponse).not.toContain('[^chunk_fake2]');
    expect(validatedPatch.finalResponse).toContain('[^chunk_real]');
    // More than 50% invalid citations -> disclaimer appended
    expect(validatedPatch.disclaimerAppended).toBe(true);
    expect(validatedPatch.finalResponse).toContain(
      'Some details in this answer could not be fully grounded',
    );
  });

  it('interrupts graph execution on destructive operations and pauses for human approval', async () => {
    const memoryService = new MemoryService(new DegradedMemoryProvider());
    const graph = createDeboAgentGraph(memoryService);

    const initialState = createInitialAgentState({
      workspaceId: 'ws_agent_test',
      userId: 'usr_alice',
      query: 'Please delete repo SH20RAJ/debo right now',
    });

    const pausedState = await graph.invoke(initialState);

    expect(pausedState.isInterrupted).toBe(true);
    expect(pausedState.pendingApproval).toBeDefined();
    expect(pausedState.pendingApproval?.riskTier).toBe('DESTRUCTIVE');
    expect(pausedState.pendingApproval?.toolName).toBe('delete_resource');

    // Resume with valid human approval signature
    const resumedState = await graph.resumeWithApproval(
      pausedState.threadId,
      pausedState.workspaceId,
      'appr_signature_verified_123',
    );

    expect(resumedState.isInterrupted).toBe(false);
    expect(resumedState.pendingApproval).toBeNull();
    expect(resumedState.finalResponse).toContain('approved');
    expect(resumedState.messages[resumedState.messages.length - 1]?.content).toContain('approved');
  });

  it('enforces tenant boundary on checkpointer state and history', async () => {
    const memoryService = new MemoryService(new DegradedMemoryProvider());
    const graph = createDeboAgentGraph(memoryService);

    const initialState = createInitialAgentState({
      workspaceId: 'ws_company_a',
      userId: 'usr_alice',
      query: 'Secret strategy',
    });

    const completedState = await graph.invoke(initialState);
    const checkpointer = graph.getCheckpointer();

    // Access from legitimate workspace succeeds
    const latest = await checkpointer.getLatest('ws_company_a', completedState.threadId);
    expect(latest?.threadId).toBe(completedState.threadId);

    // Cross-tenant access attempt from adversary workspace is rejected
    await expect(checkpointer.getLatest('ws_company_b', completedState.threadId)).rejects.toThrow(
      TenantMismatchError,
    );
  });
});
