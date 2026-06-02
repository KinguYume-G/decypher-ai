# CLAUDE.md — Decypher AI

> 这是 Claude Code 的项目上下文文件。每次会话开始时读取此文件，获取项目当前状态。

---

## 项目简介

**Decypher AI** 是一个 AI 驱动的科技情报平台。后端持续从 15+ 数据源采集信号，调用大模型分析后生成结构化的「机会卡片」，前端以 Bento Grid 仪表板展示，右侧配备 SSE 流式 AI Analyst。

商业化目标：面向科技创业者和研究者，专注「创业机会」模块作为突破口。

---

## 技术栈速查

| 层 | 技术 | 版本 |
|-|-|-|
| 后端框架 | FastAPI + Uvicorn | 0.115.6 / 0.34.0 |
| 数据库 ORM | SQLAlchemy 2.0 Async + asyncpg | 2.0.36 |
| 数据验证 | Pydantic v2 + pydantic-settings | 2.10.6 |
| 认证 | python-jose (JWT) + bcrypt | — |
| 定时任务 | APScheduler 3.x + Redis JobStore | 3.10.4 |
| HTTP 客户端 | httpx (async) | 0.28.1 |
| AI SDK | openai Python SDK | 1.58.0 |
| 数据库 | PostgreSQL 15 (Docker) | — |
| 缓存/队列 | Redis 7 (Docker) | — |
| 前端框架 | Next.js 14 (App Router) + TypeScript | — |
| 状态管理 | Zustand | — |
| 样式 | Tailwind CSS | — |
| HTTP | Axios (含拦截器) | — |

---

## 目录结构

```
decypher-ai/
├── backend/
│   ├── main.py                  # FastAPI 入口，注册路由 + lifespan
│   ├── requirements.txt
│   ├── app/
│   │   ├── config.py            # 所有环境变量（DECYPHER_* 前缀）
│   │   ├── database.py          # 异步 Engine + get_db() + init_db()
│   │   ├── api/v1/              # HTTP 路由层（参数校验 + 调用 service，直接读写 DB）
│   │   ├── core/                # security.py（JWT/bcrypt）+ scheduler.py
│   │   ├── models/              # SQLAlchemy ORM 模型
│   │   ├── schemas/             # Pydantic 请求/响应 Schema（集中在 __init__.py）
│   │   ├── integrations/        # 外部数据源适配器（15+ 数据源），仅 collector 调用
│   │   │   └── base_data_service.py  # 抽象基类：RawSignal + search() 接口
│   │   ├── services/            # AI 处理服务（pipeline / analysis / chat / llm_client）
│   │   │   ├── pipeline_service.py   # API → Worker 的唯一桥梁（手动触发入口）
│   │   │   └── agents/              # LLM 提示词模板
│   │   └── workers/             # Pipeline：collector → processor → orchestrator
│   └── tests/
├── frontend/src/
│   ├── app/                     # Next.js App Router 页面
│   ├── components/              # UI 组件（layout / dashboard / chat / ui）
│   ├── hooks/                   # Custom hooks（数据入口，封装 store + api）
│   ├── lib/api.ts               # Axios 实例 + 所有 API 请求函数（唯一调用入口）
│   ├── store/index.ts           # Zustand stores（auth / task / chat）
│   └── types/index.ts           # TypeScript 类型定义
├── docs/                        # 详细设计文档
│   ├── product.md               # 产品定位、五大模块、完整产品闭环（稳定）
│   ├── status.md                # 当前实现状态、缺口、技术债务（每 Sprint 更新）
│   ├── roadmap.md               # 分阶段开发计划 + 实现规格（Phase 1~4）
│   ├── architecture.md          # 系统架构、模块职责、层间调用关系
│   ├── api/                     # API 接口文档（按资源分文件）
│   ├── database/                # 数据库设计文档
│   └── external_api/            # 外部 API 参考文档（15+ 数据源）
├── docker-compose.yml           # PostgreSQL 15 + Redis 7
└── .env.example                 # 环境变量模板（复制为 .env 后填值）
```

---

## 后端两条独立路径

FastAPI 内部存在两条完全独立的执行路径，共用同一个 PostgreSQL：

**路径 A — API 请求/响应路径：**
```
HTTP 请求 → API 路由 → deps.py（注入 DB session + JWT 验证）
  → PostgreSQL 直接操作（CRUD: tasks / notes / opps / cards）
  → chat_service（仅 chat.py，SSE 流式对话）
```

**路径 B — Pipeline 执行路径：**
```
手动触发: POST /tasks/{id}/run → pipeline_service → orchestrator
定时触发: APScheduler → orchestrator（直接，跳过 pipeline_service）
  orchestrator → collector → app/integrations/（各数据源，并发 HTTP）
  orchestrator → processor（去重/截断/格式化）
  orchestrator → analysis_service → llm_client → LLM API → 写库
```

**关键约束：** API 路由层绝不直接调用 `app/integrations/` 中的任何类。

---

## 本地开发启动顺序

