# Cards API — `/api/v1/cards` 🔒

> `cards` 是 `opportunities` 的前端视图：按 `category` 分桶展示，自动附带收藏状态。全局约定见 [conventions.md](./conventions.md)。

---

## GET `/api/v1/cards` — 情报卡片列表

**Query Params**

| 参数 | 类型 | 说明 |
|-|-|-|
| `category` | string（可选） | `market` / `research` / `startup` / `stocks` / `jobs` |
| `limit` | int（默认 6，最大 50） | 返回数量 |
| `favorited` | bool（可选） | `true` → 只返回已收藏的卡片 |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "task_id": 2,
      "category": "research",
      "title": "AI Agent 测试框架",
      "what_to_build": "...",
      "why_it_matters": "...",
      "how_to_execute": "...",
      "score_trend": 9.0,
      "score_novelty": 7.5,
      "score_competition": 3.0,
      "score_feasibility": 8.0,
      "score_commercial": 8.5,
      "score_total": 7.2,
      "is_favorited": false,
      "created_at": "2024-01-01T01:00:00Z"
    }
  ]
}
```

---

## POST `/api/v1/cards/{card_id}/favorite` — 切换收藏状态

幂等操作：已收藏则取消，未收藏则添加。

**Response 200**
```json
{
  "success": true,
  "data": { "is_favorited": true }
}
```

---

## 规划中（Phase 1）

```
GET   /api/v1/cards/{id}       # 卡片详情（含 detail_analysis 全文）
POST  /api/v1/cards/{id}/like  # 点赞（独立于收藏，累计计数）
```
