# API Design — Decypher AI 接口规范

---

## 全局约定

### 基础路径
```
所有接口：/api/v1/
文档地址：http://localhost:8000/api/docs   （Swagger UI）
```

### 统一响应格式
```json
{
  "success": true,
  "data": {},          // 实际数据
  "error": null,       // 错误信息（成功时为 null）
  "meta": {            // 元数据（分页信息等，可选）
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

### 错误响应格式
```json
{
  "success": false,
  "data": null,
  "error": "具体错误描述（中文）",
  "meta": null
}
```

### HTTP 状态码规范
| 状态码 | 场景 |
|-|-|
| 200 | 成功（GET / PATCH / DELETE） |
| 201 | 创建成功（POST） |
| 400 | 请求参数错误 |
| 401 | 未认证或 Token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 数据验证失败（Pydantic） |
| 500 | 服务器内部错误 |

### 认证方式
```
Header: Authorization: Bearer <jwt_token>
所有非认证接口都需要此 Header
```

---

## 认证接口 `/api/v1/auth`

### POST `/api/v1/auth/register` — 注册
**Request Body**
```json
{
  "email": "user@example.com",
  "username": "decypher_user",
  "password": "password123"
}
```
**密码规则**：至少8位，包含字母和数字

**Response 200**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJ...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "decypher_user",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### POST `/api/v1/auth/login` — 登录
**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: 同注册

---

### GET `/api/v1/auth/me` — 获取当前用户 🔒
**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "decypher_user",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 任务接口 `/api/v1/tasks` 🔒（全部需要认证）

### POST `/api/v1/tasks` — 创建任务
**Request Body**
```json
{
  "name": "AI Agent 机会追踪",
  "keywords": ["ai agent", "llm", "autonomous"],
  "sources": ["github", "hackernews"],
  "interval_seconds": 3600
}
```
**字段说明**
- `keywords`: 1-10 个关键词
- `sources`: `github` / `reddit` / `hackernews` 任意组合
- `interval_seconds`: 执行间隔，最小 300（5分钟）

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

### GET `/api/v1/tasks` — 获取任务列表
**Response**
```json
{
  "success": true,
  "data": [ /* Task 对象数组 */ ],
  "meta": { "total": 5 }
}
```

---

### GET `/api/v1/tasks/{task_id}` — 获取单个任务

---

### PATCH `/api/v1/tasks/{task_id}` — 更新任务
**Request Body**（所有字段可选）
```json
{
  "name": "新名称",
  "keywords": ["new", "keywords"],
  "interval_seconds": 7200,
  "is_active": false
}
```

---

### POST `/api/v1/tasks/{task_id}/run` — 立即执行任务
**Response**
```json
{
  "success": true,
  "data": { "message": "任务 'AI Agent 机会追踪' 已触发执行，结果稍后可查看" }
}
```

---

### DELETE `/api/v1/tasks/{task_id}` — 删除任务

---

## 机会接口 `/api/v1/opportunities` 🔒

### GET `/api/v1/opportunities` — 获取机会列表
**Query Params**
| 参数 | 类型 | 说明 |
|-|-|-|
| `task_id` | int（可选） | 按任务过滤 |
| `limit` | int（默认20） | 返回数量 |

**Response**
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

### GET `/api/v1/opportunities/{id}` — 获取机会详情

---

## AI 聊天接口 `/api/v1/chat` 🔒

### POST `/api/v1/chat/stream` — 流式聊天（SSE）
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

**Response**: `Content-Type: text/event-stream`
```
data: {"type": "delta", "content": "根"}

data: {"type": "delta", "content": "据"}

data: {"type": "delta", "content": " Rust "}

data: {"type": "done", "content": "完整响应内容..."}

data: [DONE]
```

**Action 事件**（当 AI 识别到任务操作意图时）：
```
data: {"type": "action", "data": {"action": "update_task", "params": {"keywords": ["rust", "wasm"]}}}
```

---

### POST `/api/v1/chat/message` — 普通聊天（非流式）
**Response**
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

## 情报卡片接口 `/api/v1/cards` 🔒

cards 是 opportunities 的前端视图：按 category 分桶展示，自动附带收藏状态。

### GET `/api/v1/cards` — 获取情报卡片列表
**Query Params**
| 参数 | 类型 | 说明 |
|-|-|-|
| `category` | string（可选） | `market` / `research` / `startup` / `stocks` / `jobs` |
| `limit` | int（默认 6，最大 50） | 返回数量 |
| `favorited` | bool（可选） | `true` → 只返回已收藏的卡片 |

**Response**
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

### POST `/api/v1/cards/{card_id}/favorite` — 切换收藏状态
幂等操作：已收藏则取消，未收藏则添加。

**Response**
```json
{
  "success": true,
  "data": { "is_favorited": true }
}
```

---

## 笔记接口 `/api/v1/notes` 🔒

### GET `/api/v1/notes` — 获取笔记列表
**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "AI Agent 调研笔记",
      "content": "...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST `/api/v1/notes` — 创建笔记
**Request Body**
```json
{
  "title": "笔记标题",
  "content": "笔记正文内容"
}
```
**Response 201**：返回创建的 Note 对象（同列表中的单项格式）

---

### PATCH `/api/v1/notes/{note_id}` — 更新笔记
**Request Body**（所有字段可选）
```json
{
  "title": "新标题",
  "content": "新内容"
}
```

---

### DELETE `/api/v1/notes/{note_id}` — 删除笔记
**Response**
```json
{ "success": true, "data": null }
```

---

## 演示数据接口 `/api/v1/seed` 🔒

### POST `/api/v1/seed` — 一键初始化演示数据
为 5 个分类（market/research/startup/stocks/jobs）各创建一个默认任务并立即触发分析。
**仅在数据库任务表为空时执行，有数据则跳过。**

**Response**
```json
{
  "success": true,
  "data": { "message": "已初始化 5 个演示任务，分析结果稍后可查看" }
}
```

---

## 系统接口

### GET `/health` — 健康检查（无需认证）
```json
{
  "status": "healthy",
  "service": "Decypher AI Backend",
  "version": "0.1.0"
}
```

---

## 命名规范
- URL 路径：`kebab-case`（如 `/task-runs`）
- JSON 字段：`snake_case`（如 `created_at`）
- 枚举值：`lowercase`（如 `"pending"`, `"running"`）
- 时间格式：ISO 8601 UTC（如 `"2024-01-01T00:00:00Z"`）