```powershell
# 1. 基础设施（PostgreSQL + Redis）
docker compose up -d

# 2. 后端
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 3. 前端（新终端）
cd frontend
npm install
npm run dev
```

验证后端：`GET http://localhost:8000/health` → `{"status": "healthy"}`
Swagger 文档：`http://localhost:8000/api/docs`
前端地址：`http://localhost:3000`

---

## 常用开发命令

```powershell
# 后端测试
cd backend
pytest tests/ -v
pytest tests/ -x
pytest tests/ -v --cov=app --cov-report=term-missing

# 前端检查
cd frontend
npm run type-check
npm run lint
npm run dev
```

---

## 数据库表

| 表 | 说明 |
|-|-|
| `users` | 用户账号（email / hashed_password） |
| `tasks` | 采集任务配置（keywords / sources / schedule / category） |
| `opportunities` | AI 分析结果，5 维评分，关联 task |
| `notes` | 用户自由文本笔记 |
| `user_favorites` | 用户收藏（user × opportunity 多对多） |

建表：启动时 `init_db()` 自动执行 `CREATE TABLE IF NOT EXISTS`。  
⚠️ **Alembic 尚未配置**，引入新表前必须先完成迁移体系建设，否则生产环境无法零停机更新 schema。

---

## API 路由总览

| 前缀 | 文件 | 说明 |
|-|-|-|
| `/api/v1/auth` | `api/v1/auth.py` | 注册 / 登录 / 当前用户 |
| `/api/v1/tasks` | `api/v1/tasks.py` | 任务 CRUD + 手动触发（→ pipeline_service） |
| `/api/v1/opportunities` | `api/v1/opportunities.py` | AI 分析结果列表/详情 |
| `/api/v1/cards` | `api/v1/cards.py` | 按 category 浏览卡片 + 收藏切换 |
| `/api/v1/chat` | `api/v1/chat.py` | SSE 流式 AI 对话（→ chat_service） |
| `/api/v1/notes` | `api/v1/notes.py` | 用户笔记 CRUD |
| `/api/v1/seed` | `api/v1/seed.py` | 一键写入演示数据 |
| `/health` | `main.py` | 健康检查（无需认证） |

所有接口（除 `/health`、`/auth/register`、`/auth/login`）需要 `Authorization: Bearer <jwt>` 头。

---

## 数据源状态

| 状态 | 服务（文件在 `app/integrations/`） |
|-|-|
| ✅ 无需 Key | arXiv, HN (Algolia), OpenAlex, SEC EDGAR, Dev.to, Papers With Code, Semantic Scholar, Remote OK, RSS |
| 🔑 需要 Token | GitHub (`GITHUB_TOKEN`) |
| 🟡 建议申请（免费） | Stack Exchange (`STACKEXCHANGE_API_KEY`), Product Hunt (`PRODUCTHUNT_API_KEY`) |
| 🔴 占位未实现 | Reddit（固定返回 `[]`，需注册 Reddit App） |

---

## AI 供应商切换

由 `DECYPHER_AI_PROVIDER` 控制：

| 值 | 说明 |
|-|-|
| `ollama` | 本地免费（需先 `ollama pull qwen3:14b`），开发默认 |
| `openai` | 生产推荐，设置 `OPENAI_API_KEY` + `OPENAI_MODEL` |
| `deepseek` | 备用，设置 `DEEPSEEK_API_KEY` + `DEEPSEEK_MODEL` |

---

## 环境变量关键字段

```env
DECYPHER_SECRET_KEY=        # JWT 签名密钥，生产必须改
DECYPHER_DATABASE_URL=      # postgresql+asyncpg://decypher:decypher@localhost:5432/decypher_db
DECYPHER_REDIS_URL=         # redis://localhost:6379/0
DECYPHER_AI_PROVIDER=       # ollama | openai | deepseek
GITHUB_TOKEN=               # GitHub API Token
NEXT_PUBLIC_API_URL=        # 前端调用后端的地址，默认 http://localhost:8000
```

完整列表见 `.env.example`。

---

## 下一步重点（当前 Sprint）

优先级从高到低：

1. **Alembic 迁移体系** — 在添加任何新表前必须完成，命令见 roadmap.md
2. **items 表** — 原始信号入库，是 RAG 的前置依赖
3. **pgvector + 向量化** — 为 items 生成 embedding
4. **RAG Chat** — chat_service 引入向量检索，AI Analyst 能引用具体信号
5. **Phase 1 前端** — 五模块 Tab 真实过滤 + 卡片选中 → AI Analyst 联动

详见 [docs/roadmap.md](docs/roadmap.md) 和 [docs/status.md](docs/status.md)。

---

## 开发规则文件

| 文件 | 覆盖范围 |
|-|-|
| `.claude/rules/behavior.md` | 思考方式、简洁优先、精准修改、任务节律 |
| `.claude/rules/code-style.md` | Python/TypeScript 命名、类型、异步、注释规范 |
| `.claude/rules/testing.md` | pytest 结构、覆盖率要求、Mock 规范 |
| `.claude/rules/workflow.md` | Git 提交格式、开发顺序、文件修改限制 |
