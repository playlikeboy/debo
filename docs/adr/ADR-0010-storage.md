# Status
accepted

# Context
Debo ingests large volumes of user files: PDFs, audio recordings of voice notes, images, presentation decks, and exported archives. Storing raw binary files in a relational database or ephemeral server disks is impossible. The object storage solution must be reliable, S3-compatible, globally distributed, secure, and cost-effective—especially regarding egress fees when models and workers fetch files for ingestion and citations.

# Decision
We adopt **Cloudflare R2** as Debo's canonical, immutable raw source storage engine, encapsulated within `@debo/storage`:
- All uploaded files are assigned a cryptographically random object key (`workspaces/${workspaceId}/sources/${sourceId}/${fileHash}`).
- Direct access is strictly forbidden; public bucket access is disabled.
- Downloads and previews are served via short-lived (e.g. 15-minute) pre-signed URLs generated deterministically by Debo after verifying tenant permissions.

# Alternatives
1. **AWS S3**: Industry standard, but carries substantial egress bandwidth fees ($0.09/GB) that penalize AI workloads pulling large documents and audio files repeatedly into processing workers.
2. **Local VPS Disk Storage**: Fails horizontal scaling, lacks global durability guarantees, and complicates disaster recovery.

# Why
Cloudflare R2 is fully S3-API compatible, integrates seamlessly with our Cloudflare DNS and security edge, and charges **zero egress fees**, resulting in predictable, dramatically lower infrastructure costs for document-heavy personal context systems.

# Consequences
- **Positive**: Zero data transfer/egress charges; global durability (99.999999999%); native AWS S3 SDK compatibility (`@aws-sdk/client-s3`).
- **Negative**: Requires generating pre-signed URLs for authenticated user viewing and temporary worker downloads.

# Migration / Exit Strategy
Because Cloudflare R2 adheres strictly to the S3 API standard, switching to AWS S3, MinIO (self-hosted), or Google Cloud Storage requires only updating endpoint and credential environment variables.

# Evidence
- Cloudflare R2 Documentation: `https://developers.cloudflare.com/r2/`
- AWS SDK for JavaScript v3 S3 Client Compatibility.
