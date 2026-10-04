import { describe, expect, it } from 'bun:test';
import type { TenantContext } from '@debo/types';
import { DegradedMemoryProvider, MemoryService, SupermemoryAdapter } from '../src/index';

describe('@debo/memory subsystem', () => {
  const contextA: TenantContext = {
    workspaceId: 'wsp_alpha',
    userId: 'usr_alice',
    role: 'owner',
  };

  const contextB: TenantContext = {
    workspaceId: 'wsp_bravo',
    userId: 'usr_bob',
    role: 'owner',
  };

  it('DegradedMemoryProvider guarantees strict tenant isolation', async () => {
    const provider = new DegradedMemoryProvider();

    // Remember in Workspace Alpha
    await provider.remember(contextA, {
      content: 'Alice prefers dark mode in all IDEs.',
      type: 'declarative',
    });

    // Search from Workspace Alpha
    const resultsA = await provider.search(contextA, { query: 'dark mode' });
    expect(resultsA).toHaveLength(1);
    expect(resultsA[0]!.memory.content).toContain('Alice prefers dark mode');

    // Search from Workspace Bravo (Must return 0 records - zero tenant leakage)
    const resultsB = await provider.search(contextB, { query: 'dark mode' });
    expect(resultsB).toHaveLength(0);
  });

  it('DegradedMemoryProvider lifecycle: remember, update, forget', async () => {
    const provider = new DegradedMemoryProvider();

    const mem = await provider.remember(contextA, {
      content: 'Meeting with investors set for Tuesday at 3pm.',
    });
    expect(mem.id).toBeDefined();

    // Update
    const updated = await provider.update(contextA, mem.id, {
      content: 'Meeting with investors rescheduled to Thursday at 4pm.',
    });
    expect(updated.content).toContain('Thursday at 4pm');

    // Forget
    const deleted = await provider.forget(contextA, mem.id);
    expect(deleted).toBe(true);

    const postSearch = await provider.search(contextA, { query: 'investors' });
    expect(postSearch).toHaveLength(0);
  });

  it('SupermemoryAdapter creates scoped container memories', async () => {
    const adapter = new SupermemoryAdapter({ apiKey: 'sm_mock_key' });
    const mem = await adapter.remember(contextA, {
      content: 'Architecture decision: use LangGraph JS for agent graphs.',
    });

    expect(mem.workspaceId).toBe('wsp_alpha');
    expect((mem.metadata as any).containerId).toBe('debo_wsp_alpha');
    expect(mem.confidence).toBe(0.98);
  });

  it('MemoryService handles fallback gracefully on failure', async () => {
    const failingProvider = {
      name: 'failing_primary',
      remember: async () => {
        throw new Error('Supermemory 503 Service Unavailable');
      },
      search: async () => {
        throw new Error('Supermemory 503');
      },
      recall: async () => {
        throw new Error('Supermemory 503');
      },
      profile: async () => {
        throw new Error('Supermemory 503');
      },
      forget: async () => {
        throw new Error('Supermemory 503');
      },
      update: async () => {
        throw new Error('Supermemory 503');
      },
    };

    const service = new MemoryService(failingProvider);
    expect(service.isInDegradedMode).toBe(false);

    // Should catch the 503, switch to degraded mode, and remember successfully
    const saved = await service.remember(contextA, {
      content: 'Important note saved during vendor outage.',
    });
    expect(saved).toBeDefined();
    expect(service.isInDegradedMode).toBe(true);

    const recalled = await service.recall(contextA, 'outage');
    expect(recalled).toHaveLength(1);
    expect(recalled[0]!.content).toContain('Important note');
  });
});
