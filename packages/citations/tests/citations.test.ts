import { describe, expect, it } from 'bun:test';
import type { Citation } from '@debo/types';
import { findExactSpan, validateGroundedClaim, verifyCitationAgainstChunk } from '../src/index';

describe('@debo/citations engine', () => {
  const sampleChunk = `
    The executive board convened on September 15, 2026.
    A unanimous decision was reached to migrate database storage to Neon PostgreSQL
    and use Cloudflare R2 for zero-egress object storage.
  `;

  it('finds exact character span inside source chunk', () => {
    const span = findExactSpan(sampleChunk, 'migrate database storage to Neon PostgreSQL');
    expect(span.found).toBe(true);
    expect(span.startChar).toBeGreaterThan(0);
    expect(span.endChar).toBeGreaterThan(span.startChar!);

    const sliced = sampleChunk.substring(span.startChar!, span.endChar!);
    expect(sliced.toLowerCase()).toContain('migrate database storage to neon postgresql');
  });

  it('rejects hallucinated or non-existent quotes', () => {
    const span = findExactSpan(sampleChunk, 'decided to switch to Amazon DynamoDB');
    expect(span.found).toBe(false);
  });

  it('verifies citation and populates character offsets', () => {
    const verification = verifyCitationAgainstChunk(
      'Cloudflare R2 for zero-egress object storage',
      sampleChunk,
      { pageNumber: 3 },
    );

    expect(verification.valid).toBe(true);
    expect(verification.confidence).toBe(1.0);
    expect(verification.updatedProvenance.pageNumber).toBe(3);
    expect(verification.updatedProvenance.startChar).toBeDefined();
    expect(verification.updatedProvenance.endChar).toBeDefined();
  });

  it('validates grounded claim and rejects unsupported hallucinations', () => {
    const chunks = new Map<string, string>([['chn_1', sampleChunk]]);

    // 1. Valid Grounded Claim
    const validCitation: Citation = {
      id: 'cit_1',
      sourceId: 'src_1',
      sourceTitle: 'Board Minutes',
      sourceType: 'pdf',
      chunkId: 'chn_1',
      quote: 'migrate database storage to Neon PostgreSQL',
      provenance: { pageNumber: 1 },
      confidence: 1.0,
    };

    const validResult = validateGroundedClaim(
      'The company decided to migrate to Neon.',
      [validCitation],
      chunks,
    );
    expect(validResult.supported).toBe(true);
    expect(validResult.citations).toHaveLength(1);

    // 2. Hallucinated Quote Claim
    const fakeCitation: Citation = {
      id: 'cit_fake',
      sourceId: 'src_1',
      sourceTitle: 'Board Minutes',
      sourceType: 'pdf',
      chunkId: 'chn_1',
      quote: 'The CEO was replaced by an AI system immediately.',
      provenance: { pageNumber: 1 },
      confidence: 1.0,
    };

    const fakeResult = validateGroundedClaim(
      'The CEO was replaced by an AI system.',
      [fakeCitation],
      chunks,
    );
    expect(fakeResult.supported).toBe(false);
    expect(fakeResult.unsupportedReason).toContain('hallucinated quotes');
  });
});
