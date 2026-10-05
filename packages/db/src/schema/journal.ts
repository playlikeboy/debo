import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { sources } from './sources';
import { users } from './users';
import { workspaces } from './workspaces';

export const journalEntries = pgTable(
  'journal_entries',
  {
    id: text('id').primaryKey(), // jrn_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    contentJson: jsonb('content_json').default([]).notNull(), // BlockNote JSON block array
    contentText: text('content_text').default('').notNull(), // Extracted plain text for indexing & search
    sourceId: text('source_id').references(() => sources.id, { onDelete: 'set null' }),
    tags: jsonb('tags').default([]).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('journal_entries_workspace_idx').on(table.workspaceId),
    index('journal_entries_user_idx').on(table.userId),
    index('journal_entries_workspace_created_idx').on(table.workspaceId, table.createdAt),
  ],
);
