# Database Overview

PostgreSQL 15 is the system of record. SQLAlchemy uses the asyncpg driver, and Alembic owns production schema evolution.

```text
users
  |-- tasks
  |     |-- analysis_runs
  |     |-- items
  |     `-- opportunities
  |           `-- user_favorites
  |-- notes
  `-- conversations
          `-- conversation_messages
```

Redis does not contain accepted analysis work. It stores scheduler metadata and may be rebuilt without losing tasks, source items, opportunities, or conversations.

## Migration policy

- Run `alembic upgrade head` before starting a production release.
- Generate a reviewed Alembic revision for every model change.
- Use `alembic check` to detect model/schema drift.
- Development startup may call `create_all()` for convenience; production startup does not.

## Data lifecycle

- Deleting a user cascades through user-owned tasks and related data.
- Source items are deduplicated by task and URL before insertion.
- Conversations store messages separately so citations remain attached to assistant responses.
- Analysis runs retain trigger, status, counts, model metadata, timing, and failure detail for auditability.
