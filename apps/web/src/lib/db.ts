import { createDbClient, JournalRepository } from '@debo/db';
import type { DeboDatabase } from '@debo/db';

let dbInstance: DeboDatabase | null = null;
let journalRepoInstance: JournalRepository | null = null;

export function getDb(): DeboDatabase | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }

  if (!dbInstance) {
    dbInstance = createDbClient(databaseUrl);
  }
  return dbInstance;
}

// In-memory journal fallback for local dev when DATABASE_URL is not set
class InMemoryJournalStore {
  private entries: any[] = [];

  async createEntry(ctx: { workspaceId: string; userId: string }, input: any) {
    const entry = {
      id: `jrn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      workspaceId: ctx.workspaceId,
      userId: ctx.userId,
      title: input.title || 'Untitled Entry',
      contentJson: input.contentJson || [],
      contentText: input.contentText || '',
      tags: input.tags || [],
      sourceId: input.sourceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.entries.unshift(entry);
    return entry;
  }

  async getEntry(ctx: { workspaceId: string }, id: string) {
    return this.entries.find(e => e.id === id && e.workspaceId === ctx.workspaceId) || null;
  }

  async listEntries(ctx: { workspaceId: string }, _options?: any) {
    return this.entries.filter(e => e.workspaceId === ctx.workspaceId);
  }

  async updateEntry(ctx: { workspaceId: string }, id: string, input: any) {
    const entry = await this.getEntry(ctx, id);
    if (!entry) throw new Error(`Entry ${id} not found`);
    if (input.title !== undefined) entry.title = input.title;
    if (input.contentJson !== undefined) entry.contentJson = input.contentJson;
    if (input.contentText !== undefined) entry.contentText = input.contentText;
    if (input.tags !== undefined) entry.tags = input.tags;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  async deleteEntry(ctx: { workspaceId: string }, id: string) {
    const idx = this.entries.findIndex(e => e.id === id && e.workspaceId === ctx.workspaceId);
    if (idx !== -1) {
      this.entries.splice(idx, 1);
      return true;
    }
    return false;
  }
}

const memoryStore = new InMemoryJournalStore();

export function getJournalRepository(): JournalRepository | InMemoryJournalStore {
  const db = getDb();
  if (db) {
    if (!journalRepoInstance) {
      journalRepoInstance = new JournalRepository(db);
    }
    return journalRepoInstance;
  }
  return memoryStore;
}
