# CLAUDE.md — Decypher AI

> 这是 Claude Code 的项目上下文文件。每次会话开始时读取此文件，获取项目当前状态。

---

## 项目简介

**Decypher AI** 是一个 AI 驱动的科技情报平台。后端持续从 15+ 数据源采集信号，调用大模型分析后生成结构化的「机会卡片」，前端以 Bento Grid 仪表板展示，右侧配备 SSE 流式 AI Analyst。

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
│   │   ├── api/v1/              # HTTP 路由层（只做参数校验 + 调 service）
│   │   ├── core/                # security.py（JWT/bcrypt）+ scheduler.py
│   │   ├── models/              # SQLAlchemy ORM 模型
│   │   ├── schemas/             # Pydantic 请求/响应 Schema（集中在 __init__.py）
│   │   ├── services/            # 业务逻辑 + 15+ 数据源采集服务
│   │   │   └── agents/          # LLM 提示词模板
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
│   ├── architecture.md          # 模块划分、层间调用关系
│   ├── api-design.md            # 所有 API 端点规范
│   ├── database-schema.md       # 数据库表结构 + ERD
│   └── tech-stack.md            # 技术选型及版本约束
├── docker-compose.yml           # PostgreSQL 15 + Redis 7
└── .env.example                 # 环境变量模板（复制为 .env 后填值）
```

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
pytest tests/ -v                            # 跑全部测试
pytest tests/ -x                            # 遇到第一个失败立即停止
pytest tests/ -v --cov=app --cov-report=term-missing  # 带覆盖率

# 前端检查
cd frontend
npm run type-check                          # TypeScript 检查
npm run lint                                # ESLint
npm run dev                                 # 启动开发服务器（热重载）
```

---

## 数据库表

| 表 | 说明 |
|-|-|
| `users` | 用户账号（email / hashed_password） |
| `tasks` | 采集任务配置（keywords / sources / schedule） |
| `opportunities` | AI 分析结果，5 维评分，关联 task |
| `notes` | 用户自由文本笔记 |
| `user_favorites` | 用户收藏（user × opportunity 多对多） |

建表：启动时 `init_db()` 自动执行 `CREATE TABLE IF NOT EXISTS`，开发阶段无需 Alembic。

---

## API 路由总览

| 前缀 | 文件 | 说明 |
|-|-|-|
| `/api/v1/auth` | `api/v1/auth.py` | 注册 / 登录 / 当前用户 |
| `/api/v1/tasks` | `api/v1/tasks.py` | 任务 CRUD + 手动触发 |
| `/api/v1/opportunities` | `api/v1/opportunities.py` | AI 分析结果列表/详情 |
| `/api/v1/cards` | `api/v1/cards.py` | 按 category 浏览卡片 + 收藏切换 |
| `/api/v1/chat` | `api/v1/chat.py` | SSE 流式 AI 对话 |
| `/api/v1/notes` | `api/v1/notes.py` | 用户笔记 CRUD |
| `/api/v1/seed` | `api/v1/seed.py` | 一键写入演示数据 |
| `/health` | `main.py` | 健康检查（无需认证） |

所有接口（除 `/health`、`/auth/register`、`/auth/login`）需要 `Authorization: Bearer <jwt>` 头。

---

## 数据采集 Pipeline

```
APScheduler (每 interval_seconds)
  └─ orchestrator.run_analysis_task(task_id)
       ├─ collector.collect(task)      ← 并发调用所有数据源 service
       ├─ processor.process(signals)   ← 去重 + 截断 + 格式化为文本
       └─ analysis_service.analyze()  ← 调用 LLM → 存库 Opportunity
```

手动触发：`POST /api/v1/tasks/{id}/run`

---

## 数据源状态

| 状态 | 服务 |
|-|-|
| ✅ 无需 Key | arXiv, HN (Algolia), OpenAlex, SEC EDGAR, Dev.to, Papers With Code, Semantic Scholar, Remote OK, RSS |
| 🔑 需要 Token | GitHub (`GITHUB_TOKEN`) |
| 🟡 建议申请（免费） | Stack Exchange (`STACKEXCHANGE_API_KEY`), Product Hunt (`PRODUCTHUNT_API_KEY`) |
| 🔴 占位未实现 | Reddit (`reddit_service.py` 固定返回 `[]`) |

---

## AI 供应商切换

由 `DECYPHER_AI_PROVIDER` 控制，三个可选值：

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

## 开发规则文件

行为、代码风格、测试、工作流规则已写入 `.claude/rules/`，Claude Code 会自动加载：

| 文件 | 覆盖范围 |
|-|-|
| `.claude/rules/behavior.md` | 思考方式、简洁优先、精准修改、任务节律 |
| `.claude/rules/code-style.md` | Python/TypeScript 命名、类型、异步、注释规范 |
| `.claude/rules/testing.md` | pytest 结构、覆盖率要求、Mock 规范 |
| `.claude/rules/workflow.md` | Git 提交格式、开发顺序、文件修改限制 |
