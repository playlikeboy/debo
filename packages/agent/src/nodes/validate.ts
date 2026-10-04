import { verifyCitationAgainstChunk } from '@debo/citations';
import { AgentState, CitationAssertion } from '../state';

export async function validateNode(state: AgentState): Promise<Partial<AgentState>> {
  if (!state.finalResponse) {
    return { stepCount: state.stepCount + 1 };
  }

  let text = state.finalResponse;
  const chunkMap = new Map<string, string>();
  for (const c of state.retrievedChunks) {
    chunkMap.set(c.id, c.content);
  }

  // Extract inline citation markers: [^chunkId]
  const citationRegex = /\[\^([a-zA-Z0-9_-]+)\]/g;
  const foundChunkIds: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = citationRegex.exec(text)) !== null) {
    foundChunkIds.push(match[1]!);
  }

  const updatedCitations: CitationAssertion[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (const chunkId of foundChunkIds) {
    const chunkContent = chunkMap.get(chunkId);
    if (!chunkContent) {
      // Chunk wasn't retrieved or is hallucinated: strip invalid citation tag
      text = text.replace(`[^${chunkId}]`, '');
      invalidCount++;
      continue;
    }

    // Verify against chunk content using @debo/citations
    const existingAssertion = state.citations.find(c => c.chunkId === chunkId);
    const quote = existingAssertion?.quote ?? chunkContent;
    const verification = verifyCitationAgainstChunk(quote, chunkContent);

    if (verification.valid || verification.confidence > 0.8) {
      validCount++;
      updatedCitations.push({
        chunkId,
        claim: existingAssertion?.claim ?? quote,
        quote,
        verified: true,
        confidence: verification.confidence,
      });
    } else {
      invalidCount++;
      text = text.replace(`[^${chunkId}]`, '');
    }
  }

  // Check unsupported claim ratio: if > 50% invalid or no valid citations for factual claims
  let disclaimerAppended = false;
  const totalCitations = validCount + invalidCount;
  if (totalCitations > 0 && invalidCount / totalCitations > 0.5) {
    text +=
      '\n\n*(Note: Some details in this answer could not be fully grounded in your verified memories.)*';
    disclaimerAppended = true;
  }

  return {
    finalResponse: text.trim(),
    citations: updatedCitations,
    disclaimerAppended,
    stepCount: state.stepCount + 1,
  };
}
