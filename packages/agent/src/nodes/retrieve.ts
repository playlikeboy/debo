import { MemoryService } from '@debo/memory';
import { AgentState, RetrievedChunk } from '../state';

export function createRetrieveNode(memoryService: MemoryService) {
  return async function retrieveNode(state: AgentState): Promise<Partial<AgentState>> {
    // Tenant context is strictly enforced from graph state
    const searchResults = await memoryService.search(
      {
        workspaceId: state.workspaceId,
        userId: state.userId,
        role: 'member',
      },
      {
        query: state.query,
        limit: 5,
      },
    );

    const retrievedChunks: RetrievedChunk[] = searchResults.map(res => ({
      id: res.memory.id,
      content: res.memory.content,
      sourceId: res.memory.sourceId,
      score: res.score,
    }));

    return {
      retrievedChunks,
      stepCount: state.stepCount + 1,
    };
  };
}
