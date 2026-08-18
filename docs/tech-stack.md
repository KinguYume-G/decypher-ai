# Technology Stack

Versions are governed by `backend/requirements.txt` and `frontend/package-lock.json`; those files are authoritative.

| Layer | Technology | Role |
| --- | --- | --- |
| Backend | Python 3.12, FastAPI, Uvicorn | async HTTP API and SSE |
| Persistence | PostgreSQL 15, SQLAlchemy 2, asyncpg | transactional application data and durable runs |
| Migrations | Alembic | versioned production schema changes |
| Scheduling | APScheduler, Redis 7 | interval scheduling and scheduler metadata |
| Collection | httpx | asynchronous provider adapters |
| AI | Ollama native Chat API | default local inference with `qwen3.5:9b` |
| Cloud AI | OpenAI SDK | optional OpenAI and DeepSeek-compatible providers |
| Frontend | Next.js 16, React 19, TypeScript 5 | App Router web client |
| UI | Tailwind CSS 3, Lucide, react-hot-toast | design system and interaction feedback |
| Client state | Zustand, Axios | session/UI state and API transport |
| Quality | pytest, ESLint 9, TypeScript, GitHub Actions | automated validation |

## Runtime requirements

- Python 3.12
- Node.js 20.9 or newer
- PostgreSQL 15
- Redis 7
- Docker with Compose support
- Ollama when `DECYPHER_AI_PROVIDER=ollama`

Next.js 16 uses Turbopack by default and no longer provides `next lint`; linting runs directly through ESLint. FastAPI and the analysis worker run as separate processes so request handling is independent from long-running collection and inference.
