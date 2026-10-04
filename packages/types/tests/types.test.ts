import { describe, expect, it } from 'bun:test';
import {
  DeboError,
  ForbiddenError,
  NotFoundError,
  TenantMismatchError,
  UnauthorizedError,
  err,
  ok,
} from '../src/index';

describe('@debo/types', () => {
  it('instantiates and serializes DeboError correctly', () => {
    const error = new DeboError({
      code: 'VALIDATION_FAILED',
      message: 'Invalid title',
      statusCode: 400,
      workspaceId: 'wsp_123',
    });

    expect(error.name).toBe('DeboError');
    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.statusCode).toBe(400);
    expect(error.workspaceId).toBe('wsp_123');

    const json = error.toJSON();
    expect(json.code).toBe('VALIDATION_FAILED');
    expect(json.message).toBe('Invalid title');
  });

  it('correctly handles specific error subtypes', () => {
    const unauth = new UnauthorizedError();
    expect(unauth.statusCode).toBe(401);
    expect(unauth.code).toBe('UNAUTHENTICATED');

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);

    const notFound = new NotFoundError('Source', 'src_999');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.target).toBe('src_999');

    const tenantMismatch = new TenantMismatchError('wsp_abc', 'wsp_xyz');
    expect(tenantMismatch.code).toBe('TENANT_MISMATCH');
    expect(tenantMismatch.statusCode).toBe(403);
  });

  it('correctly wraps Result ok and err monads', () => {
    const successResult = ok({ id: 'mem_1' });
    expect(successResult.ok).toBe(true);
    if (successResult.ok) {
      expect(successResult.value.id).toBe('mem_1');
    }

    const failResult = err(new NotFoundError('Memory', 'mem_1'));
    expect(failResult.ok).toBe(false);
    if (!failResult.ok) {
      expect(failResult.error.code).toBe('NOT_FOUND');
    }
  });
});
