# Architecture — Decypher AI 系统架构

---

## 系统概览

```
用户浏览器
    │
    │ HTTPS
    ▼
┌─────────────────────────────────────────┐
│           Next.js 前端  :3000           │
│  Dashboard / Tasks / Chat / Notes 页面  │
└────────────────┬────────────────────────┘
                 │ REST API + SSE
                 ▼
┌──────────────────────────────────────────────┐
│              FastAPI 后端  :8000             │
│                                              │
│  ┌──────────────┐  ┌───────────────────┐     │
│  │  API 路由层   │  │  认证中间件 (JWT)  │     │
│  │  app/api/v1/ │  │  app/api/deps.py  │     │
│  └──────┬───────┘  └───────────────────┘     │
│         │                                    │
│  ┌──────▼────────────────────────────────┐   │
│  │           Service 层                  │   │
│  │  analysis_service  chat_service       │   │
│  │  github_service    hn_service         │   │
│  │  arxiv_service     producthunt_service│   │
│  │  ... (15+ 数据源服务)                  │   │
│  └──────┬────────────────────────────────┘   │
│         │                                    │
│  ┌──────▼────────────────────────────────┐   │
│  │           Worker 层 (Pipeline)        │   │
│  │  collector → processor → orchestrator │   │
│  └──────┬────────────────────────────────┘   │
│         │                                    │
│  ┌──────▼──────────┐                         │
│  │  APScheduler    │  ← 定时触发 / 手动触发   │
│  │  core/scheduler │                         │
│  └─────────────────┘                         │
└──────┬──────────────────────┬────────────────┘
       │                      │
       ▼                      ▼
┌────────────┐        ┌─────────────┐
│ PostgreSQL │        │    Redis    │
│ users      │        │ Job Store   │
│ tasks      │        │ (APScheduler│
│ opportunities       │  持久化)    │
│ notes      │        └─────────────┘
│ user_favorites
└────────────┘
       │
       ▼ (外部 API 调用，在 Service 层发起)
┌──────────────────────────────────────────┐
│  OpenAI / DeepSeek  GitHub  HN  arXiv    │
│  Product Hunt  SEC EDGAR  OpenAlex  ...  │
└──────────────────────────────────────────┘
```

---

## 层间调用关系

```
HTTP 请求
  → API 路由 (app/api/v1/*.py)         ← 只做参数校验 + 调用 service/worker
      → deps.py                        ← 注入 DB session 和 current_user
      → Service 层 (app/services/)     ← 封装外部 API 调用和 AI 分析
      → Worker 层 (app/workers/)       ← 编排多步 Pipeline（collect→process→analyze）
          → collector.py               ← 并发调用所有数据源 service
          → processor.py               ← 去重、截断、格式化为 AI 可读文本
          → orchestrator.py            ← 调用 analysis_service，结果写入 DB
      → ORM 模型 (app/models/)         ← SQLAlchemy 2.0 Async，定义表结构
      → DB (app/database.py)           ← 异步 session 工厂
```

---

## 后端模块详解（`backend/`）

### 入口

```
main.py
  FastAPI app 初始化：注册所有路由（auth/tasks/opportunities/cards/chat/notes/seed），
  lifespan 钩子负责启动时 init_db() 建表、scheduler.start()，关闭时 scheduler.shutdown()。
```

### 配置与数据库

```
app/
├── config.py
│     pydantic-settings Settings 类，将所有 DECYPHER_* 环境变量读入类型安全的属性。
│     整个项目通过 `from app.config import settings` 引用，不得硬编码配置值。
│
└── database.py
      创建异步 SQLAlchemy Engine + SessionLocal 工厂。
      暴露 get_db() 依赖（AsyncSession）和 init_db()（建表，开发环境用）。
```

### API 路由层（`app/api/`）

