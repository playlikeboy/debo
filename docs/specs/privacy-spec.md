# Normative Specification: User Privacy & Data Sovereignty

This document is a normative specification using RFC 2119 language.

---

## 1. Data Governance Invariants

1. **Model Training Prohibition**: User documents, personal memories, and prompt conversations MUST NOT be used to train foundation models. Debo MUST opt into Zero Data Retention (ZDR) tiers with all model API providers.
2. **Right to Erasure (GDPR Art. 17)**: When a user requests workspace or account deletion, the system MUST permanently purge all associated raw files in Cloudflare R2, relational records in Neon PostgreSQL, and vector records in Supermemory within 30 days.
3. **Data Export Portability (GDPR Art. 20)**: The system MUST provide an automated export mechanism allowing workspace owners to download all stored files in their original format, accompanied by JSON metadata and memory graphs.
4. **Private Ephemeral Mode**: When a user activates Private Mode, conversation threads and model responses MUST NOT be committed to long-term memory or database tables.
