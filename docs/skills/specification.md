# Portable Agent Skill Specification

This specification defines the mandatory format, frontmatter schemas, and execution behaviors for any `SKILL.md` file within Debo.

---

## 1. File Format & Frontmatter Schema

Every skill MUST begin with valid YAML frontmatter enclosed by triple dashes (`---`):

```yaml
---
name: debo-<skill-name>
version: 1.0.0
description: A 1-2 sentence description explaining when and how an agent should load this skill.
author: Debo Contributors
license: MIT
tools_required:
  - debo_search_memory
  - debo_get_source
---
```

### Frontmatter Fields:
- `name` (string, required): Lowercase, hyphen-delimited identifier prefixed with `debo-`.
- `version` (string, required): Semantic versioning (`major.minor.patch`).
- `description` (string, required): Trigger condition and operational scope.
- `tools_required` (array of strings, optional): List of MCP tools this skill expects to be present in the runtime environment.

---

## 2. Body Structure Guidelines

The Markdown body of a `SKILL.md` file should contain:
1. **Overview & Philosophy**: The guiding mental model for the agent.
2. **Step-by-Step Procedure**: Algorithmic steps the agent must take.
3. **Edge Cases & Failure Modes**: How to handle missing data, ambiguous queries, or contradictory sources.
4. **Concrete Examples**: Few-shot input and expected output patterns.
5. **Safety Constraints**: Prohibited behaviors and escalation triggers.
