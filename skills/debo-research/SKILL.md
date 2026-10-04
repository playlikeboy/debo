---
name: debo-research
version: 1.0.0
description: Procedural knowledge for conducting multi-source research investigations, synthesizing cross-document evidence, and building source timelines.
author: Debo Contributors
license: MIT
tools_required:
  - debo_search_sources
  - debo_get_document
  - debo_get_timeline
---

# Debo Research Skill

Use this skill when investigating a topic that spans multiple uploaded documents, meeting recordings, and emails over time.

## Procedure
1. **Scope the Inquiry**: Identify the core entities, date ranges, and relevant source types (PDF, email, audio).
2. **Search Sources**: Call `debo_search_sources` to identify high-relevance source containers.
3. **Inspect Document Layouts**: Call `debo_get_document` to review full structural sections, tables, and paragraphs.
4. **Construct Chronology**: If events unfolded over time, invoke `debo_get_timeline` to establish chronological order.
5. **Cross-Corroborate**: Verify claims across multiple independent documents before stating conclusions.
