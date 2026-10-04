import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const workspaces = pgTable(
  'workspaces',
  {
    id: text('id').primaryKey(), // wsp_*
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plan: text('plan', { enum: ['free', 'pro', 'enterprise'] })
      .default('free')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index('workspaces_owner_idx').on(table.ownerId)],
);

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id').primaryKey(), // wmb_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin', 'member', 'guest'] })
      .default('member')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('workspace_members_user_idx').on(table.userId),
    index('workspace_members_workspace_idx').on(table.workspaceId),
  ],
);
