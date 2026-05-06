# Architecture — Decypher AI 系统架构

---

## 系统概览

```
用户浏览器
    │
    │ HTTPS
    ▼
┌─────────────────┐
│   Next.js 前端   │  :3000
│  - Chat UI       │
│  - Dashboard     │
│  - Task Manager  │
└────────┬────────┘
         │ REST API + SSE
         ▼
┌─────────────────────────────────────────┐
│            FastAPI 后端  :8000           │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ API 路由  │  │ 认证中间件│             │
│  └────┬─────┘  └──────────┘             │
│       │                                  │
│  ┌────▼────────────────────────┐        │
│  │         Service 层           │        │
│  │  ┌────────┐  ┌───────────┐  │        │
│  │  │AI服务  │  │数据采集服务│  │        │
│  │  └────┬───┘  └─────┬─────┘  │        │
│  └───────┼────────────┼────────┘        │
│          │            │                  │
│  ┌───────▼────────────▼────────┐        │
│  │      APScheduler 调度器      │        │
│  │   - 定时触发分析任务         │        │
│  │   - 管理 Job 生命周期        │        │
│  └─────────────────────────────┘        │
└──────┬─────────────────────┬────────────┘
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│ PostgreSQL   │      │    Redis    │
│  - 用户数据  │      │  - 缓存     │
│  - 任务配置  │      │  - Job Store│
│  - 机会结果  │      └─────────────┘
└─────────────┘
       │
       ▼ （AI Pipeline）
┌──────────────────────────────────────┐
│           外部 API                    │
│  OpenAI / DeepSeek  GitHub  HN       │
└──────────────────────────────────────┘
```

---

## 模块划分

### 后端模块（`backend/app/`）

```
app/
├── config.py                   # 全局配置（pydantic-settings，从环境变量读取）
├── database.py                 # AsyncEngine + AsyncSession 工厂 + init_db()
│
├── models/                     # SQLAlchemy ORM 模型（只定义表结构，不含业务逻辑）
│   ├── __init__.py             # 统一导出所有模型
│   ├── user.py                 # 用户表
│   ├── task.py                 # 任务表（含 TaskStatus 状态机枚举）
│   └── opportunity.py          # 机会结果表（含 5 维评分字段）
│
├── schemas/                    # Pydantic 请求/响应模型（数据验证层）
│   └── __init__.py             # 所有 Schema 集中在此，含 APIResponse 通用格式
│
├── api/                        # HTTP 路由层（只做：参数校验 + 调用 service + 返回）
│   ├── deps.py                 # 依赖注入（get_current_user、get_db）
│   └── v1/
│       ├── __init__.py
│       ├── auth.py             # POST /register、/login；GET /me
│       ├── tasks.py            # CRUD + POST /{id}/run（手动触发）
│       ├── opportunities.py    # GET 列表（支持 task_id 过滤）+ GET 详情
│       ├── signals.py          # 原始信号数据（占位，后期实现）
│       └── chat.py             # POST /stream（SSE 流式）+ POST /message（普通）
│
├── services/                   # 业务逻辑层（每个文件只做一件事）
│   │
│   ├── analysis_service.py     # AI 分析：信号文本 → 结构化机会 JSON
│   │                           # 调用 OpenAI/DeepSeek，返回机会列表 + 评分
│   │
│   ├── chat_service.py         # AI 对话：理解用户意图，识别任务操作指令
│   │                           # 支持 stream（SSE）和非流式两种模式
│   │
│   ├── base_data_service.py    # 数据采集公共基类：定义 search() 接口 + 公共清洗逻辑
│   │                           # 子类必须实现 fetch_raw() 方法
│   │
│   ├── github_service.py       # GitHub 采集（Token 认证，60→5000次/小时）
│   │                           # search_issues() + search_repos()
│   │
│   ├── hn_service.py           # Hacker News 采集（无需认证，用 Algolia API）
│   │                           # search()
│   │
│   └── reddit_service.py       # Reddit 采集（OAuth2，暂为占位实现）
│                               # search()
│
├── core/                       # 基础设施工具（无业务逻辑）
│   ├── __init__.py
│   ├── security.py             # JWT 生成/验证 + bcrypt 密码哈希
│   └── scheduler.py            # APScheduler 管理器（add/remove/pause job）
│
└── workers/                    # 后台异步 Pipeline（分层，每层独立可测试）
    ├── __init__.py
    ├── collector.py            # 第1层：并发调用各 service 采集原始数据
    │                           # 输入：task（含 keywords + sources）
    │                           # 输出：List[RawSignal]
    │
    ├── processor.py            # 第2层：清洗 + 信号提取
    │                           # 输入：List[RawSignal]
    │                           # 输出：清洗后的 signals_text（喂给 AI 用）
    │                           # 包含：去重、截断、格式化、噪音过滤
    │
    └── orchestrator.py         # 第3层：组合调度 + 存库
                                # 调用 collector → processor → analysis_service
                                # 将结果写入 opportunities 表，更新 task 状态
                                # 由 APScheduler 定时触发，或 API 手动触发
```

