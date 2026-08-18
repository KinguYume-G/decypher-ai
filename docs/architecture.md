# Architecture

## Runtime components

| Component | Responsibility |
| --- | --- |
| Next.js web app | authentication UI, task management, opportunity cards, notes, streaming chat |
| FastAPI API | authorization, CRUD, run enqueueing, retrieval, SSE responses, health checks |
| PostgreSQL | application records, durable run state, raw items, conversations |
| Redis | APScheduler job store and readiness dependency |
| Scheduler | creates due analysis runs; never performs collection inline |
| Analysis worker | claims queued runs and performs collection, processing, inference, persistence |
| LLM provider | Ollama locally or an optional OpenAI-compatible provider |

## Analysis lifecycle

```text
manual API trigger or scheduled job
  -> INSERT analysis_runs(status=queued)
  -> worker SELECT ... FOR UPDATE SKIP LOCKED
  -> collecting
  -> concurrent source adapters
  -> persist normalized items and remove URL duplicates
  -> processing and prompt-budget trimming
  -> analyzing through llm_client
  -> persist opportunities
  -> completed or failed with diagnostic metadata
```

Accepted runs live in PostgreSQL, so restarting the API does not discard them. A separate worker process is required to make progress.

## Chat lifecycle

```text
authenticated request
  -> verify opportunity ownership through its task
  -> load up to 100 recent task items
  -> rank by lexical overlap and signal score
  -> attach top five source excerpts
  -> stream provider output over SSE
  -> persist user and assistant messages with citations
```

The retrieval layer is intentionally simple and inspectable. Vector retrieval is not present yet.

## Security boundaries

- Every user-owned query includes a user or task ownership predicate.
- Passwords are stored as hashes; JWTs sign API identity.
- Production configuration rejects short/default signing secrets.
- Provider keys come from environment variables and are never returned by APIs.
- CORS origins are explicit configuration.
- Public endpoints are limited to authentication, health, readiness, and generated API documentation.

## Deployment model

The Compose application profile runs one process per container: frontend, API, and worker. PostgreSQL and Redis use persistent volumes. Database migrations are an explicit pre-start operation. TLS, replicas, backups, centralized logs, and scheduler leadership belong to the deployment platform and are not configured by this repository.
