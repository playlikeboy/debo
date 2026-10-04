import { describe, expect, it } from 'bun:test';
import { TenantMismatchError, UnauthorizedError } from '@debo/types';
import { createDeboEvent, DeboEventSchema, SourceCreatedPayload } from '../src/events';
import { TaskExecutor } from '../src/executor';
import { TaskContext, WorkflowTask } from '../src/task';

describe('@debo/workflows engine', () => {
  it('creates and validates standard DeboEvent envelope', () => {
    const event = createDeboEvent<SourceCreatedPayload>({
      name: 'source.created',
      workspaceId: 'ws_123',
      userId: 'usr_456',
      payload: {
        sourceId: 'src_789',
        storageKey: 'ws_123/src_789/doc.pdf',
        mimeType: 'application/pdf',
        byteSize: 1024,
      },
    });

    expect(event.eventId.startsWith('evt_')).toBe(true);
    expect(event.name).toBe('source.created');
    expect(event.workspaceId).toBe('ws_123');
    expect(event.userId).toBe('usr_456');
    expect(event.payload.byteSize).toBe(1024);

    const parsed = DeboEventSchema.safeParse(event);
    expect(parsed.success).toBe(true);
  });

  it('executes workflow tasks idempotently', async () => {
    const executor = new TaskExecutor();
    let executions = 0;

    const task: WorkflowTask<{ value: number }, { doubled: number }> = {
      id: 'math.double',
      run: async (_ctx: TaskContext, input: { value: number }) => {
        executions++;
        return { doubled: input.value * 2 };
      },
    };

    executor.registerTask(task);

    const res1 = await executor.execute({
      taskId: 'math.double',
      workspaceId: 'ws_123',
      idempotencyKey: 'math_key_1',
      input: { value: 10 },
    });

    expect(res1.doubled).toBe(20);
    expect(executions).toBe(1);

    // Replay with identical idempotencyKey
    const res2 = await executor.execute({
      taskId: 'math.double',
      workspaceId: 'ws_123',
      idempotencyKey: 'math_key_1',
      input: { value: 10 },
    });

    expect(res2.doubled).toBe(20);
    expect(executions).toBe(1); // Cached, no second execution
  });

  it('memoizes intermediate steps during workflow runs', async () => {
    const executor = new TaskExecutor();
    let stepCount = 0;

    const task: WorkflowTask<void, string> = {
      id: 'step.test',
      run: async (ctx: TaskContext) => {
        const step1 = await ctx.runStep('step_1', async () => {
          stepCount++;
          return 'value_1';
        });
        return step1;
      },
    };

    executor.registerTask(task);

    await executor.execute({
      taskId: 'step.test',
      workspaceId: 'ws_123',
      idempotencyKey: 'step_key_1',
      input: undefined,
    });

    expect(stepCount).toBe(1);
  });

  it('retries transient failures according to retry policy', async () => {
    const executor = new TaskExecutor();
    let attempts = 0;

    const task: WorkflowTask<void, string> = {
      id: 'retry.test',
      retryPolicy: {
        maxAttempts: 3,
        initialIntervalMs: 10,
        backoffFactor: 1.5,
        maxIntervalMs: 50,
      },
      run: async (_ctx: TaskContext) => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary network glitch');
        }
        return 'success_after_retries';
      },
    };

    executor.registerTask(task);

    const result = await executor.execute({
      taskId: 'retry.test',
      workspaceId: 'ws_123',
      idempotencyKey: 'retry_key_1',
      input: undefined,
    });

    expect(result).toBe('success_after_retries');
    expect(attempts).toBe(3);
  });

  it('executes compensations in reverse order on failure', async () => {
    const executor = new TaskExecutor();
    const compensatedSteps: string[] = [];

    const task: WorkflowTask<void, void> = {
      id: 'compensation.test',
      retryPolicy: {
        maxAttempts: 2,
        initialIntervalMs: 5,
        backoffFactor: 1,
        maxIntervalMs: 10,
      },
      run: async (ctx: TaskContext) => {
        ctx.registerCompensation(() => {
          compensatedSteps.push('cleanup_first_step');
        });

        ctx.registerCompensation(() => {
          compensatedSteps.push('cleanup_second_step');
        });

        throw new Error('Unrecoverable downstream crash');
      },
    };

    executor.registerTask(task);

    await expect(
      executor.execute({
        taskId: 'compensation.test',
        workspaceId: 'ws_123',
        idempotencyKey: 'comp_key_1',
        input: undefined,
      }),
    ).rejects.toThrow('failed after 2 attempts');

    // Compensations executed in reverse order
    expect(compensatedSteps).toEqual(['cleanup_second_step', 'cleanup_first_step']);

    const record = executor.getRunRecord('comp_key_1');
    expect(record?.status).toBe('COMPENSATED');
  });

  it('enforces tenant boundaries on workflow execution and prevents cross-tenant replay', async () => {
    const executor = new TaskExecutor();

    const task: WorkflowTask<void, string> = {
      id: 'tenant.test',
      run: async () => 'ok',
    };

    executor.registerTask(task);

    await expect(
      executor.execute({
        taskId: 'tenant.test',
        workspaceId: '',
        idempotencyKey: 'k1',
        input: undefined,
      }),
    ).rejects.toThrow(UnauthorizedError);

    // Initial execution under ws_A
    await executor.execute({
      taskId: 'tenant.test',
      workspaceId: 'ws_A',
      idempotencyKey: 'shared_key',
      input: undefined,
    });

    // Attempting replay under ws_B with same idempotency key must be rejected
    await expect(
      executor.execute({
        taskId: 'tenant.test',
        workspaceId: 'ws_B',
        idempotencyKey: 'shared_key',
        input: undefined,
      }),
    ).rejects.toThrow(TenantMismatchError);
  });
});
