import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { workspaces } from './workspaces';

export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id').primaryKey(), // key_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    keyHash: text('key_hash').notNull().unique(),
    keyPrefix: text('key_prefix').notNull(),
    scopes: jsonb('scopes').default(['read', 'write']).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('api_keys_workspace_idx').on(table.workspaceId),
    index('api_keys_hash_idx').on(table.keyHash),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    id: text('id').primaryKey(), // ses_*
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    activeWorkspaceId: text('active_workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('user_sessions_user_idx').on(table.userId),
    index('user_sessions_token_idx').on(table.tokenHash),
  ],
);
