# System API

## `GET /health`

Process liveness probe. It does not contact dependencies.

```json
{"status":"healthy","service":"Decypher AI Backend","version":"0.1.0"}
```

## `GET /health/ready`

Dependency readiness probe.

```json
{"status":"ready","checks":{"database":true,"redis":true}}
```

## `POST /api/v1/seed`

Authenticated development helper. If the current user has no tasks, it creates one task per category and queues initial runs. It does not insert fabricated opportunities. If tasks already exist, it leaves them unchanged.
