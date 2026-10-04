import type { Citation, GroundedClaim, ProvenanceLocation } from '@debo/types';

export interface VerifyCitationOptions {
  minQuoteLength?: number;
  caseSensitive?: boolean;
}

export function findExactSpan(
  sourceText: string,
  quote: string,
  options: VerifyCitationOptions = {},
): { found: boolean; startChar?: number; endChar?: number } {
  const minLen = options.minQuoteLength || 5;
  if (!quote || quote.trim().length < minLen) {
    return { found: false };
  }

  const cleanQuote = quote.trim();
  const searchSource = options.caseSensitive ? sourceText : sourceText.toLowerCase();
  const searchQuote = options.caseSensitive ? cleanQuote : cleanQuote.toLowerCase();

  const idx = searchSource.indexOf(searchQuote);
  if (idx === -1) {
    return { found: false };
  }

  return {
    found: true,
    startChar: idx,
    endChar: idx + cleanQuote.length,
  };
}

export function verifyCitationAgainstChunk(
  quote: string,
  chunkContent: string,
  baseProvenance: ProvenanceLocation = {},
): { valid: boolean; confidence: number; updatedProvenance: ProvenanceLocation } {
  const span = findExactSpan(chunkContent, quote);
  if (!span.found) {
    return {
      valid: false,
      confidence: 0,
      updatedProvenance: baseProvenance,
    };
  }

  return {
    valid: true,
    confidence: 1.0,
    updatedProvenance: {
      ...baseProvenance,
      startChar: span.startChar,
      endChar: span.endChar,
    },
  };
}

export function validateGroundedClaim(
  claim: string,
  citations: Citation[],
  sourceChunksMap: Map<string, string>, // chunkId -> text
): GroundedClaim {
  if (citations.length === 0) {
    return {
      claim,
      citations: [],
      supported: false,
      unsupportedReason: 'No citations provided for claim',
    };
  }

  const validatedCitations: Citation[] = [];

  for (const cit of citations) {
    if (!cit.chunkId || !sourceChunksMap.has(cit.chunkId)) {
      continue;
    }
    const chunkText = sourceChunksMap.get(cit.chunkId)!;
    const verification = verifyCitationAgainstChunk(cit.quote, chunkText, cit.provenance);

    if (verification.valid) {
      validatedCitations.push({
        ...cit,
        confidence: verification.confidence,
        provenance: verification.updatedProvenance,
      });
    }
  }

  if (validatedCitations.length === 0) {
    return {
      claim,
      citations: [],
      supported: false,
      unsupportedReason: 'All citations failed source grounding verification (hallucinated quotes)',
    };
  }

  return {
    claim,
    citations: validatedCitations,
    supported: true,
  };
}
