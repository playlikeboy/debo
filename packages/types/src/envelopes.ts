/**
 * Debo Standard Response & Pagination Envelopes
 */

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId?: string;
    durationMs?: number;
    timestamp: string;
    version: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    target?: string;
    meta?: Record<string, unknown>;
  };
  meta: {
    requestId?: string;
    timestamp: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
