# Chat API — `/api/v1/chat` 🔒

> SSE 流式对话接口。全局约定见 [conventions.md](./conventions.md)。

---

## POST `/api/v1/chat/stream` — 流式聊天（SSE）

**Request Body**
```json
{
  "message": "帮我分析 Rust 生态的创业机会",
  "task_id": null,
  "conversation_history": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好！我是 Decypher AI..." }
  ]
}
```

**Response** `Content-Type: text/event-stream`

```
data: {"type": "delta", "content": "根"}

data: {"type": "delta", "content": "据"}

data: {"type": "delta", "content": " Rust "}

data: {"type": "done", "content": "完整响应内容..."}

data: [DONE]
```

**Action 事件**（AI 识别到任务操作意图时额外推送）：
```
data: {"type": "action", "data": {"action": "update_task", "params": {"keywords": ["rust", "wasm"]}}}
```

---

## POST `/api/v1/chat/message` — 非流式聊天

适合不需要打字机效果的场景。

**Response 200**
```json
{
  "success": true,
  "data": {
    "message": "AI 完整回复内容",
    "task_updated": null,
    "action_taken": null
  }
}
```

---

## 规划中（Phase 3）

```
GET  /api/v1/chat/sessions       # 历史会话列表
GET  /api/v1/chat/sessions/{id}  # 单个会话详情（含完整 messages JSONB）
```
