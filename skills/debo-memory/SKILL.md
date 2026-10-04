---
name: debo-memory
version: 1.0.0
description: Procedural knowledge for searching, recalling, and updating personal context in Debo with strict source grounding.
author: Debo Contributors
license: MIT
tools_required:
  - debo_search_memory
  - debo_recall
  - debo_save_memory
  - debo_update_memory
---

# Debo Memory Skill

Use this skill whenever you need to recall past events, retrieve personal preferences, query user documents, or record new memories on behalf of the user.

## Core Rules
1. **Never Hallucinate Evidence**: Every factual claim must link to an exact chunk ID retrieved from `debo_search_memory` or `debo_recall`.
2. **Respect Temporal Status**: Distinguish between active beliefs and superseded past states.
3. **Acknowledge Uncertainty**: If memories conflict or lack evidence, state the ambiguity explicitly.

## Procedure
1. **Understand Intent**: Determine if the query is asking for a current fact, historical state, or broad context.
2. **Execute Retrieval**:
   - For specific facts, call `debo_search_memory` with keywords and conceptual phrasing.
   - For conversational context, call `debo_recall`.
3. **Analyze Results**:
   - Inspect `validFrom`, `validTo`, and `isSuperseded` flags.
   - Discard superseded memories unless the query explicitly asks about the past.
4. **Synthesize Answer**:
   - Format with inline citations `[^chunkId]`.
5. **Memory Updates**:
   - When the user explicitly states a change (e.g. *"I moved to Berlin"*), search for the old memory first, then call `debo_update_memory`.
