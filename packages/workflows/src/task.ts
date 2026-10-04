import { DeboError } from '@debo/types';

export interface RetryPolicy {
  maxAttempts: number;
  initialIntervalMs: number;
  backoffFactor: number;
  maxIntervalMs: number;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialIntervalMs: 500,
  backoffFactor: 2,
  maxIntervalMs: 5000,
};

export type CompensationFunction = () => Promise<void> | void;

export interface TaskContext {
  workspaceId: string;
  userId?: string;
  runId: string;
  attempt: number;
  idempotencyKey: string;
  runStep: <R>(stepName: string, fn: () => Promise<R>) => Promise<R>;
  registerCompensation: (fn: CompensationFunction) => void;
  log: (message: string, meta?: Record<string, unknown>) => void;
}

export interface WorkflowTask<TInput, TOutput> {
  id: string;
  retryPolicy?: Partial<RetryPolicy>;
  run: (ctx: TaskContext, input: TInput) => Promise<TOutput>;
}

export class TaskExecutionError extends DeboError {
  constructor(
    message: string,
    public readonly taskId: string,
    public readonly runId: string,
    public readonly attempt: number,
    cause?: unknown,
  ) {
    super({
      message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      meta: { taskId, runId, attempt, cause: String(cause) },
    });
    this.name = 'TaskExecutionError';
  }
}
