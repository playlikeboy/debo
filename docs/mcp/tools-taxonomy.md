# Debo MCP Tools Taxonomy Specification

This document defines the normative design contracts and parameter schemas for the 21 standard tools exposed by the Debo MCP Server.

---

## 1. Memory Subsystem Tools

### `debo_search_memory`
- **Description**: Performs hybrid semantic and keyword search across indexed memories within the workspace.
- **Parameters**:
  - `query` (string, required): Natural language search prompt or keywords.
  - `limit` (number, optional, default: 10): Max memories to return.
  - `timeframe_start` (string, ISO date, optional): Filter for memories valid after this date.
  - `timeframe_end` (string, ISO date, optional): Filter for memories valid before this date.

### `debo_recall`
- **Description**: Contextual associative recall for active agent reasoning, retrieving relevant facts and profile summaries.
- **Parameters**:
  - `prompt` (string, required): Active user or task context.

### `debo_get_memory`
- **Description**: Retrieves a single memory record by its unique ID.
- **Parameters**:
  - `memory_id` (string, required): ULID identifier (`mem_...`).

### `debo_save_memory`
- **Description**: Ingests a new atomic fact into the user's memory graph.
- **Parameters**:
  - `content` (string, required): Factual assertion to remember.
  - `source_id` (string, optional): Associated source document.
  - `tags` (string array, optional): Categorical tags.

### `debo_update_memory`
- **Description**: Updates an existing memory fact and establishes a superseding relationship.
- **Parameters**:
  - `memory_id` (string, required): Target memory to supersede.
  - `new_content` (string, required): Updated ground truth.

### `debo_forget_memory`
- **Description**: Permanently purges a memory record from the active and historical graph.
- **Parameters**:
  - `memory_id` (string, required): Target memory to purge.
- **Security**: Requires `agent.execute.destructive` scope.

---

## 2. Source Subsystem Tools

### `debo_search_sources`
- **Description**: Search across uploaded raw files, notes, audio transcripts, and connector documents.
- **Parameters**:
  - `query` (string, required): Search query.
  - `source_types` (array of 'pdf' | 'audio' | 'email' | 'note' | 'web', optional).

### `debo_get_source`
- **Description**: Retrieves metadata and temporary pre-signed download URL for a source container.
- **Parameters**:
  - `source_id` (string, required): `src_...` identifier.

### `debo_get_document`
- **Description**: Retrieves the full structured Markdown representation of a parsed document (Docling output).
- **Parameters**:
  - `document_id` (string, required): `doc_...` identifier.

### `debo_get_timeline`
- **Description**: Retrieves an episodic chronological stream of life events, meetings, and notes within a date range.
- **Parameters**:
  - `start_date` (string, ISO date, required).
  - `end_date` (string, ISO date, required).

---

## 3. Context Subsystem Tools

### `debo_get_person_context`
- **Description**: Retrieves structured relationship profile, contact details, and meeting history for an individual.
- **Parameters**:
  - `name_or_id` (string, required): Person's name, email alias, or `per_...` ID.

### `debo_get_project_context`
- **Description**: Retrieves overview, objectives, linked documents, and open tasks for a tracked project.
- **Parameters**:
  - `project_id_or_slug` (string, required).

### `debo_get_decision_context`
- **Description**: Retrieves rationale, historical alternatives, and citations for an architectural or personal decision.
- **Parameters**:
  - `decision_id` (string, required): `dec_...` identifier.

### `debo_get_recent_context`
- **Description**: Retrieves high-priority context and active items from the past 7 days (recent meetings, decisions, tasks).
- **Parameters**:
  - `days` (number, optional, default: 7).

---

## 4. Product Action Tools

### `debo_create_task`
- **Description**: Creates a new task or todo item in Debo.
- **Parameters**:
  - `title` (string, required).
  - `due_date` (string, ISO date, optional).
  - `project_id` (string, optional).

### `debo_update_task`
- **Description**: Updates the status or details of an existing task.
- **Parameters**:
  - `task_id` (string, required): `tsk_...`.
  - `status` ('TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED', optional).

### `debo_create_project`
- **Description**: Initializes a new tracked project container.
- **Parameters**:
  - `name` (string, required).
  - `description` (string, optional).

### `debo_create_decision`
- **Description**: Records a formal decision with options considered and justification.
- **Parameters**:
  - `title` (string, required).
  - `rationale` (string, required).
  - `project_id` (string, optional).

---

## 5. Workflow Execution Tools

### `debo_run_workflow`
- **Description**: Triggers an asynchronous durable background workflow (e.g. connector re-sync or document deep analysis).
- **Parameters**:
  - `workflow_slug` (string, required).
  - `input_payload` (object, required).

### `debo_get_workflow`
- **Description**: Queries the execution status, logs, and outputs of a background workflow run.
- **Parameters**:
  - `run_id` (string, required): `wfr_...`.

### `debo_approve_workflow`
- **Description**: Approves a pending human-in-the-loop action using a signed approval token.
- **Parameters**:
  - `approval_id` (string, required): `app_...`.
  - `decision` ('APPROVED' | 'REJECTED', required).
