/**
 * Debo Phase 14: Distributed Tracing & Observability
 * Implements OpenTelemetry-compatible tracing, tenant-scoped spans,
 * and LangSmith metadata bridges.
 */

import type { TenantContext } from '@debo/types';

export interface DeboSpanAttributes extends Record<string, unknown> {
  'tenant.workspace_id'?: string;
  'tenant.user_id'?: string;
  'tenant.role'?: string;
  'service.name'?: string;
  'agent.node'?: string;
  'workflow.task'?: string;
  'db.operation'?: string;
  'http.status_code'?: number;
}

export class DeboSpan {
  public readonly traceId: string;
  public readonly spanId: string;
  public readonly parentSpanId?: string;
  public readonly startTime: number;
  public endTime?: number;
  public status: 'OK' | 'ERROR' = 'OK';
  public errorMessage?: string;
  public attributes: DeboSpanAttributes = {};

  constructor(
    public readonly name: string,
    options: {
      traceId?: string;
      parentSpanId?: string;
      attributes?: DeboSpanAttributes;
    } = {},
  ) {
    this.traceId = options.traceId || `trc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    this.spanId = `spn_${Math.random().toString(36).slice(2, 10)}`;
    this.parentSpanId = options.parentSpanId;
    this.startTime = Date.now();
    if (options.attributes) {
      this.attributes = { ...options.attributes };
    }
  }

  setAttribute(key: string, value: unknown): this {
    this.attributes[key] = value;
    return this;
  }

  setAttributes(attrs: Record<string, unknown>): this {
    Object.assign(this.attributes, attrs);
    return this;
  }

  recordException(err: unknown): this {
    this.status = 'ERROR';
    this.errorMessage = err instanceof Error ? err.message : String(err);
    this.setAttribute('error.message', this.errorMessage);
    return this;
  }

  end(): void {
    if (!this.endTime) {
      this.endTime = Date.now();
    }
  }

  get durationMs(): number {
    return (this.endTime ?? Date.now()) - this.startTime;
  }

  toJSON() {
    return {
      name: this.name,
      traceId: this.traceId,
      spanId: this.spanId,
      parentSpanId: this.parentSpanId,
      startTime: this.startTime,
      endTime: this.endTime,
      durationMs: this.durationMs,
      status: this.status,
      errorMessage: this.errorMessage,
      attributes: this.attributes,
    };
  }
}

export class DeboTracer {
  private spans: DeboSpan[] = [];

  constructor(public readonly serviceName: string = 'debo-service') {}

  startSpan(
    name: string,
    options: {
      context?: TenantContext;
      parentSpan?: DeboSpan;
      parentSpanId?: string;
      attributes?: DeboSpanAttributes;
    } = {},
  ): DeboSpan {
    const parentSpanId = options.parentSpan?.spanId || options.parentSpanId;
    const traceId = options.parentSpan?.traceId;

    const span = new DeboSpan(name, {
      traceId,
      parentSpanId,
      attributes: {
        'service.name': this.serviceName,
        ...(options.context
          ? {
              'tenant.workspace_id': options.context.workspaceId,
              'tenant.user_id': options.context.userId,
              'tenant.role': options.context.role,
            }
          : {}),
        ...options.attributes,
      },
    });

    this.spans.push(span);
    return span;
  }

  async withSpan<T>(
    name: string,
    options: {
      context?: TenantContext;
      parentSpan?: DeboSpan;
      attributes?: DeboSpanAttributes;
    },
    fn: (span: DeboSpan) => Promise<T> | T,
  ): Promise<T> {
    const span = this.startSpan(name, options);
    try {
      const result = await fn(span);
      span.end();
      return result;
    } catch (err) {
      span.recordException(err);
      span.end();
      throw err;
    }
  }

  getCompletedSpans(): DeboSpan[] {
    return this.spans.filter(s => s.endTime !== undefined);
  }

  getAllSpans(): DeboSpan[] {
    return [...this.spans];
  }

  clear(): void {
    this.spans = [];
  }
}

export const tracer = new DeboTracer('debo-core');

/**
 * Builds metadata tags required by LangSmith & LangGraph for tracking agent runs
 */
export function buildLangSmithMetadata(
  context: TenantContext,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    workspace_id: context.workspaceId,
    user_id: context.userId,
    tenant_role: context.role,
    runtime: 'langgraph-js',
    environment: process.env.NODE_ENV || 'development',
    ...extra,
  };
}
