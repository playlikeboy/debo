import { MemoryService } from '@debo/memory';
import { AgentCheckpointer, MemoryCheckpointer } from './checkpointer';
import { planNode } from './nodes/plan';
import { reasonNode } from './nodes/reason';
import { respondNode } from './nodes/respond';
import { createRetrieveNode } from './nodes/retrieve';
import { validateNode } from './nodes/validate';
import { AgentState, createInitialAgentState } from './state';

export interface GraphExecutionOptions {
  maxSteps?: number;
  checkpointer?: AgentCheckpointer;
}

export class DeboAgentGraph {
  private readonly memoryService: MemoryService;
  private readonly checkpointer: AgentCheckpointer;
  private readonly maxSteps: number;

  constructor(memoryService: MemoryService, options: GraphExecutionOptions = {}) {
    this.memoryService = memoryService;
    this.checkpointer = options.checkpointer ?? new MemoryCheckpointer();
    this.maxSteps = options.maxSteps ?? 25;
  }

  /**
   * Invokes the compiled StateGraph:
   * plan -> retrieve -> reason -> (interrupt if approval needed) -> validate -> respond
   */
  async invoke(initialState: AgentState): Promise<AgentState> {
    let state = { ...initialState };

    // Initial checkpoint
    await this.checkpointer.save(state);

    while (state.stepCount < this.maxSteps) {
      // 1. Plan Node
      if (state.plan.length === 0) {
        const planPatch = await planNode(state);
        state = { ...state, ...planPatch };
        await this.checkpointer.save(state);
      }

      // 2. Retrieve Node
      if (state.retrievedChunks.length === 0) {
        const retrieveNode = createRetrieveNode(this.memoryService);
        const retrievePatch = await retrieveNode(state);
        state = { ...state, ...retrievePatch };
        await this.checkpointer.save(state);
      }

      // 3. Reason Node
      if (!state.finalResponse && !state.pendingApproval) {
        const reasonPatch = await reasonNode(state);
        state = { ...state, ...reasonPatch };
        await this.checkpointer.save(state);

        // Check interrupt condition: Tier 2 or Tier 3 actions require human approval
        if (state.isInterrupted) {
          return state; // Paused at interrupt point
        }
      }

      // 4. Validate Node (Citation verification gate)
      if (state.finalResponse && state.citations.some(c => !c.verified)) {
        const validatePatch = await validateNode(state);
        state = { ...state, ...validatePatch };
        await this.checkpointer.save(state);
      }

      // 5. Respond Node
      const respondPatch = await respondNode(state);
      state = { ...state, ...respondPatch };
      await this.checkpointer.save(state);

      // Graph reached END node
      break;
    }

    return state;
  }

  /**
   * Resumes an interrupted agent state after user signs an approval
   */
  async resumeWithApproval(
    threadId: string,
    workspaceId: string,
    approvalId: string,
  ): Promise<AgentState> {
    const savedState = await this.checkpointer.getLatest(workspaceId, threadId);
    if (!savedState) {
      throw new Error(
        `No saved state found for thread '${threadId}' in workspace '${workspaceId}'`,
      );
    }

    if (!savedState.isInterrupted || !savedState.pendingApproval) {
      throw new Error(`Thread '${threadId}' is not currently paused on approval`);
    }

    // Action approved: clear interrupt flag, record execution result, and complete graph
    let state: AgentState = {
      ...savedState,
      isInterrupted: false,
      finalResponse: `Action '${savedState.pendingApproval.toolName}' was approved (ID: ${approvalId}) and executed successfully.`,
      pendingApproval: null,
      stepCount: savedState.stepCount + 1,
    };

    await this.checkpointer.save(state);

    // Continue graph to respond node
    const respondPatch = await respondNode(state);
    state = { ...state, ...respondPatch };
    await this.checkpointer.save(state);

    return state;
  }

  getCheckpointer(): AgentCheckpointer {
    return this.checkpointer;
  }
}

export function createDeboAgentGraph(
  memoryService: MemoryService,
  options?: GraphExecutionOptions,
): DeboAgentGraph {
  return new DeboAgentGraph(memoryService, options);
}

export { createInitialAgentState };
