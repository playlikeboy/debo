import { TenantMismatchError } from '@debo/types';
import { AgentState } from './state';

export interface CheckpointRecord {
  checkpointId: string;
  threadId: string;
  workspaceId: string;
  step: number;
  state: AgentState;
  createdAt: string;
}

export interface AgentCheckpointer {
  save(state: AgentState): Promise<CheckpointRecord>;
  getLatest(workspaceId: string, threadId: string): Promise<AgentState | undefined>;
  getHistory(workspaceId: string, threadId: string): Promise<CheckpointRecord[]>;
}

export class MemoryCheckpointer implements AgentCheckpointer {
  private checkpoints = new Map<string, CheckpointRecord[]>(); // keyed by threadId

  async save(state: AgentState): Promise<CheckpointRecord> {
    const record: CheckpointRecord = {
      checkpointId: `chk_${crypto.randomUUID().replace(/-/g, '')}`,
      threadId: state.threadId,
      workspaceId: state.workspaceId,
      step: state.stepCount,
      state: JSON.parse(JSON.stringify(state)),
      createdAt: new Date().toISOString(),
    };

    const history = this.checkpoints.get(state.threadId) ?? [];
    history.push(record);
    this.checkpoints.set(state.threadId, history);

    return record;
  }

  async getLatest(workspaceId: string, threadId: string): Promise<AgentState | undefined> {
    const history = this.checkpoints.get(threadId);
    if (!history || history.length === 0) {
      return undefined;
    }

    const latest = history[history.length - 1]!;
    if (latest.workspaceId !== workspaceId) {
      throw new TenantMismatchError(latest.workspaceId, workspaceId);
    }

    return latest.state;
  }

  async getHistory(workspaceId: string, threadId: string): Promise<CheckpointRecord[]> {
    const history = this.checkpoints.get(threadId);
    if (!history || history.length === 0) {
      return [];
    }

    if (history[0]!.workspaceId !== workspaceId) {
      throw new TenantMismatchError(history[0]!.workspaceId, workspaceId);
    }

    return history;
  }
}
