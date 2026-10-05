# Debo Portable Agent Skills

Portable procedural knowledge skills for Debo personal AI operating system, compatible with `skills.sh`, `npx skills`, Antigravity CLI, Claude Desktop, and Cursor.

## Available Skills

| Skill | Tools Required | Purpose |
|---|---|---|
| **[debo-agent](./debo-agent/SKILL.md)** | `debo_search_memory`, `debo_recall` | Foundational operating constitution, editorial tone, non-LLM security, exact grounding. |
| **[debo-memory](./debo-memory/SKILL.md)** | `debo_search_memory`, `debo_recall`, `debo_save_memory`, `debo_update_memory` | Searching, recalling, and updating personal context with strict source citations. |
| **[debo-connectors](./debo-connectors/SKILL.md)** | `debo_approve_workflow` | Safely executing third-party actions (Gmail, Slack, Calendar, GitHub) with human approval. |
| **[debo-workflows](./debo-workflows/SKILL.md)** | `debo_run_workflow`, `debo_get_workflow` | Authoring, triggering, and inspecting durable Trigger.dev background tasks. |
| **[debo-projects](./debo-projects/SKILL.md)** | `debo_get_project_context`, `debo_create_task`, `debo_create_decision` | Structuring initiatives, managing linked tasks, and recording formal decisions. |
| **[debo-research](./debo-research/SKILL.md)** | `debo_search_sources`, `debo_get_document`, `debo_get_timeline` | Synthesizing cross-document evidence and building chronological source timelines. |

## Installation & Usage

### Via `skills.sh` / `npx skills`
```bash
# Add a specific skill to your agent environment
npx skills add debo/debo-memory

# Add all Debo skills
npx skills add debo
```

### Direct MCP Integration
In Claude Desktop (`claude_desktop_config.json`) or Cursor MCP configuration:
```json
{
  "mcpServers": {
    "debo": {
      "command": "npx",
      "args": ["-y", "@debo/mcp-server"],
      "env": {
        "DEBO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Validation

All skills conform to standard YAML frontmatter requirements:
- Valid `name`, `version`, `description`, `author`, `license`.
- Declarative `tools_required` matching registered Debo MCP tools.
- Strict anti-hallucination and security invariants.

Validated continuously via automated test suite `tests/skills/skills.test.ts`.
