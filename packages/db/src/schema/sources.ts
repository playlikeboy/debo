import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { workspaces } from './workspaces';

export const sources = pgTable(
  'sources',
  {
    id: text('id').primaryKey(), // src_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: ['journal', 'note', 'pdf', 'audio', 'image', 'web', 'email', 'connector'],
    }).notNull(),
    title: text('title').notNull(),
    rawStorageKey: text('raw_storage_key'),
    status: text('status', {
      enum: ['pending', 'processing', 'ready', 'failed'],
    })
      .default('pending')
      .notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('sources_workspace_idx').on(table.workspaceId),
    index('sources_workspace_type_idx').on(table.workspaceId, table.type),
  ],
);

export const sourceChunks = pgTable(
  'source_chunks',
  {
    id: text('id').primaryKey(), // chn_*
    sourceId: text('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    index: integer('index').notNull(),
    content: text('content').notNull(),
    tokenCount: integer('token_count').notNull(),
    provenance: jsonb('provenance').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('source_chunks_source_idx').on(table.sourceId),
    index('source_chunks_workspace_idx').on(table.workspaceId),
  ],
);
