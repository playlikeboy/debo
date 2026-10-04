# Normative Specification: Object Storage Architecture

This document is a normative specification using RFC 2119 language.

---

## 1. Storage Invariants

1. **Provider Standard**: Debo MUST use Cloudflare R2 as its primary S3-compatible raw object store to ensure zero egress bandwidth fees.
2. **Access Control**: R2 storage buckets MUST NOT be configured with public read access. Direct public access is strictly PROHIBITED.
3. **Key Namespace Convention**: Storage keys for uploaded user content MUST strictly adhere to the path convention:
   ```text
   workspaces/${workspaceId}/sources/${sourceId}/${contentHash}.${extension}
   ```
4. **Pre-signed URLs**: All client uploads and downloads MUST utilize short-lived (maximum 15 minutes) AWS Signature Version 4 pre-signed URLs generated deterministically by `@debo/storage`.
5. **CORS Restrictions**: Bucket CORS policies MUST restrict allowed origins exclusively to verified Debo domains (`app.debo.life`).
