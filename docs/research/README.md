# Technology Research & Evaluation System

Debo follows a **Research-Before-Architecture** process. Research pages are decision support, not benchmark reports, unless a result is explicitly labelled as a Debo-run measurement.

## 1. Evidence Classes

Every material claim should be traceable to one of these classes:

1. **Official documentation/specification** — primary capability or protocol definition.
2. **Official release/changelog/package metadata** — version, compatibility, or release-state evidence.
3. **Repository observation** — what the Debo repository or dependency source currently contains.
4. **Independent reproducible benchmark** — externally measured performance with a reproducible method.
5. **Debo benchmark** — measured by Debo against a named fixture, environment, and method.
6. **Engineering assessment** — an explicit judgement derived from the evidence above.
7. **Unverified hypothesis** — a question or assumption requiring validation before implementation.

Never describe a vendor claim or engineering assessment as an empirical Debo finding.

## 2. Mandatory Evaluation Vectors

Each serious technology evaluation should cover:

1. Problem solved
2. Why considered
3. Official repository
4. Official documentation
5. Current version and evidence date
6. License
7. Deployment models
8. TypeScript support
9. Python support where relevant
10. MCP/protocol compatibility where relevant
11. Agent-framework compatibility
12. Workflow compatibility
13. Self-hosting feasibility
14. Docker support
15. Authentication and tenancy
16. Security and threat profile
17. Observability
18. Strengths, weaknesses, and failure modes
19. Cost implications
20. Exit strategy and migration path

## 3. Weighted Assessment

Comparative scorecards use **eight** weighted categories:

```
Score =
0.40 Fit +
0.15 Maturity +
0.10 Ecosystem +
0.10 Security +
0.10 DX +
0.05 Self-Host +
0.05 Cost +
0.05 Exit
```

The weights sum to 1.00. Scores from 1–5 are **engineering assessments**, not measurements, unless the page explicitly says they come from a Debo benchmark.

See [scorecard.md](scorecard.md) for the comparison matrix.

## 4. Decision States

- **Accepted** — selected for the current architecture.
- **Evaluated alternative** — researched but not selected.
- **Future escape hatch** — intentionally kept viable for later replacement.
- **Pending validation** — selected in principle but requires implementation/evaluation evidence.
- **Rejected** — intentionally excluded for a documented reason.

Accepted decisions still require revalidation for major version or capability changes.
