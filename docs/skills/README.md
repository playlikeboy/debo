# Debo Portable Skills Architecture

Debo leverages the emerging open **Agent Skills** standard to provide portable, modular procedural knowledge to AI agents.

---

## 1. Skill vs. MCP: The Definitive Distinction

A critical architectural distinction must be maintained:

```text
┌─────────────────────────────────┬─────────────────────────────────┐
│              SKILL              │               MCP               │
│   (Procedural Knowledge)        │    (Capabilities & Actions)     │
├─────────────────────────────────┼─────────────────────────────────┤
│ Instructions, workflows,        │ Network endpoints, tools,       │
│ heuristics, and domain          │ resources, database access,     │
│ procedures in Markdown.         │ and RPC execution mechanisms.   │
├─────────────────────────────────┼─────────────────────────────────┤
│ "How to synthesize a memory     │ "The `debo_search_memory` tool  │
│ citation without hallucinating" │ that returns matching vectors"  │
└─────────────────────────────────┴─────────────────────────────────┘
```

**Rule**: A Skill teaches an agent *how* to approach a problem and use tools; MCP provides the actual *tools* to execute.

---

## 2. Directory Structure of Debo Skills

```text
skills/
├── debo-memory/       # How to query, verify, and update memory
├── debo-research/     # How to conduct multi-source investigation
├── debo-projects/     # How to structure and track projects & decisions
├── debo-connectors/   # How to safely interact with third-party tools
├── debo-workflows/    # How to construct durable Trigger.dev tasks
└── debo-agent/        # Core operating instructions for Debo agents
```

Every skill resides in its own directory containing a normative `SKILL.md` document with YAML frontmatter.

---

## 3. Installation, Versioning & Publishing

- **Installation**: Skills are installed via the open-source `skills` CLI:
  ```bash
  npx skills add SH20RAJ/debo -s debo-memory
  ```
- **Versioning**: Skills adhere to SemVer (`1.0.0`) in their YAML metadata.
- **Security Audits**: Skills are reviewed against prompt injection, prompt leakage, and unsafe tool execution patterns before publication.
