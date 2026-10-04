# Normative Specification: Memory Subsystem

This document is a normative specification using RFC 2119 language.

---

## 1. Memory Invariants

1. **Partitioning**: All memory records and vector embeddings MUST be indexed with an explicit `workspace_id`. Cross-workspace vector similarity searches MUST be physically impossible at the query layer.
2. **Attribution**: Every `Memory` entity MUST reference a parent `source_id` and `chunk_id`. Memories lacking authentic source references MUST be flagged as `UNGROUNDED`.
3. **Temporal Validity**: Memories MUST include `valid_from` timestamps. When a memory is contradicted by a newer source, its status MUST transition to `SUPERSEDED`, and `valid_to` MUST be set to the timestamp of the superseding source.
4. **Purge Guarantee**: When a parent `Source` is deleted, all child `Memory` records MUST be marked `DELETED`, and their vector representations MUST be permanently purged from the vector index within 60 seconds.

---

## 2. Retrieval Requirements

- The memory search pipeline MUST support hybrid dense vector and sparse keyword search.
- When querying active context, the retrieval engine MUST exclude memories marked `SUPERSEDED` or `DELETED` unless the query explicitly requests historical state.
- Inquiries regarding past states MUST evaluate temporal filters against `valid_from` and `valid_to` boundaries.
