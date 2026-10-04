import { describe, expect, it } from 'bun:test';
import type { TenantContext } from '@debo/types';
import {
  assertCan,
  authorizeToolExecution,
  can,
  enforceTenantIsolation,
  hasMinimumRole,
} from '../src/index';

describe('@debo/permissions engine', () => {
  const ownerContext: TenantContext = {
    workspaceId: 'wsp_main',
    userId: 'usr_alice',
    role: 'owner',
  };

  const memberContext: TenantContext = {
    workspaceId: 'wsp_main',
    userId: 'usr_bob',
    role: 'member',
  };

  const guestContext: TenantContext = {
    workspaceId: 'wsp_main',
    userId: 'usr_charlie',
    role: 'guest',
  };

  it('enforces role hierarchies correctly', () => {
    expect(hasMinimumRole(ownerContext, 'admin')).toBe(true);
    expect(hasMinimumRole(memberContext, 'admin')).toBe(false);
    expect(hasMinimumRole(memberContext, 'member')).toBe(true);
    expect(hasMinimumRole(guestContext, 'member')).toBe(false);
    expect(hasMinimumRole(guestContext, 'guest')).toBe(true);
  });

  it('verifies tenant isolation and rejects cross-workspace access', () => {
    expect(() => {
      enforceTenantIsolation(ownerContext, 'wsp_attacker');
    }).toThrow('Cross-tenant violation');

    expect(can(ownerContext, 'read', 'wsp_other')).toBe(false);
    expect(can(ownerContext, 'read', 'wsp_main')).toBe(true);
  });

  it('evaluates action permissions by role', () => {
    // Read: allowed for all
    expect(can(guestContext, 'read')).toBe(true);
    expect(can(memberContext, 'read')).toBe(true);

    // Write: member+ only
    expect(can(guestContext, 'write')).toBe(false);
    expect(can(memberContext, 'write')).toBe(true);

    // Delete: admin+ only
    expect(can(memberContext, 'delete')).toBe(false);
    expect(can(ownerContext, 'delete')).toBe(true);

    expect(() => {
      assertCan(guestContext, 'write');
    }).toThrow('lacks permission');
  });

  it('authorizes tool execution and requires human approval for destructive actions', () => {
    // Read tool: no approval required
    const readToolAuth = authorizeToolExecution(memberContext, {
      name: 'search_memories',
      riskClass: 'READ',
      requiredRole: 'member',
    });
    expect(readToolAuth.authorized).toBe(true);
    expect(readToolAuth.requiresApproval).toBe(false);

    // Destructive tool: requires approval
    const destructiveToolAuth = authorizeToolExecution(memberContext, {
      name: 'delete_memory_source',
      riskClass: 'DESTRUCTIVE',
      requiredRole: 'member',
    });
    expect(destructiveToolAuth.authorized).toBe(true);
    expect(destructiveToolAuth.requiresApproval).toBe(true);

    // Insufficient role rejects tool execution
    expect(() => {
      authorizeToolExecution(guestContext, {
        name: 'write_journal',
        riskClass: 'LOW_WRITE',
        requiredRole: 'member',
      });
    }).toThrow('requires role');
  });
});