```
app/api/
├── deps.py
│     两个 FastAPI 依赖函数：
│       get_db()          → 注入 AsyncSession
│       get_current_user() → 解析 Bearer Token，返回 User 对象；Token 无效则 401
│
└── v1/
    ├── __init__.py          聚合所有子路由，供 main.py include_router 使用
    ├── auth.py              POST /register、POST /login（返回 JWT）、GET /me
    ├── tasks.py             任务 CRUD + POST /{id}/run（手动触发分析 Pipeline）
    ├── opportunities.py     GET 列表（支持 task_id / category 过滤）+ GET 详情 + 收藏
    ├── cards.py             GET /cards（按 category 浏览情报卡片，附带收藏状态）
    ├── chat.py              POST /chat/stream（SSE 流式对话）
    ├── notes.py             用户笔记 CRUD（list / create / update / delete）
    ├── seed.py              POST /seed（一键写入演示数据，数据库非空时跳过）
    └── signals.py           占位文件，原始信号端点尚未实现
```

### 核心基础设施（`app/core/`）

```
app/core/
├── security.py
│     JWT 生成（create_access_token）和验证（decode_access_token）。
│     bcrypt 密码哈希（hash_password / verify_password）。
│     被 auth.py 和 deps.py 调用。
│
└── scheduler.py
      APScheduler AsyncIOScheduler，Redis 作为 JobStore（任务重启后仍存活）。
      暴露 add_task_job() / remove_task_job() / pause_task_job()。
      被 tasks.py 路由和 orchestrator.py 调用。
```

### ORM 模型（`app/models/`）

```
app/models/
├── __init__.py        统一 import 所有模型，确保 init_db() 能感知到所有表
├── user.py            User：email、username、hashed_password、is_active；一对多 tasks / notes
├── task.py            Task：关联 user_id，存 keywords(JSONB)、sources(JSONB)、
│                      interval_seconds、status（pending/running/completed/failed）
├── opportunity.py     Opportunity：关联 task_id，存 AI 生成的 title/what_to_build/
│                      why_it_matters/how_to_execute 及 5 维评分字段
├── note.py            Note：关联 user_id，存 title + content 自由文本
└── user_favorite.py   UserFavorite：user_id × opportunity_id 多对多收藏表（唯一约束防重复）
```

### Pydantic Schema（`app/schemas/`）

```
app/schemas/
└── __init__.py
      所有请求/响应 Pydantic 模型集中于此：
        APIResponse[T]      通用包装格式 {success, data, error, meta}
        UserOut / RegisterIn / LoginIn / TokenOut
        TaskCreate / TaskOut / TaskUpdate
        OpportunityOut
        NoteCreate / NoteOut / NoteUpdate
        ChatRequest / ChatDelta
```

### 业务服务层（`app/services/`）

```
app/services/
│
├── llm_client.py            OpenAI SDK 封装，提供 chat()（同步返回）和 stream()（AsyncGenerator）。
│                            所有需要调用大模型的地方都通过这里，避免 SDK 调用散落各处。
│
├── analysis_service.py      调用 llm_client，将 processor 输出的信号文本转化为结构化
│                            Opportunity JSON（含 5 维评分）。被 orchestrator 调用。
│
├── chat_service.py          构建系统提示词，调用 llm_client.stream()，
│                            将 AI 回复以 SSE chunk 逐字发送给前端。被 chat.py 路由调用。
│
├── base_data_service.py     抽象基类，定义 RawSignal 数据结构和 search() 接口。
│                            所有数据源 service 必须继承并实现 fetch_raw()。
│
├── github_service.py        调用 GitHub REST API 搜索 repos/issues（Token 认证，5000次/小时）
├── hn_service.py            调用 Algolia HN Search API 搜索帖子和评论（无需认证）
├── arxiv_service.py         调用 arXiv API 获取学术论文摘要
├── producthunt_service.py   调用 Product Hunt GraphQL API 获取最新产品发布
├── devto_service.py         调用 Dev.to 公开 API 获取技术文章
├── openalex_service.py      调用 OpenAlex 开放学术图谱获取研究成果
├── semantic_scholar_service.py  调用 Semantic Scholar API 获取 AI/ML 论文
├── papers_with_code_service.py  调用 Papers With Code API 获取有代码的 ML 论文
├── sec_service.py           调用 SEC EDGAR 全文搜索获取监管文件
├── stackexchange_service.py 调用 Stack Exchange API 搜索相关问题
├── remoteok_service.py      调用 Remote OK JSON API 获取远程科技职位
├── rss_service.py           通用异步 RSS/Atom 解析器，被多个频道订阅 feed 使用
├── reddit_service.py        占位实现，Reddit OAuth2 对接尚未完成
│
└── agents/
    ├── __init__.py
    └── prompts.py           LLM 系统提示词模板和 JSON 输出 Schema，被 analysis_service 引用
```

