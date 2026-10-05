import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { workspaces } from './workspaces';

// Sessions table (Better Auth session)
export const userSessions = pgTable(
  'user_sessions',
  {
    id: text('id').primaryKey(), // ses_*
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    tokenHash: text('token_hash'),
    activeWorkspaceId: text('active_workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('user_sessions_user_idx').on(table.userId),
    index('user_sessions_token_idx').on(table.token),
  ],
);

export const session = userSessions;

// Accounts table (Better Auth emailAndPassword & OAuth providers)
export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(), // acc_*
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('accounts_user_idx').on(table.userId),
    index('accounts_provider_idx').on(table.providerId, table.accountId),
  ],
);

export const account = accounts;

// Verifications table (Better Auth email verification & password reset tokens)
export const verifications = pgTable(
  'verifications',
  {
    id: text('id').primaryKey(), // ver_*
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index('verifications_identifier_idx').on(table.identifier)],
);

export const verification = verifications;

// API Keys table (Better Auth @better-auth/api-key plugin + Debo workspace tenancy binding)
export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id').primaryKey(), // key_*
    name: text('name').notNull(),
    start: text('start'),
    prefix: text('prefix'),
    key: text('key').notNull(), // Hashed key
    keyHash: text('key_hash'),
    keyPrefix: text('key_prefix'),
    referenceId: text('reference_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    configId: text('config_id').default('default').notNull(),
    permissions: text('permissions'),
    scopes: jsonb('scopes').default(['read', 'write']).notNull(),
    metadata: text('metadata'),
    enabled: boolean('enabled').default(true).notNull(),
    rateLimitEnabled: boolean('rate_limit_enabled').default(true).notNull(),
    rateLimitTimeWindow: integer('rate_limit_time_window').default(60000).notNull(), // 1 minute in ms
    rateLimitMax: integer('rate_limit_max').default(100).notNull(),
    requestCount: integer('request_count').default(0).notNull(),
    remaining: integer('remaining'),
    lastRequest: timestamp('last_request', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('api_keys_workspace_idx').on(table.workspaceId),
    index('api_keys_reference_idx').on(table.referenceId),
    index('api_keys_key_idx').on(table.key),
  ],
);

export const apikey = apiKeys;
