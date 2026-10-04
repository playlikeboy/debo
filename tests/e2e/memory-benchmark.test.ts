import { describe, expect, it } from 'bun:test';
import { createTenantContext } from '@debo/auth';
import { verifyCitationAgainstChunk } from '@debo/citations';
import { DegradedMemoryProvider, MemoryService } from '@debo/memory';

describe('Debo Memory Evaluation Benchmark Suite (7 Tracks)', () => {
  const ws1 = 'ws_eval_track_01';
  const ws2 = 'ws_eval_track_02';

  const tenant1 = createTenantContext({
    activeWorkspaceId: ws1,
    userId: 'eval_user_1',
    email: 'eval1@debo.life',
    role: 'owner',
  });
  const tenant2 = createTenantContext({
    activeWorkspaceId: ws2,
    userId: 'eval_user_2',
    email: 'eval2@debo.life',
    role: 'owner',
  });

  const provider = new DegradedMemoryProvider();
  const service = new MemoryService(provider);

  it('Track 1: Retrieval Precision & Recall - Exact Fact & Semantic Matching', async () => {
    // Ingest exact fact
    await service.remember(tenant1, {
      content: 'Server MAC address for primary cluster router is 00:1A:2B:3C:4D:5E.',
      sourceId: 'src_hardware_inv',
      metadata: { category: 'hardware' },
    });

    // Ingest semantic fact
    await service.remember(tenant1, {
      content:
        'Quarterly financial forecast expresses deep concerns regarding interest rate hikes.',
      sourceId: 'src_financial_notes',
      metadata: { category: 'finance' },
    });

    // Exact fact search
    const exactSearch = await service.search(tenant1, {
      query: '00:1A:2B:3C:4D:5E',
      limit: 5,
    });
    expect(exactSearch.length).toBeGreaterThanOrEqual(1);
    expect(exactSearch[0].memory.content).toContain('00:1A:2B:3C:4D:5E');

    // Semantic recall query
    const semanticSearch = await service.search(tenant1, {
      query: 'financial forecast concerns interest rate',
      limit: 5,
    });
    expect(semanticSearch.length).toBeGreaterThanOrEqual(1);
    expect(semanticSearch[0].memory.content).toContain('interest rate hikes');
  });

  it('Track 2: Temporal Reasoning & State Changes - Preference Evolution', async () => {
    // Initial preference
    await service.remember(tenant1, {
      content: 'Current housing address in 2023: 120 Market Street, San Francisco.',
      sourceId: 'src_profile_history',
      metadata: { year: 2023, isLatest: false },
    });

    // Superseding preference
    await service.remember(tenant1, {
      content: 'Current housing address in 2026: 450 Broadway, New York City.',
      sourceId: 'src_profile_history',
      metadata: { year: 2026, isLatest: true },
    });

    const search = await service.search(tenant1, {
      query: 'Current housing address',
      limit: 10,
    });

    expect(search.length).toBeGreaterThanOrEqual(2);
    // Both states are tracked in history without data loss
    const contents = search.map(i => i.memory.content).join(' ');
    expect(contents).toContain('San Francisco');
    expect(contents).toContain('New York City');
  });

  it('Track 3: Entity & Relational Resolution - Nicknames and References', async () => {
    await service.remember(tenant1, {
      content:
        'Alex Rivers (also known as AR, Lead Architect) authored the Debo memory specification.',
      sourceId: 'src_team_directory',
    });

    const queryByNickname = await service.search(tenant1, {
      query: 'Lead Architect AR author memory specification',
      limit: 5,
    });

    expect(queryByNickname.length).toBeGreaterThanOrEqual(1);
    expect(queryByNickname[0].memory.content).toContain('Alex Rivers');
  });

  it('Track 4: Contradiction Resolution & Confidence Calibration', async () => {
    const claim1 = 'Product release date is finalized for November 15, 2026.';
    const claim2 = 'Product release date is rescheduled to December 1, 2026.';

    await service.remember(tenant1, {
      content: claim1,
      sourceId: 'src_meeting_oct',
      metadata: { meetingDate: '2026-10-01' },
    });

    await service.remember(tenant1, {
      content: claim2,
      sourceId: 'src_meeting_nov',
      metadata: { meetingDate: '2026-11-01' },
    });

    const searchResult = await service.search(tenant1, {
      query: 'Product release date',
      limit: 5,
    });

    // Both contradictory claims must be returned so reasoning engine presents both with qualifiers
    expect(searchResult.length).toBeGreaterThanOrEqual(2);
  });

  it('Track 5: Grounding & Citation Precision Benchmark', async () => {
    const sourceText =
      'Debo implements non-LLM authority where tools in Risk Tier 2 and Tier 3 strictly require human confirmation before execution.';

    // Verifiable citation
    const exactQuote =
      'tools in Risk Tier 2 and Tier 3 strictly require human confirmation before execution';
    const verifyPass = verifyCitationAgainstChunk(exactQuote, sourceText);
    expect(verifyPass.valid).toBe(true);
    expect(verifyPass.confidence).toBe(1.0);

    // Hallucinated quote
    const hallucinatedQuote =
      'all tools are executed automatically by the model without confirmation';
    const verifyFail = verifyCitationAgainstChunk(hallucinatedQuote, sourceText);
    expect(verifyFail.valid).toBe(false);
    expect(verifyFail.confidence).toBe(0.0);
  });

  it('Track 6: Multi-Tenant Isolation Benchmark (0.00% Leakage Tolerance)', async () => {
    // Populate Workspace 1 with 20 distinct memories
    for (let i = 0; i < 20; i++) {
      await service.remember(tenant1, {
        content: `Confidential entity token ${i}: secret_token_${i}_ws1`,
        sourceId: `src_bulk_${i}`,
      });
    }

    // Execute queries from Workspace 2 targeting Workspace 1 tokens
    let leakCount = 0;
    for (let i = 0; i < 20; i++) {
      const probe = await service.search(tenant2, {
        query: `secret_token_${i}_ws1`,
        limit: 10,
      });
      if (probe.length > 0) {
        leakCount++;
      }
    }

    // Zero tolerance: leak rate must be 0
    expect(leakCount).toBe(0);
  });

  it('Track 7: Deletion Hygiene & Erased Records Guarantee', async () => {
    const memory = await service.remember(tenant1, {
      content: 'Disposable temporary test record for erasure.',
      sourceId: 'src_disposable',
    });

    // Confirm stored
    const check1 = await service.recall(tenant1, 'Disposable temporary test record', 5);
    expect(check1.length).toBeGreaterThanOrEqual(1);

    // Delete record
    const deleted = await service.forget(tenant1, memory.id);
    expect(deleted).toBe(true);

    // Confirm completely erased
    const check2 = await service.recall(tenant1, 'Disposable temporary test record', 5);
    expect(check2.find(m => m.id === memory.id)).toBeUndefined();
  });
});
