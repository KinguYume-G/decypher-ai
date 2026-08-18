# Current Schema

The authoritative schema is the SQLAlchemy model set in `backend/app/models/` plus the Alembic revisions in `backend/alembic/versions/`.

| Table | Purpose | Principal relations |
| --- | --- | --- |
| `users` | account identity and password hash | parent of tasks, notes, favorites, conversations |
| `tasks` | keywords, category, sources, interval, lifecycle counters | belongs to user |
| `analysis_runs` | durable queued/running/completed/failed execution state | belongs to task |
| `items` | normalized source title, URL, content, score, metadata | belongs to task and optional run |
| `opportunities` | model-generated analysis, category, scores, source URLs | belongs to task and optional run |
| `user_favorites` | unique user/opportunity favorite relation | belongs to user and opportunity |
| `notes` | user-authored text | belongs to user |
| `conversations` | opportunity-focused chat session | belongs to user and optional opportunity |
| `conversation_messages` | ordered user/assistant content and citations | belongs to conversation |

The initial revision is `2dbf372eacdb`. Validate a running database with:

```bash
cd backend
source .venv/bin/activate
alembic current
alembic check
```

Do not hand-edit production tables or rely on `create_all()` for upgrades.
