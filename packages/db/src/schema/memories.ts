import { index, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';
import { sources } from './sources';
import { workspaces } from './workspaces';

export const memories = pgTable(
  'memories',
  {
    id: text('id').primaryKey(), // mem_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    sourceId: text('source_id').references(() => sources.id, { onDelete: 'set null' }),
    type: text('type', {
      enum: ['semantic', 'episodic', 'declarative', 'procedural'],
    })
      .default('semantic')
      .notNull(),
    content: text('content').notNull(),
    confidence: real('confidence').default(1.0).notNull(),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    supersededBy: text('superseded_by'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('memories_workspace_idx').on(table.workspaceId),
    index('memories_workspace_type_idx').on(table.workspaceId, table.type),
    index('memories_source_idx').on(table.sourceId),
  ],
);
