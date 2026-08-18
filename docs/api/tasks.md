# Tasks API

All routes require `Authorization: Bearer <token>` and enforce task ownership.

## `POST /api/v1/tasks`

```json
{
  "name": "AI agent reliability",
  "category": "startup",
  "keywords": ["AI agent", "LLM evaluation"],
  "sources": ["github", "hackernews"],
  "interval_seconds": 3600
}
```

Creates a scheduled task and returns `201`.

## Read and update

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/{task_id}`
- `PATCH /api/v1/tasks/{task_id}`
- `DELETE /api/v1/tasks/{task_id}`

`PATCH` accepts task fields plus `is_active`; pausing and resuming also update scheduler state.

## `POST /api/v1/tasks/{task_id}/run`

Creates a durable queued analysis run. It does not perform collection in the HTTP process.

```json
{
  "success": true,
  "data": {
    "message": "任务 'AI agent reliability' 已触发执行并加入队列",
    "run_id": 42
  }
}
```

Returns `409` if that task already has a queued or active run.

## Run and source inspection

- `GET /api/v1/tasks/{task_id}/runs?limit=20`
- `GET /api/v1/tasks/{task_id}/items?limit=50`

Limits are clamped to 1-100. Runs expose lifecycle counts and model metadata; items expose the normalized source material stored for retrieval and auditing.
