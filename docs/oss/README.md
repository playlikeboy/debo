# Open Source Policy & Supply Chain Governance

Debo is an open-source project committed to transparent development, permissible distribution, and uncompromising supply chain security.

---

## 1. Core License Policy

Debo's primary codebase is distributed under the **MIT License**. 
To protect users and downstream contributors, all dependencies incorporated into Debo must conform to our License Compatibility Matrix.

### Permitted Licenses:
- **MIT** (Universal inclusion permitted)
- **Apache 2.0** (Permitted; patent grant respected)
- **BSD 2-Clause / 3-Clause** (Permitted with attribution)
- **ISC** (Permitted)

### Strictly Prohibited Licenses:
- **AGPL / GPL** (Prohibited in product libraries to prevent viral copyleft contamination)
- **SSPL / BSL / Non-Commercial** (Prohibited in production runtimes unless isolated as a standalone external infrastructure service under an accepted ADR)
- **Proprietary / Unknown** (Prohibited)

---

## 2. Dependency Inclusion Requirements

Before any new package is added to `package.json` or `pyproject.toml`, it must be documented in `docs/engineering/dependencies.md` with:
- `Name`
- `Version`
- `License`
- `Repository URL`
- `Business Purpose in Debo`
- `Security & Bundle Risk Assessment`

---

## 3. Supply Chain Security & Provenance

1. **Automated Vulnerability Scanning**: Dependabot and Snyk scan dependencies weekly for known CVEs.
2. **Lockfile Freezing**: In CI and production builds, dependencies are installed using `bun install --frozen-lockfile` to prevent unreviewed package drift.
3. **Vendoring & Patching Policy**:
   - If an external library requires a critical bug fix, use `bun patch` with an explicit patch file committed to the repository.
   - All patches must be submitted upstream to the original open-source project within 14 days.
4. **Attribution & NOTICE File**:
   - A generated `NOTICE` file bundles all third-party license notices in binary releases.