### 前端模块（`frontend/src/`）

```
src/
├── app/                        # Next.js App Router 页面（只做路由和布局）
│   ├── layout.tsx              # 根布局（字体、Toast Provider、全局样式）
│   ├── page.tsx                # 首页（redirect → /dashboard 或 /login）
│   ├── globals.css             # Tailwind base + 自定义 CSS 变量
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        # 登录/注册页（Tab 切换）
│   ├── dashboard/
│   │   └── page.tsx            # 主仪表盘（任务列表 + 最新机会）
│   └── chat/
│       └── page.tsx            # AI 对话页（聊天界面 + 任务关联）
│
├── components/                 # React 组件（纯 UI，只接收 props，不直接调 store）
│   ├── layout/
│   │   ├── Sidebar.tsx         # 左侧导航栏（路由高亮、用户信息）
│   │   └── Header.tsx          # 顶部栏（页面标题、操作按钮）
│   │
│   ├── chat/
│   │   ├── ChatInput.tsx       # 输入框（发送按钮、停止按钮、回车提交）
│   │   ├── ChatMessage.tsx     # 单条消息（支持打字机流式效果、Markdown）
│   │   └── ChatWindow.tsx      # 聊天窗口容器（消息列表 + 自动滚底）
│   │
│   ├── dashboard/
│   │   ├── TaskCard.tsx        # 任务卡片（状态徽章、手动运行按钮、删除）
│   │   ├── OpportunityCard.tsx # 机会卡片（标题、三段内容、评分展示）
│   │   ├── CreateTaskModal.tsx # 创建任务弹窗（关键词标签输入、数据源选择）
│   │   └── ScoreBar.tsx        # 5 维评分可视化组件（进度条形式）
│   │
│   └── ui/                     # 基础原子组件（设计系统）
│       ├── Button.tsx          # 按钮（variant: primary/ghost/danger + loading 态）
│       ├── Input.tsx           # 输入框（label、error、disabled 态）
│       ├── Badge.tsx           # 状态徽章（pending/running/completed/failed 颜色）
│       └── LoadingSpinner.tsx  # 加载动画
│
├── hooks/                      # Custom React Hooks（封装 store + api，组件的唯一数据入口）
│   ├── useTasks.ts             # 任务相关：fetchTasks、createTask、runTask、deleteTask
│   ├── useOpportunities.ts     # 机会相关：fetchOpportunities（支持 taskId 过滤）
│   ├── useChat.ts              # 聊天相关：sendMessage、clearMessages、setCurrentTask
│   └── useAuth.ts              # 认证相关：login、register、logout、isAuthenticated
│
├── lib/
│   ├── api.ts                  # Axios 实例（含拦截器）+ 所有 API 请求函数
│   │                           # authAPI / taskAPI / opportunityAPI / chatAPI
│   └── utils.ts                # 工具函数（cn 合并 class、格式化时间、截断文字）
│
├── store/
│   └── index.ts                # Zustand stores（auth / task / chat）
│                               # 组件不直接调用此文件，通过 hooks/ 访问
│
└── types/
    └── index.ts                # 所有 TypeScript 类型定义（与后端 Schema 对应）
                                # User / Task / Opportunity / ChatMessage / APIResponse
```

---

## 核心数据流

### 1. 用户创建任务 → 自动定时分析

