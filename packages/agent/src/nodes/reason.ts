import { AgentState, CitationAssertion } from '../state';

export async function reasonNode(state: AgentState): Promise<Partial<AgentState>> {
  const query = state.query.toLowerCase();

  // Check if query requested a destructive or external mutating action
  if (
    query.includes('delete repo') ||
    query.includes('purge memory') ||
    query.includes('drop table')
  ) {
    return {
      pendingApproval: {
        approvalId: `appr_${crypto.randomUUID().replace(/-/g, '')}`,
        toolName: 'delete_resource',
        riskTier: 'DESTRUCTIVE',
        parameters: { query: state.query },
      },
      isInterrupted: true,
      stepCount: state.stepCount + 1,
    };
  }

  if (query.includes('create issue') || query.includes('send email')) {
    return {
      pendingApproval: {
        approvalId: `appr_${crypto.randomUUID().replace(/-/g, '')}`,
        toolName: query.includes('email') ? 'send_email' : 'create_issue',
        riskTier: 'EXTERNAL_WRITE',
        parameters: { target: state.query },
      },
      isInterrupted: true,
      stepCount: state.stepCount + 1,
    };
  }

  // Answer synthesis from retrieved chunks
  if (state.retrievedChunks.length > 0) {
    const chunk = state.retrievedChunks[0]!;
    const synthesized = `Based on your memory: "${chunk.content}" [^${chunk.id}]`;

    const citation: CitationAssertion = {
      chunkId: chunk.id,
      claim: chunk.content,
      quote: chunk.content,
      verified: false, // will be checked by validate node
      confidence: 1.0,
    };

    return {
      finalResponse: synthesized,
      citations: [citation],
      stepCount: state.stepCount + 1,
    };
  }

  // Fallback when no context was found
  return {
    finalResponse: 'I could not find any relevant memories in your personal context.',
    citations: [],
    stepCount: state.stepCount + 1,
  };
}
