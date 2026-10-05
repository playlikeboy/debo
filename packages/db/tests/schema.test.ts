import { describe, expect, it } from 'bun:test';
import {
  accounts,
  apiKeys,
  auditLogs,
  citations,
  journalEntries,
  memories,
  sourceChunks,
  sources,
  toolApprovals,
  userSessions,
  users,
  verifications,
  workspaceMembers,
  workspaces,
} from '../src/index';

describe('@debo/db schema definition', () => {
  it('defines all core relational entities', () => {
    expect(users).toBeDefined();
    expect(workspaces).toBeDefined();
    expect(workspaceMembers).toBeDefined();
    expect(sources).toBeDefined();
    expect(sourceChunks).toBeDefined();
    expect(memories).toBeDefined();
    expect(citations).toBeDefined();
    expect(auditLogs).toBeDefined();
    expect(apiKeys).toBeDefined();
    expect(toolApprovals).toBeDefined();
    expect(userSessions).toBeDefined();
    expect(accounts).toBeDefined();
    expect(verifications).toBeDefined();
    expect(journalEntries).toBeDefined();
  });

  it('enforces workspaceId tenant key on multi-tenant tables', () => {
    // Multi-tenant tables must have workspace_id column
    expect(sources.workspaceId).toBeDefined();
    expect(sourceChunks.workspaceId).toBeDefined();
    expect(memories.workspaceId).toBeDefined();
    expect(citations.workspaceId).toBeDefined();
    expect(auditLogs.workspaceId).toBeDefined();
    expect(apiKeys.workspaceId).toBeDefined();
    expect(toolApprovals.workspaceId).toBeDefined();
    expect(workspaceMembers.workspaceId).toBeDefined();
    expect(journalEntries.workspaceId).toBeDefined();
    expect(journalEntries.userId).toBeDefined();
  });

  it('verifies primary key definitions', () => {
    expect(users.id).toBeDefined();
    expect(workspaces.id).toBeDefined();
    expect(sources.id).toBeDefined();
    expect(memories.id).toBeDefined();
  });
});