### Worker Pipeline（`app/workers/`）

```
app/workers/
├── __init__.py
│
├── collector.py       Layer 1 — 并发采集
│                      按 Task.sources 配置，asyncio.gather 并发调用各 service.search()。
│                      输入：Task（含 keywords + sources）
│                      输出：List[RawSignal]
│
├── processor.py       Layer 2 — 清洗格式化
│                      对 RawSignal 列表去重（按 URL）、按分数排序、截断超长正文，
│                      拼接成单一文本块供 AI 消费。
│                      输入：List[RawSignal]
│                      输出：str（信号摘要文本）
│
└── orchestrator.py    Layer 3 — 编排 + 存库
                       调用 collector → processor → analysis_service，
                       将返回的 Opportunity 列表写入 DB，更新 Task.status 和 last_run_at。
                       由 APScheduler 定时触发，或 /tasks/{id}/run 手动触发。
```

---

## 前端模块（`frontend/src/`）

```
src/
├── app/                    Next.js App Router 页面（只做路由和布局）
│   ├── layout.tsx          根布局：字体、Toast Provider
│   ├── page.tsx            首页重定向 → /dashboard 或 /login
│   ├── (auth)/login/       登录/注册页（Tab 切换）
│   ├── dashboard/          主仪表盘：Bento Grid 机会卡片
│   ├── tasks/              任务管理：列表 + 手动触发
│   ├── chat/               AI Analyst 对话页
│   └── saved/              收藏的机会卡片
│
├── components/
│   ├── layout/             Sidebar（左侧导航）+ Header（顶部栏）
│   ├── dashboard/          TaskCard / OpportunityCard / CreateTaskModal / ScoreBar
│   ├── chat/               ChatInput / ChatMessage（Markdown + 打字机效果）/ ChatWindow
│   └── ui/                 Button / Input / Badge / LoadingSpinner（基础原子组件）
│
├── hooks/                  封装 store + api，是组件的唯一数据入口
│   ├── useTasks.ts         fetchTasks / createTask / runTask / deleteTask
│   ├── useOpportunities.ts fetchOpportunities（支持 taskId / category 过滤）
│   ├── useChat.ts          sendMessage / clearMessages / setCurrentTask
│   └── useAuth.ts          login / register / logout / isAuthenticated
│
├── lib/
│   ├── api.ts              Axios 实例 + 请求拦截器（自动注入 Token）+ 所有 API 函数
│   └── utils.ts            cn()（合并 Tailwind class）/ 时间格式化 / 文字截断
│
├── store/
│   └── index.ts            Zustand stores（auth / task / chat）；组件不直接引用，通过 hooks/
│
└── types/
    └── index.ts            TypeScript 类型定义，与后端 Schema 字段一一对应
```

---

## 架构演进计划

| 阶段 | 触发条件 | 主要变更 |
|-|-|-|
| **MVP（当前）** | — | 单体 FastAPI + APScheduler + PostgreSQL + Redis |
| **Phase 2** | 并发任务 > 10 | 拆出独立 Worker 服务，引入 Celery + Redis Queue |
| **Phase 3** | 日活 > 1000 | 事件驱动：Kafka 消息队列 + 独立 AI 微服务 |
| **Phase 4** | 企业级部署 | 云原生：Kubernetes + Flink + Milvus 向量库 |

---

## 技术选型决策记录（ADR）

| 决策 | 选择 | 原因 |
|-|-|-|
| 定时任务 | APScheduler（非 Celery） | MVP 任务量小，零额外服务依赖 |
| 关系数据库 | PostgreSQL（非 MongoDB） | 数据有明确关系（User→Task→Opportunity），需要事务 |
| AI 流式输出 | SSE（非 WebSocket） | 聊天流单向推送，SSE 维护状态更简单 |
| 向量检索 | pgvector（非 Milvus） | < 100 万向量时 pgvector 够用，不引入额外服务 |
| 主力模型 | gpt-4o-mini + DeepSeek 备用 | 成本约为 gpt-4o 的 1/20，分析任务效果足够 |
