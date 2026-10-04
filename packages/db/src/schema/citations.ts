import { index, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';
import { sourceChunks, sources } from './sources';
import { workspaces } from './workspaces';

export const citations = pgTable(
  'citations',
  {
    id: text('id').primaryKey(), // cit_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    sourceId: text('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'cascade' }),
    chunkId: text('chunk_id').references(() => sourceChunks.id, { onDelete: 'set null' }),
    quote: text('quote').notNull(),
    provenance: jsonb('provenance').default({}).notNull(),
    confidence: real('confidence').default(1.0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('citations_workspace_idx').on(table.workspaceId),
    index('citations_source_idx').on(table.sourceId),
  ],
);
