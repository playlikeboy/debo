/**
 * Citation & Grounding Type Definitions
 */

export interface ProvenanceLocation {
  pageNumber?: number;
  blockNumber?: number;
  startChar?: number;
  endChar?: number;
  boundingBox?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  audioTimecode?: {
    startSec: number;
    endSec: number;
  };
  segmentId?: string;
}

export interface Citation {
  id: string; // cit_*
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  chunkId?: string;
  quote: string;
  provenance: ProvenanceLocation;
  confidence: number;
}

export interface GroundedClaim {
  claim: string;
  citations: Citation[];
  supported: boolean;
  unsupportedReason?: string;
}
