import { TenantMismatchError, UnauthorizedError } from '@debo/types';
import {
  CompensationFunction,
  DEFAULT_RETRY_POLICY,
  RetryPolicy,
  TaskContext,
  TaskExecutionError,
  WorkflowTask,
} from './task';

export interface TaskRunRecord<TOutput = unknown> {
  runId: string;
  taskId: string;
  workspaceId: string;
  userId?: string;
  idempotencyKey: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED';
  output?: TOutput;
  error?: string;
  attempts: number;
  stepResults: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class TaskExecutor {
  private runs = new Map<string, TaskRunRecord>(); // keyed by idempotencyKey
  private tasks = new Map<string, WorkflowTask<unknown, unknown>>();

  registerTask<TInput, TOutput>(task: WorkflowTask<TInput, TOutput>): void {
    this.tasks.set(task.id, task as WorkflowTask<unknown, unknown>);
  }

  getTask(id: string): WorkflowTask<unknown, unknown> | undefined {
    return this.tasks.get(id);
  }

  async execute<TInput, TOutput>(params: {
    taskId: string;
    workspaceId: string;
    userId?: string;
    idempotencyKey: string;
    input: TInput;
  }): Promise<TOutput> {
    if (!params.workspaceId) {
      throw new UnauthorizedError('workspaceId is required for workflow execution');
    }

    const task = this.tasks.get(params.taskId);
    if (!task) {
      throw new TaskExecutionError(
        `Task with id '${params.taskId}' is not registered`,
        params.taskId,
        'unassigned',
        0,
      );
    }

    // Check idempotency cache
    const existing = this.runs.get(params.idempotencyKey);
    if (existing) {
      if (existing.workspaceId !== params.workspaceId) {
        throw new TenantMismatchError(existing.workspaceId, params.workspaceId);
      }
      if (existing.status === 'COMPLETED') {
        return existing.output as TOutput;
      }
      if (existing.status === 'RUNNING') {
        throw new TaskExecutionError(
          `Task '${params.taskId}' is currently executing for key '${params.idempotencyKey}'`,
          params.taskId,
          existing.runId,
          existing.attempts,
        );
      }
    }

    const runId = existing ? existing.runId : `run_${crypto.randomUUID().replace(/-/g, '')}`;
    const policy: RetryPolicy = {
      ...DEFAULT_RETRY_POLICY,
      ...task.retryPolicy,
    };

    const runRecord: TaskRunRecord<TOutput> = existing
      ? (existing as TaskRunRecord<TOutput>)
      : {
          runId,
          taskId: params.taskId,
          workspaceId: params.workspaceId,
          userId: params.userId,
          idempotencyKey: params.idempotencyKey,
          status: 'RUNNING',
          attempts: 0,
          stepResults: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    runRecord.status = 'RUNNING';
    this.runs.set(params.idempotencyKey, runRecord as TaskRunRecord<unknown>);

    const compensations: CompensationFunction[] = [];

    const ctx: TaskContext = {
      workspaceId: params.workspaceId,
      userId: params.userId,
      runId,
      attempt: runRecord.attempts + 1,
      idempotencyKey: params.idempotencyKey,
      runStep: async <R>(stepName: string, fn: () => Promise<R>): Promise<R> => {
        if (stepName in runRecord.stepResults) {
          return runRecord.stepResults[stepName] as R;
        }
        const res = await fn();
        runRecord.stepResults[stepName] = res;
        return res;
      },
      registerCompensation: (fn: CompensationFunction) => {
        compensations.push(fn);
      },
      log: (_message: string, _meta?: Record<string, unknown>) => {
        // Structured workflow telemetry hook
      },
    };

    let lastError: unknown;

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      runRecord.attempts = attempt;
      ctx.attempt = attempt;
      compensations.length = 0; // Clear per-attempt compensations before retry

      try {
        const result = (await task.run(ctx, params.input)) as TOutput;
        runRecord.status = 'COMPLETED';
        runRecord.output = result;
        runRecord.updatedAt = new Date().toISOString();
        return result;
      } catch (err) {
        lastError = err;
        if (attempt < policy.maxAttempts) {
          const delay = Math.min(
            policy.initialIntervalMs * Math.pow(policy.backoffFactor, attempt - 1),
            policy.maxIntervalMs,
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Workflow failed after max attempts: execute compensations in reverse order
    runRecord.status = 'FAILED';
    runRecord.error = lastError instanceof Error ? lastError.message : String(lastError);
    runRecord.updatedAt = new Date().toISOString();

    if (compensations.length > 0) {
      try {
        for (let i = compensations.length - 1; i >= 0; i--) {
          await compensations[i]!();
        }
        runRecord.status = 'COMPENSATED';
      } catch (compErr) {
        runRecord.error = `Failure with compensation failure: ${compErr}`;
      }
    }

    throw new TaskExecutionError(
      `Task '${params.taskId}' failed after ${policy.maxAttempts} attempts: ${runRecord.error}`,
      params.taskId,
      runId,
      runRecord.attempts,
      lastError,
    );
  }

  getRunRecord(idempotencyKey: string): TaskRunRecord | undefined {
    return this.runs.get(idempotencyKey);
  }
}
