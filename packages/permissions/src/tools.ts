import { ForbiddenError, type TenantContext } from '@debo/types';

export type RiskClass = 'READ' | 'LOW_WRITE' | 'EXTERNAL_WRITE' | 'DESTRUCTIVE';

export interface ToolSecurityMetadata {
  name: string;
  riskClass: RiskClass;
  requiredRole: 'guest' | 'member' | 'admin' | 'owner';
  requiresHumanApproval?: boolean;
}

export function evaluateToolRisk(metadata: ToolSecurityMetadata): {
  allowed: boolean;
  needsApproval: boolean;
  reason?: string;
} {
  const needsApproval =
    metadata.requiresHumanApproval ||
    metadata.riskClass === 'DESTRUCTIVE' ||
    metadata.riskClass === 'EXTERNAL_WRITE';

  return {
    allowed: true,
    needsApproval,
  };
}

export function authorizeToolExecution(
  context: TenantContext,
  metadata: ToolSecurityMetadata,
): { authorized: true; requiresApproval: boolean } {
  // 1. Verify role
  const roleOrder = ['guest', 'member', 'admin', 'owner'];
  const userRoleIdx = roleOrder.indexOf(context.role);
  const requiredRoleIdx = roleOrder.indexOf(metadata.requiredRole);

  if (userRoleIdx < requiredRoleIdx) {
    throw new ForbiddenError(
      `Execution of tool '${metadata.name}' requires role '${metadata.requiredRole}', but context role is '${context.role}'`,
    );
  }

  // 2. Risk evaluation
  const risk = evaluateToolRisk(metadata);
  return {
    authorized: true,
    requiresApproval: risk.needsApproval,
  };
}
