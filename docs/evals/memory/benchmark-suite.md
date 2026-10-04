# Debo Memory Benchmark Suite Specification

This specification defines the 7 core benchmark tracks and mathematical evaluation metrics used to grade any memory engine implementation in Debo.

---

## 1. The 7 Benchmark Evaluation Tracks

### Track 1: Retrieval Precision & Recall
- **Exact Fact**: Retrieving exact phone numbers, serial codes, names, or addresses.
- **Semantic Recall**: Retrieving conceptually related context without keyword overlap (e.g. searching *"my financial worries"* retrieves notes on *"mortgage rate hikes"*).
- **Paraphrase Robustness**: Formulating queries with slang, indirect phrasing, or conversational shorthand.
- **Multi-Hop Traversal**: Resolving queries requiring information from two distinct documents (e.g. *"What did Alex's company decide about the server migration?"* where Alex is identified in Document A and the company migration is recorded in Document B).

### Track 2: Temporal Reasoning & State Changes
- **Latest Value**: Asking for current state (e.g. *"Where do I live right now?"*).
- **Historical Value**: Asking for state at a specific past point in time (e.g. *"Where did I live in May 2023?"*).
- **Changed Preference**: Querying preferences that evolved over time (e.g. *"What coffee do I like?"* when old notes say Espresso and recent notes say Cold Brew).
- **Obsolete Fact Detection**: Ensuring superseded facts are not reported as current ground truth.

### Track 3: Entity & Relational Resolution
- **People**: Disambiguating entities with multiple nicknames (*"Mom"*, *"Linda Smith"*, *"LS"*).
- **Projects**: Linking tasks, meeting notes, and pull requests to the correct active `Project`.
- **Companies & Vendors**: Associating invoices and receipts with correct vendor profiles.
- **Decisions**: Linking an architectural or business decision to its recorded rationale and stakeholders.

### Track 4: Contradiction Resolution
- **Conflicting Ingestion**: Ingesting conflicting facts sequentially and testing whether Debo flags the discrepancy or correctly applies the superseding rule.
- **Confidence Calibration**: When two sources disagree with equal validity timestamps, verifying that Debo presents both with confidence qualifiers rather than choosing arbitrarily.

### Track 5: Grounding & Citation Correctness
- **Citation Precision**: Percentage of generated inline citations that directly support the asserted claim.
- **Citation Coverage**: Percentage of factual claims in the answer that have an associated citation.
- **Visual Coordinate Alignment**: Verifying that the bounding box coordinates on PDFs correspond to the exact rendered text.

### Track 6: Privacy & Multi-Tenant Isolation
- **Cross-Tenant Leakage**: Executing 10,000 queries using Workspace A credentials attempting to retrieve embeddings or documents belonging to Workspace B. **Tolerance: 0.00%**.
- **Post-Deletion Verification**: Validating that deleted sources or erased accounts cannot be retrieved under any embedding prompt.
- **Authorization Scopes**: Validating that viewers cannot invoke destructive or write-scoped memory tools.

### Track 7: Multimodal Parsing Fidelity
- **PDF Layout**: Evaluating extraction accuracy on multi-column layouts and scientific formulas.
- **Table Extraction**: Evaluating row/column cell structure preservation against ground truth markdown tables.
- **Audio / Voice Notes**: Evaluating chunking boundaries on conversational transcripts with speaker diarization.

---

## 2. Mathematical Metric Definitions

$$\text{Recall@K} = \frac{|\text{Relevant Items} \cap \text{Top-K Retrieved}|}{|\text{Relevant Items}|}$$

$$\text{MRR (Mean Reciprocal Rank)} = \frac{1}{|Q|} \sum_{i=1}^{|Q|} \frac{1}{\text{rank}_i}$$

$$\text{nDCG@K} = \frac{\text{DCG@K}}{\text{IDCG@K}} \quad \text{where} \quad \text{DCG@K} = \sum_{i=1}^K \frac{2^{\text{rel}_i} - 1}{\log_2(i + 1)}$$

$$\text{Citation Accuracy} = \frac{\text{Number of Validated Factual Claims with Verifiable Citations}}{\text{Total Number of Factual Claims Generated}}$$

$$\text{Temporal Accuracy} = \frac{\text{Number of Correct Temporal State Identifications}}{\text{Total Temporal Inquiries}}$$

$$\text{P95 Latency} = 95\text{th percentile end-to-end retrieval time in milliseconds}$$
