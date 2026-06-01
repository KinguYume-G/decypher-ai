# Tasks API — `/api/v1/tasks` 🔒

> 全部需要认证。全局约定见 [conventions.md](./conventions.md)。

---

## POST `/api/v1/tasks` — 创建任务

**Request Body**
```json
{
  "name": "AI Agent 机会追踪",
  "keywords": ["ai agent", "llm", "autonomous"],
  "sources": ["github", "hackernews"],
  "interval_seconds": 3600
}
```

| 字段 | 规则 |
|-|-|
| `keywords` | 1~10 个关键词 |
| `sources` | `github` / `reddit` / `hackernews` 任意组合 |
| `interval_seconds` | 最小 300（5 分钟） |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "AI Agent 机会追踪",
    "keywords": ["ai agent", "llm", "autonomous"],
    "sources": ["github", "hackernews"],
    "interval_seconds": 3600,
    "status": "pending",
    "is_active": true,
    "last_run_at": null,
    "next_run_at": "2024-01-01T01:00:00Z",
    "run_count": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## GET `/api/v1/tasks` — 任务列表

**Response 200**
```json
{
  "success": true,
  "data": [ /* Task 对象数组 */ ],
  "meta": { "total": 5 }
}
```

---

## GET `/api/v1/tasks/{task_id}` — 单个任务

**Response 200** — 返回单个 Task 对象。

---

## PATCH `/api/v1/tasks/{task_id}` — 更新任务

所有字段可选。

**Request Body**
```json
{
  "name": "新名称",
  "keywords": ["new", "keywords"],
  "interval_seconds": 7200,
  "is_active": false
}
```

**Response 200** — 返回更新后的 Task 对象。

---

## POST `/api/v1/tasks/{task_id}/run` — 立即执行

手动触发一次完整分析 Pipeline（异步执行，结果稍后可在 opportunities 查看）。

**Response 200**
```json
{
  "success": true,
  "data": { "message": "任务 'AI Agent 机会追踪' 已触发执行，结果稍后可查看" }
}
```

---

## DELETE `/api/v1/tasks/{task_id}` — 删除任务

**Response 200**
```json
{ "success": true, "data": null }
```
