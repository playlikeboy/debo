import type { TenantContext } from '@debo/types';

export type Role = 'owner' | 'admin' | 'member' | 'guest';

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  guest: 10,
};

export function hasMinimumRole(context: TenantContext, minRole: Role): boolean {
  const currentLevel = ROLE_HIERARCHY[context.role] ?? 0;
  const targetLevel = ROLE_HIERARCHY[minRole] ?? 0;
  return currentLevel >= targetLevel;
}
