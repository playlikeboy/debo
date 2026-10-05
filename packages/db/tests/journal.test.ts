import { describe, expect, it } from 'bun:test';
import type { TenantContext } from '@debo/types';
import { JournalRepository } from '../src/journal';

describe('@debo/db JournalRepository', () => {
  const ctx: TenantContext = {
    workspaceId: 'wsp_tenant_1',
    userId: 'usr_user_1',
    role: 'member',
  };

  it('validates tenant context presence', async () => {
    // Mock db
    const mockDb: any = {};
    const repo = new JournalRepository(mockDb);

    await expect(
      repo.createEntry({ workspaceId: '', userId: '', role: 'member' }, {
        title: 'Test',
        contentJson: [],
        contentText: 'Test',
      }),
    ).rejects.toThrow('TenantContext must include workspaceId and userId');

    await expect(
      repo.getEntry({ workspaceId: '', userId: '', role: 'member' }, 'jrn_1'),
    ).rejects.toThrow('workspaceId is required');

    await expect(
      repo.listEntries({ workspaceId: '', userId: '', role: 'member' }),
    ).rejects.toThrow('workspaceId is required');

    await expect(
      repo.deleteEntry({ workspaceId: '', userId: '', role: 'member' }, 'jrn_1'),
    ).rejects.toThrow('workspaceId is required');
  });

  it('creates, retrieves, and maps journal entries correctly with mock db', async () => {
    const memoryStore: any[] = [];

    const mockDb: any = {
      insert: () => ({
        values: (val: any) => ({
          returning: async () => {
            memoryStore.push(val);
            return [val];
          },
        }),
      }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: (n: number) => {
              return memoryStore.slice(0, n);
            },
            orderBy: () => ({
              limit: (l: number) => ({
                offset: (o: number) => memoryStore.slice(o, o + l),
              }),
            }),
          }),
        }),
      }),
      update: () => ({
        set: (vals: any) => ({
          where: () => ({
            returning: async () => {
              const item = memoryStore[0];
              Object.assign(item, vals);
              return [item];
            },
          }),
        }),
      }),
      delete: () => ({
        where: () => ({
          returning: async () => {
            const popped = memoryStore.pop();
            return popped ? [{ id: popped.id }] : [];
          },
        }),
      }),
    };

    const repo = new JournalRepository(mockDb);

    const entry = await repo.createEntry(ctx, {
      title: 'First Morning Reflection',
      contentJson: [
        { id: 'b1', type: 'heading', props: { level: 1 }, content: 'Morning' },
        { id: 'b2', type: 'paragraph', content: 'Debo journal testing.' },
      ],
      contentText: 'Morning\nDebo journal testing.',
      tags: ['reflection', 'morning'],
    });

    expect(entry.id).toMatch(/^jrn_/);
    expect(entry.workspaceId).toBe('wsp_tenant_1');
    expect(entry.userId).toBe('usr_user_1');
    expect(entry.title).toBe('First Morning Reflection');
    expect(entry.tags).toEqual(['reflection', 'morning']);
    expect(entry.contentText).toContain('Debo journal testing');
  });
});
