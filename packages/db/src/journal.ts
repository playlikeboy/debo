import { TenantMismatchError, UnauthorizedError } from '@debo/types';
import type { BlockNoteBlock, JournalEntry, TenantContext } from '@debo/types';
import { and, desc, eq } from 'drizzle-orm';
import type { DeboDatabase } from './client';
import { journalEntries } from './schema/journal';

export interface CreateJournalEntryInput {
  title: string;
  contentJson: BlockNoteBlock[] | unknown[];
  contentText: string;
  tags?: string[];
  sourceId?: string;
}

export interface UpdateJournalEntryInput {
  title?: string;
  contentJson?: BlockNoteBlock[] | unknown[];
  contentText?: string;
  tags?: string[];
}

export class JournalRepository {
  constructor(private readonly db: DeboDatabase) {}

  async createEntry(
    ctx: TenantContext,
    input: CreateJournalEntryInput,
  ): Promise<JournalEntry> {
    if (!ctx.workspaceId || !ctx.userId) {
      throw new UnauthorizedError('TenantContext must include workspaceId and userId');
    }

    const id = `jrn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();

    const [created] = await this.db
      .insert(journalEntries)
      .values({
        id,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        title: input.title.trim() || 'Untitled Entry',
        contentJson: input.contentJson,
        contentText: input.contentText,
        tags: input.tags || [],
        sourceId: input.sourceId ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create journal entry');
    }

    return {
      id: created.id,
      workspaceId: created.workspaceId,
      userId: created.userId,
      title: created.title,
      contentJson: created.contentJson as BlockNoteBlock[],
      contentText: created.contentText,
      sourceId: created.sourceId ?? undefined,
      tags: created.tags as string[],
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async getEntry(ctx: TenantContext, id: string): Promise<JournalEntry | null> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const rows = await this.db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.workspaceId, ctx.workspaceId)))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      userId: row.userId,
      title: row.title,
      contentJson: row.contentJson as BlockNoteBlock[],
      contentText: row.contentText,
      sourceId: row.sourceId ?? undefined,
      tags: row.tags as string[],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async listEntries(
    ctx: TenantContext,
    options: { limit?: number; offset?: number } = {},
  ): Promise<JournalEntry[]> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    const rows = await this.db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.workspaceId, ctx.workspaceId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map(r => ({
      id: r.id,
      workspaceId: r.workspaceId,
      userId: r.userId,
      title: r.title,
      contentJson: r.contentJson as BlockNoteBlock[],
      contentText: r.contentText,
      sourceId: r.sourceId ?? undefined,
      tags: r.tags as string[],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async updateEntry(
    ctx: TenantContext,
    id: string,
    input: UpdateJournalEntryInput,
  ): Promise<JournalEntry> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const existing = await this.getEntry(ctx, id);
    if (!existing) {
      throw new Error(`Journal entry '${id}' not found in workspace '${ctx.workspaceId}'`);
    }

    if (existing.workspaceId !== ctx.workspaceId) {
      throw new TenantMismatchError(existing.workspaceId, ctx.workspaceId);
    }

    const updateValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (input.title !== undefined) updateValues.title = input.title;
    if (input.contentJson !== undefined) updateValues.contentJson = input.contentJson;
    if (input.contentText !== undefined) updateValues.contentText = input.contentText;
    if (input.tags !== undefined) updateValues.tags = input.tags;

    const [updated] = await this.db
      .update(journalEntries)
      .set(updateValues)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.workspaceId, ctx.workspaceId)))
      .returning();

    if (!updated) {
      throw new Error(`Failed to update journal entry '${id}'`);
    }

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      userId: updated.userId,
      title: updated.title,
      contentJson: updated.contentJson as BlockNoteBlock[],
      contentText: updated.contentText,
      sourceId: updated.sourceId ?? undefined,
      tags: updated.tags as string[],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteEntry(ctx: TenantContext, id: string): Promise<boolean> {
    if (!ctx.workspaceId) {
      throw new UnauthorizedError('workspaceId is required');
    }

    const result = await this.db
      .delete(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.workspaceId, ctx.workspaceId)))
      .returning({ id: journalEntries.id });

    return result.length > 0;
  }
}
