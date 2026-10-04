import { ForbiddenError, TenantMismatchError, type TenantContext } from '@debo/types';
import { type Role, hasMinimumRole } from './roles';

export type Action = 'read' | 'write' | 'delete' | 'admin' | 'export' | 'approve';

export type ResourceType =
  'workspace' | 'source' | 'memory' | 'citation' | 'apiKey' | 'connector' | 'workflow';

const ACTION_ROLE_MAP: Record<Action, Role> = {
  read: 'guest',
  write: 'member',
  delete: 'admin',
  admin: 'admin',
  export: 'admin',
  approve: 'member',
};

export function enforceTenantIsolation(context: TenantContext, resourceWorkspaceId: string): void {
  if (context.workspaceId !== resourceWorkspaceId) {
    throw new TenantMismatchError(resourceWorkspaceId, context.workspaceId);
  }
}

export function can(context: TenantContext, action: Action, resourceWorkspaceId?: string): boolean {
  if (resourceWorkspaceId && context.workspaceId !== resourceWorkspaceId) {
    return false;
  }

  const requiredRole = ACTION_ROLE_MAP[action];
  if (!requiredRole) {
    return false;
  }

  return hasMinimumRole(context, requiredRole);
}

export function assertCan(
  context: TenantContext,
  action: Action,
  resourceWorkspaceId?: string,
): void {
  if (resourceWorkspaceId) {
    enforceTenantIsolation(context, resourceWorkspaceId);
  }

  if (!can(context, action, resourceWorkspaceId)) {
    throw new ForbiddenError(
      `Role '${context.role}' in workspace '${context.workspaceId}' lacks permission for '${action}'`,
    );
  }
}
