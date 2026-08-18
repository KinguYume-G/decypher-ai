# Implementation Status

Last reviewed: 2026-08-18

## Production-shaped core completed

- Authentication: registration, login, current user, password hashing, JWT authorization
- Tasks: create, list, inspect, update, pause, resume, delete, manual trigger
- Durable runs: PostgreSQL state machine, concurrent-run rejection, worker claiming, counts, errors, provider/model metadata
- Collection: concurrent adapters, normalized `RawSignal`, deduplication, budget trimming
- Persistence: users, tasks, runs, items, opportunities, favorites, notes, conversations, messages
- AI: category prompts, structured opportunity output, Ollama native chat, OpenAI/DeepSeek alternatives
- Retrieval chat: user-scoped stored items, lexical ranking, five citations, SSE, persisted history
- Frontend: auth, dashboard categories, cards, tasks, history, source links, favorites, notes, chat
- Operations: Alembic, health/readiness probes, Dockerfiles, Compose profile, CI

## Verified

- Backend test suite: 39 tests passing
- Frontend: ESLint, TypeScript, production build
- Dependency audit: zero known npm vulnerabilities at last validation
- Alembic database at head with no detected upgrade operations
- Browser flow: register -> task -> collect -> persist -> Ollama analysis -> cards -> citation chat -> reload history
- Live browser acceptance was completed with GitHub/Hacker News and separately with Hacker News-only input

## Implemented adapters requiring provider acceptance

GitHub, Hacker News, DEV Community, arXiv, OpenAlex, Semantic Scholar, Papers with Code, Product Hunt, SEC EDGAR, Stack Exchange, Remote OK, and RSS have concrete adapters. Credentials and provider availability vary. Reddit is a stub and returns no results.

## Not implemented

- Embeddings and pgvector semantic retrieval
- Entity extraction and cross-source entity graph
- Report model, report generation API, exports, and weekly delivery
- Notification persistence and delivery
- Billing, subscription enforcement, and checkout
- File upload and private document ingestion
- Conversation rename/delete UI
- Personalized ranking from user behavior
- Committed browser E2E test suite and load testing

## Known risks

- `python-jose` emits an upstream `datetime.utcnow()` deprecation warning in tests.
- APScheduler owns timing, while PostgreSQL owns accepted run durability; multi-instance scheduler leadership is not implemented.
- Provider-specific API limits and schema changes can affect collectors.
- Local Ollama quality and latency depend on the selected model and host hardware.
