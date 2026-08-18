# Roadmap

The core local product loop is complete. Remaining work is ordered by product value and operational risk.

## 1. Retrieval quality

- Add pgvector and an embedding column for stored items.
- Generate embeddings asynchronously and backfill existing rows.
- Combine vector similarity, lexical relevance, recency, and signal score.
- Add retrieval evaluation fixtures and citation precision metrics.

## 2. Product completion

- Persist notifications for run completion and failure.
- Add conversation rename and delete operations.
- Implement report models, report jobs, weekly summaries, and export.
- Replace Premium and file-upload previews with real features or remove them from navigation.
- Complete mobile navigation and responsive acceptance tests.

## 3. Source hardening

- Add contract tests and recorded fixtures for every supported adapter.
- Implement Reddit OAuth or remove the stub.
- Add provider-level backoff, quotas, observability, and circuit breakers.
- Document credential scopes and provider terms without embedding secrets.

## 4. Operations and security

- Add retry policy, timeout recovery, cancellation, and dead-letter handling for runs.
- Add scheduler leadership for multi-instance deployments.
- Add structured logs, metrics, tracing, backups, and restore exercises.
- Add rate limiting and a security-focused review before public deployment.
- Add Playwright E2E tests to CI and run production container smoke tests.

## 5. Personalization

- Capture explicit user feedback and card interactions.
- Add user-controlled recommendation preferences.
- Measure source usefulness and ranking quality before automatic personalization.