```
用户在聊天框输入 "帮我分析 AI Agent 相关机会，每小时更新"
    ↓
前端 ChatWindow 发送 POST /api/v1/chat/stream
    ↓
ai_service.chat_stream() 解析用户意图
    ↓
返回操作指令：{"action": "create_task", "params": {...}}
    ↓
前端 taskAPI.create() → POST /api/v1/tasks
    ↓
tasks.py 路由 → 写入数据库 → scheduler_manager.add_task_job()
    ↓
APScheduler 每小时触发 run_analysis_task(task_id)
    ↓
analysis_worker.py:
  1. GitHub API 搜索相关 Issues + Repos
  2. HackerNews API 搜索相关讨论
  3. 合并 + 去重 + 清洗
  4. ai_service.analyze_signals() → OpenAI API
  5. 解析 JSON 响应 → 存储到 opportunities 表
    ↓
前端 Dashboard 定时拉取新机会展示
```

### 2. SSE 流式聊天

```
用户发送消息
    ↓
前端 chatAPI.streamChat() → fetch POST /api/v1/chat/stream
    ↓
后端 StreamingResponse + SSE 格式
    ↓
OpenAI stream=True，逐 token 返回
    ↓
每个 chunk：data: {"type": "delta", "content": "..."}\n\n
    ↓
前端 ReadableStream 读取，追加到消息内容
    ↓
打字机效果展示
    ↓
最后：data: [DONE]\n\n
```

---

## 架构演进计划

| 阶段 | 架构 | 触发条件 | 引入的技术 |
|------|------|---------|-----------|
| **MVP（当前）** | 单体 FastAPI | 笔试提交 | APScheduler + PostgreSQL + Redis |
| **Phase 2** | 拆出独立 Worker 服务 | 并发任务 > 10 | Celery + Redis Queue |
| **Phase 3** | 事件驱动架构 | 日活用户 > 1000 | Kafka 消息队列 + 独立 AI 微服务 |
| **Phase 4** | 云原生微服务 | 企业级部署 | Kubernetes + Flink 实时计算 + Milvus 向量库 |

> **为什么现在不用 Kafka / K8s？**
> Kafka 解决的是「高并发消息传递」问题，你现在的任务量是个位数，APScheduler 够用。
> 过早引入会让环境配置占去 80% 时间，一行业务代码都写不完。
> **知道什么时候该用，比会用更重要。**

---

## 技术选型决策记录（ADR）

### 决策 1：APScheduler 而非 Celery + Kafka
- **背景**：需要定时执行 AI 分析任务
- **备选方案**：Celery（需要 Broker）、Kafka（需要 ZooKeeper）、APScheduler（内嵌）
- **选择**：APScheduler，Job Store 存 Redis
- **原因**：MVP 阶段任务量小，零额外服务依赖，生产环境可直接换 Celery

### 决策 2：PostgreSQL 而非 MongoDB
- **背景**：需要存储用户、任务、机会数据
- **备选方案**：MongoDB（文档型）、PostgreSQL（关系型）
- **选择**：PostgreSQL + pgvector 插件
- **原因**：数据有明确关系（User → Task → Opportunity），需要事务；pgvector 可支持向量检索，一个数据库解决两个问题，不需要额外引入 Milvus/FAISS

### 决策 3：SSE 而非 WebSocket
- **背景**：AI 聊天需要流式输出
- **备选方案**：WebSocket（双向）、SSE（单向服务端推送）、轮询
- **选择**：SSE（Server-Sent Events）
- **原因**：聊天流是单向的（服务端 → 客户端），SSE 比 WebSocket 少维护一半的连接状态

### 决策 4：pgvector 而非 Milvus/FAISS（未来 RAG 功能）
- **背景**：RAG 检索增强功能需要向量存储
- **备选方案**：Milvus（独立服务）、FAISS（内存）、pgvector（PostgreSQL 插件）
- **选择**：pgvector
- **原因**：MVP 阶段向量数据量小（< 100万），pgvector 性能足够，且不引入额外服务。规模化后可迁移 Milvus

### 决策 5：gpt-4o-mini 而非 gpt-4o
- **背景**：AI 分析核心调用
- **选择**：gpt-4o-mini（主）+ DeepSeek（备用/降本）
- **原因**：gpt-4o-mini 成本约 $0.00015/1K tokens，比 gpt-4o 便宜 20 倍，分析任务效果已足够

---

## 关键设计决策

1. **单体优先**：MVP 不拆微服务，所有逻辑在一个 FastAPI 进程，部署简单、调试方便
2. **异步优先**：所有 I/O（DB、HTTP、AI API）全部 async，最大化单进程吞吐
3. **一个数据库解决多个问题**：PostgreSQL（关系数据）+ pgvector（向量检索）+ Redis（缓存/队列），避免运维多套数据库
