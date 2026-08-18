# Schema Extension Plan

Only planned additions that are not already represented by current models are listed here.

## Retrieval

- Enable the pgvector extension.
- Add a versioned embedding column and embedding-model metadata to `items`.
- Add an approximate nearest-neighbor index after measuring production volume.

## Product services

- `notifications`: user, type, payload, read state, delivery timestamps.
- `reports`: user, period, status, content, model metadata, generated timestamp.
- `user_events`: explicit feedback and product interactions used only with user-visible controls.

Every addition requires an Alembic revision, downgrade behavior, ownership constraints, indexes, API tests, and retention policy.
