# Opportunities API — `/api/v1/opportunities` 🔒

> AI 分析结果（机会）的读取接口。写入由后台 Pipeline 完成，无手动创建端点。全局约定见 [conventions.md](./conventions.md)。

---

## GET `/api/v1/opportunities` — 机会列表

**Query Params**

| 参数 | 类型 | 说明 |
|-|-|-|
| `task_id` | int（可选） | 按任务过滤 |
| `category` | string（可选） | `market` / `research` / `startup` / `stocks` / `jobs` |
| `limit` | int（默认 20） | 返回数量 |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "title": "AI Agent 测试自动化工具",
      "what_to_build": "一个专为 AI Agent 设计的自动化测试框架...",
      "why_it_matters": "随着 AI Agent 应用爆发，测试复杂度远超传统软件...",
      "how_to_execute": "MVP: 先做 prompt injection 测试模块，接入主流 Agent 框架...",
      "score_trend": 9.0,
      "score_novelty": 7.5,
      "score_competition": 3.0,
      "score_feasibility": 8.0,
      "score_commercial": 8.5,
      "score_total": 7.2,
      "keywords_matched": ["ai agent", "llm"],
      "created_at": "2024-01-01T01:00:00Z"
    }
  ],
  "meta": { "total": 1 }
}
```

---

## GET `/api/v1/opportunities/{id}` — 机会详情

**Response 200** — 返回单个 Opportunity 对象（字段同列表单项）。
