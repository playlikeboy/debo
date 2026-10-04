/**
 * Debo Standard Error Hierarchy
 * All operational and domain errors inherit from DeboError.
 */

export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_FAILED'
  | 'TENANT_MISMATCH'
  | 'RATE_LIMITED'
  | 'PROVIDER_ERROR'
  | 'DEGRADED_MODE'
  | 'INTERNAL_ERROR';

export interface DeboErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  workspaceId?: string;
  userId?: string;
  target?: string;
  meta?: Record<string, unknown>;
}

export class DeboError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly workspaceId?: string;
  public readonly userId?: string;
  public readonly target?: string;
  public readonly meta?: Record<string, unknown>;

  constructor(details: DeboErrorDetails) {
    super(details.message);
    this.name = 'DeboError';
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.workspaceId = details.workspaceId;
    this.userId = details.userId;
    this.target = details.target;
    this.meta = details.meta;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      workspaceId: this.workspaceId,
      userId: this.userId,
      target: this.target,
      meta: this.meta,
    };
  }
}

export class UnauthorizedError extends DeboError {
  constructor(message = 'Authentication required', meta?: Record<string, unknown>) {
    super({ code: 'UNAUTHENTICATED', message, statusCode: 401, meta });
  }
}

export class ForbiddenError extends DeboError {
  constructor(
    message = 'Access forbidden for current tenant context',
    meta?: Record<string, unknown>,
  ) {
    super({ code: 'FORBIDDEN', message, statusCode: 403, meta });
  }
}

export class TenantMismatchError extends DeboError {
  constructor(expected: string, actual?: string) {
    super({
      code: 'TENANT_MISMATCH',
      message: `Cross-tenant violation: target belongs to workspace ${expected}, but context was ${actual || 'unspecified'}`,
      statusCode: 403,
      workspaceId: expected,
    });
  }
}

export class NotFoundError extends DeboError {
  constructor(resource: string, id: string) {
    super({
      code: 'NOT_FOUND',
      message: `${resource} with ID '${id}' was not found`,
      statusCode: 404,
      target: id,
    });
  }
}

export class ValidationError extends DeboError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super({ code: 'VALIDATION_FAILED', message, statusCode: 400, meta });
  }
}
