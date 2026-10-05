import { ForbiddenError } from '@debo/types';

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanQuota {
  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  maxApiKeysPerWorkspace: number;
  apiKeyRateLimitRpm: number;
  auditRetentionDays: number;
  features: {
    customConnectors: boolean;
    sso: boolean;
    streamingAuditExport: boolean;
  };
}

export const PLAN_QUOTAS: Record<PlanType, PlanQuota> = {
  free: {
    maxWorkspaces: 2, // 1 Personal + 1 Team
    maxMembersPerWorkspace: 3,
    maxApiKeysPerWorkspace: 3,
    apiKeyRateLimitRpm: 60,
    auditRetentionDays: 90,
    features: {
      customConnectors: false,
      sso: false,
      streamingAuditExport: false,
    },
  },
  pro: {
    maxWorkspaces: 5,
    maxMembersPerWorkspace: 25,
    maxApiKeysPerWorkspace: 15,
    apiKeyRateLimitRpm: 300,
    auditRetentionDays: 365,
    features: {
      customConnectors: true,
      sso: false,
      streamingAuditExport: false,
    },
  },
  enterprise: {
    maxWorkspaces: Infinity,
    maxMembersPerWorkspace: Infinity,
    maxApiKeysPerWorkspace: Infinity,
    apiKeyRateLimitRpm: 1200,
    auditRetentionDays: 3650, // 10 years / unlimited
    features: {
      customConnectors: true,
      sso: true,
      streamingAuditExport: true,
    },
  },
};

export function getPlanQuotas(plan: PlanType = 'free'): PlanQuota {
  return PLAN_QUOTAS[plan] || PLAN_QUOTAS.free;
}

export function assertPlanFeature(plan: PlanType, feature: keyof PlanQuota['features']): void {
  const quotas = getPlanQuotas(plan);
  if (!quotas.features[feature]) {
    throw new ForbiddenError(
      `Feature '${String(feature)}' is not available on the '${plan}' plan. Please upgrade to Pro or Enterprise.`,
    );
  }
}

export function assertPlanLimit(
  plan: PlanType,
  limitType: 'workspaces' | 'members' | 'apiKeys',
  currentCount: number,
): void {
  const quotas = getPlanQuotas(plan);
  let max = Infinity;

  if (limitType === 'workspaces') max = quotas.maxWorkspaces;
  else if (limitType === 'members') max = quotas.maxMembersPerWorkspace;
  else if (limitType === 'apiKeys') max = quotas.maxApiKeysPerWorkspace;

  if (currentCount >= max) {
    throw new ForbiddenError(
      `Plan '${plan}' limit reached for ${limitType} (current: ${currentCount}, maximum: ${max}). Please upgrade your plan.`,
    );
  }
}
