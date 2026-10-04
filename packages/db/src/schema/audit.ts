import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey(), // aud_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorId: text('actor_id').notNull(),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('audit_logs_workspace_idx').on(table.workspaceId),
    index('audit_logs_actor_idx').on(table.actorId),
  ],
);

export const toolApprovals = pgTable(
  'tool_approvals',
  {
    id: text('id').primaryKey(), // app_*
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    agentRunId: text('agent_run_id').notNull(),
    toolName: text('tool_name').notNull(),
    arguments: jsonb('arguments').notNull(),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] })
      .default('pending')
      .notNull(),
    approvedBy: text('approved_by'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('tool_approvals_workspace_idx').on(table.workspaceId),
    index('tool_approvals_run_idx').on(table.agentRunId),
  ],
);
