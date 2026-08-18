# Repository Guide

Decypher AI is a FastAPI and Next.js intelligence platform. This file records stable development constraints; current capabilities and setup live in `README.md`.

## Architecture rules

- API routes validate ownership and persist state; they do not run long collection or inference jobs inline.
- Manual and scheduled triggers create `analysis_runs` rows.
- `app.workers.runner` claims queued rows and calls collector -> processor -> analysis -> persistence.
- External HTTP integrations are only called through the worker collection layer.
- Production schema changes require an Alembic revision. Production startup does not call `create_all()`.
- Chat retrieval must remain scoped to the authenticated user's tasks and items.
- All model calls go through `app.services.llm_client`.
- All browser API calls go through `frontend/src/lib/api.ts`.

## Stack

- Python 3.12, FastAPI, SQLAlchemy 2, PostgreSQL 15, Redis 7, Alembic
- Ollama `qwen3.5:9b` by default; OpenAI and DeepSeek are optional
- Next.js 16, React 19, TypeScript 5, Tailwind CSS 3, Zustand

## Commands

```bash
docker compose up -d postgres redis

cd backend
source .venv/bin/activate
alembic upgrade head
pytest -q
uvicorn main:app --reload --host 127.0.0.1 --port 8000
python -m app.workers.runner

cd frontend
npm run lint
npm run type-check
npm run build
npm run dev
```

Do not commit secrets, local databases, caches, Playwright artifacts, virtual environments, `node_modules`, `.next`, or TypeScript build info.
