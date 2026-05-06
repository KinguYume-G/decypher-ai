# Decypher AI 前期开发文档

本文档汇总当前仓库的项目理解、项目地图、Windows 本地开发环境方案、环境变量与密钥梳理、`.env.example` 草案，以及后续最小可运行落地顺序。

当前结论基于仓库真实内容：

- 项目目标与约束来源：`CLAUDE.md`
- 系统架构来源：`docs/architecture.md`
- 技术栈来源：`docs/tech-stack.md`
- API 设计来源：`docs/api-design.md`
- 数据库设计来源：`docs/database-schema.md`
- 任务状态来源：`tasks/todo.md`
- 当前代码状态来源：`backend/app/**`、`frontend/src/**`
- 环境变量来源：`.env`

重要说明：

- 本文档不包含 `.env` 中任何真实密钥值。
- 当前仓库是"文档 + 空代码骨架"状态，不能直接启动。
- 当前未发现 `backend/main.py`、`backend/requirements.txt`、`frontend/package.json`、`docker-compose.yml`、`.env.example`。
- 当前 `backend/app/**` 与 `frontend/src/**` 中的实现文件均为 0 行（`__init__.py` 等骨架文件存在但无内容）。
- 当前 `.gitignore` 为空，存在提交 `.env`、`node_modules`、`.next`、`.venv` 的风险。
- 当前 Git 根目录是 `C:\Users\hp`（用户主目录），不是项目目录 `C:\Users\hp\Desktop\Decypher AI`，这会把整个用户主目录纳入 Git 追踪范围。
- `tasks/todo.md` 标记 `.env.example` 和 `docker-compose.yml` 为 `[x]` 已完成，但实际文件不存在，文档与现实不符。
- 开发环境是 **Windows 11 + PowerShell**，所有命令均应使用 PowerShell 语法。

---

## 一、项目理解与环境落地报告

### A. 项目用途与目标

- Decypher AI 是一个 AI 决策引擎，把 GitHub、Reddit、Hacker News 的多源信号转成结构化创业机会和投资洞察。来源：`CLAUDE.md`、`docs/architecture.md`
- 核心业务流是：用户创建分析任务 → 后端定时采集外部信号 → 清洗去重 → 调用 OpenAI/DeepSeek 分析 → 写入 opportunities 表 → 前端 Dashboard/Chat 展示。来源：`docs/architecture.md`
- 当前仓库完成度：文档和空目录骨架已存在，后端、前端代码文件全是 0 行；`README.md`、`.gitignore` 也是空文件；项目当前不能直接启动。来源：`backend/app/**`、`frontend/src/**`、仓库扫描

### B. 技术栈全景

- **前端框架**：Next.js 14 App Router、TypeScript 5.x、Tailwind CSS 3.4.x、Zustand 4.5.x、Axios 1.7.x、Radix UI、Lucide React、react-hot-toast、date-fns 3.x。来源：`docs/tech-stack.md`
- **后端框架**：Python 3.11+、FastAPI 0.111.x、SQLAlchemy 2.0（async）、Pydantic v2、pydantic-settings 2.x、Uvicorn 0.29.x、httpx 0.27.x、APScheduler 3.10.x。来源：`docs/tech-stack.md`
- **认证**：python-jose（JWT 生成/验证）+ passlib（bcrypt 密码哈希）。来源：`docs/tech-stack.md`
- **数据库**：PostgreSQL 15（主数据库，存 users/tasks/opportunities）；未来向量检索选择 pgvector 插件，不引入 Milvus/FAISS。来源：`docs/database-schema.md`、`docs/architecture.md`
- **缓存 / Job Store**：Redis 7，用于缓存和 APScheduler Job 持久化存储。MVP 不使用 Celery/Kafka。来源：`docs/architecture.md`、`docs/database-schema.md`
- **异步驱动**：asyncpg 0.29.x（PostgreSQL 异步驱动，由 SQLAlchemy 使用）。来源：`docs/tech-stack.md`
- **AI / LLM**：OpenAI gpt-4o-mini 为主，DeepSeek 为备用，通过环境变量 `DECYPHER_AI_PROVIDER` 切换。SDK：openai Python SDK 1.30.x。来源：`docs/tech-stack.md`、`.env`
- **部署**：前端 Vercel，后端 Railway；本地开发应使用 Docker Compose 跑 PostgreSQL + Redis，但该文件实际缺失，需要创建。来源：`docs/tech-stack.md`、`CLAUDE.md`
- **包管理与运行时要求**：Python ≥ 3.11，Node.js ≥ 20.x，Docker ≥ 24.0。来源：`docs/tech-stack.md`

### C. 仓库结构地图

```
Decypher AI/                    ← 项目根目录（应成为独立 Git 仓库）
├── .env                        ← 真实密钥（不提交）
├── .env.example                ← 待创建：只含占位值的模板
├── .gitignore                  ← 待完善：当前为空
├── docker-compose.yml          ← 待创建：PostgreSQL 15 + Redis 7
├── CLAUDE.md                   ← 项目总纲与行为约束
├── DEVELOPMENT_REPORT.md       ← 本文档
├── README.md                   ← 当前为空
│
├── docs/                       ← 项目知识文档（只读，不修改）
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── api-design.md
│   └── database-schema.md
│
├── backend/
│   ├── main.py                 ← 待创建：FastAPI ASGI 入口
│   ├── requirements.txt        ← 待创建：Python 依赖清单
│   └── app/                   ← FastAPI 应用包
│       ├── config.py           ← 空：pydantic-settings 全局配置
│       ├── database.py         ← 空：AsyncEngine + AsyncSession + init_db()
│       ├── models/             ← 空：SQLAlchemy ORM 模型
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── task.py
│       │   └── opportunity.py
│       ├── schemas/            ← 空：Pydantic 请求/响应模型
│       │   └── __init__.py
│       ├── api/                ← 空：HTTP 路由层
│       │   ├── deps.py
│       │   └── v1/
│       │       ├── __init__.py
│       │       ├── auth.py
│       │       ├── tasks.py
│       │       ├── opportunities.py
│       │       ├── signals.py
│       │       └── chat.py
│       ├── services/           ← 空：业务逻辑层
│       │   ├── analysis_service.py
│       │   ├── chat_service.py
│       │   ├── base_data_service.py
│       │   ├── github_service.py
│       │   ├── hn_service.py
│       │   └── reddit_service.py
│       ├── core/               ← 空：基础设施工具
│       │   ├── __init__.py
│       │   ├── security.py
│       │   └── scheduler.py
│       └── workers/            ← 空：后台分析 Pipeline
│           ├── __init__.py
│           ├── collector.py
│           ├── processor.py
│           └── orchestrator.py
│
├── frontend/
│   ├── package.json            ← 待创建：Next.js 依赖清单
│   └── src/                   ← Next.js 应用（全部为空骨架）
│       ├── app/               ← App Router 页面
│       ├── components/        ← React 组件
│       ├── hooks/             ← Custom Hooks
│       ├── lib/               ← api.ts + utils.ts
│       ├── store/             ← Zustand stores
│       └── types/             ← TypeScript 类型定义
│
├── tasks/
│   ├── todo.md                ← 任务进度追踪
│   └── lessons.md             ← 经验记录（当前为空）
│
└── .claude/rules/             ← Claude Code 行为规范
    ├── behavior.md
    ├── code-style.md
    ├── testing.md
    └── workflow.md
```

**关键缺失文件（必须在开发前创建）：**

| 文件 | 说明 | 优先级 |
|------|------|--------|
| `backend/main.py` | FastAPI ASGI 入口，`uvicorn main:app` 的目标 | P0 |
| `backend/requirements.txt` | Python 依赖声明 | P0 |
| `frontend/package.json` | Node.js 依赖声明 + Next.js 脚本 | P0 |
| `docker-compose.yml` | PostgreSQL 15 + Redis 7 本地服务 | P0 |
| `.env.example` | 环境变量模板（只含占位值） | P0 |
| `.gitignore` | 忽略 `.env`、`.venv`、`node_modules`、`.next` 等 | P0 |

### D. 后端入口文件结构（`backend/main.py`）

FastAPI 应用的 ASGI 入口文件需要在 `backend/main.py`，而不在 `backend/app/` 里。原因：`uvicorn main:app` 从 `backend/` 目录执行，指向 `backend/main.py` 中的 `app` 对象。

`main.py` 的核心职责（实现阶段参考）：
1. 创建 `FastAPI()` 实例
2. 配置 `lifespan` 上下文管理器，在启动时调用 `await init_db()`，初始化 APScheduler
3. 挂载 CORS 中间件（读取 `DECYPHER_ALLOWED_ORIGINS`）
4. 注册 `/api/v1/` 路由前缀下的各模块路由
5. 注册 `GET /health` 路由

`app/` 包是功能实现层，`main.py` 只做组装，不含业务逻辑（对应 `CLAUDE.md` 的硬性禁止）。

### E. 启动链路

**设计上的本地启动顺序（按依赖关系）：**

1. 启动 PostgreSQL 15（Docker）
2. 启动 Redis 7（Docker）
3. 确认 `.env` 已配置
4. 创建 Python 虚拟环境并安装依赖
5. 启动 FastAPI 后端（端口 8000）
6. 验证 `http://localhost:8000/health`
7. 安装前端 npm 依赖
8. 启动 Next.js 前端（端口 3000）
9. 验证 `http://localhost:3000`

**重要**：`.env` 位于项目根目录，而后端从 `backend/` 子目录启动。FastAPI 应用通过 `python-dotenv` 或 `pydantic-settings` 的 `env_file` 参数指定加载路径。可选方案：在 `backend/main.py` 中使用 `load_dotenv("../.env")`，或在 `pydantic-settings` 的 `Settings` 类中配置 `model_config = SettingsConfigDict(env_file="../.env")`。

### F. 核心数据流

#### 1. 用户创建任务 → 定时分析
```
前端输入关键词 → POST /api/v1/tasks
→ tasks.py 路由 → 写 tasks 表 → scheduler_manager.add_task_job()
→ APScheduler 定时触发 run_analysis_task(task_id)
→ workers/orchestrator.py:
    1. collector.py：并发调用 github/hn/reddit service 采集
    2. processor.py：去重、清洗、截断、格式化
    3. analysis_service.py：调用 OpenAI API → 解析 JSON
    4. 写入 opportunities 表，更新 task.status + last_run_at
→ 前端 Dashboard 拉取新机会展示
```

#### 2. SSE 流式聊天
```
用户发消息 → POST /api/v1/chat/stream
→ chat_service.py → OpenAI stream=True
→ FastAPI StreamingResponse（text/event-stream）
→ 每个 chunk：data: {"type": "delta", "content": "..."}
→ 最后：data: [DONE]
→ 前端 ReadableStream 接收，打字机效果展示
```

#### 3. APScheduler 生命周期
```
FastAPI lifespan startup → scheduler_manager.start()
→ 从 Redis Job Store 恢复已有 Job
→ 每个 active task 注册 IntervalTrigger
→ FastAPI lifespan shutdown → scheduler_manager.shutdown()
```

### G. 依赖与环境要求

| 工具 | 最低版本 | 用途 | 是否必须 |
|------|---------|------|---------|
| Python | 3.11 | 后端运行时 | 是 |
| Node.js | 20.x LTS | 前端运行时 | 是 |
| npm | 随 Node 安装 | 包管理 | 是 |
| Docker Desktop | 24.0 | 运行 PostgreSQL + Redis | 强烈推荐 |
| Git | 任意现代版 | 版本管理 | 是 |
| PostgreSQL | 15 | 主数据库 | 是（Docker 提供） |
| Redis | 7.0 | 缓存 + Job Store | 是（Docker 提供） |
| Kafka | - | MVP **不需要**，Phase 3 才引入 | 否 |

### H. 当前阻塞点（按优先级）

1. **最大阻塞**：缺少 `backend/main.py`、`backend/requirements.txt`、`frontend/package.json`、`docker-compose.yml`、`.env.example`，项目完全无法启动。
2. **Git 边界问题**：当前 Git 根是 `C:\Users\hp`（用户主目录），会把整个用户主目录和桌面文件纳入追踪。需要在项目目录 `C:\Users\hp\Desktop\Decypher AI` 初始化独立 Git 仓库。
3. **`.gitignore` 为空**：有提交 `.env`（真实 API Key）、`.venv`、`node_modules`、`.next` 等的风险。
4. **文档与现实不符**：`tasks/todo.md` 标记 `.env.example` 和 `docker-compose.yml` 为已完成，但文件不存在。
5. **`.env` 加载路径**：`.env` 在项目根，后端在 `backend/` 子目录启动，需要明确加载路径策略。

---

## 二、项目地图（模块职责说明）

### 阅读顺序 1：项目总入口与业务目标

用户从浏览器进入 Next.js 前端，通过 Chat UI / Dashboard / Task Manager 操作；前端通过 REST API + SSE 调用 FastAPI 后端。

来源：`docs/architecture.md`、`CLAUDE.md`

### 阅读顺序 2：前端页面入口

设计入口在 `frontend/src/app/`：

| 文件 | 职责 | 当前状态 |
|------|------|---------|
| `page.tsx` | 首页，重定向到 `/dashboard` 或 `/login` | 空 |
| `(auth)/login/page.tsx` | 登录/注册（Tab 切换） | 空 |
| `dashboard/page.tsx` | 仪表盘（任务列表 + 最新机会） | 空 |
| `chat/page.tsx` | AI 对话页（流式打字机效果） | 空 |
| `layout.tsx` | 根布局（字体、Toast Provider） | 空 |

来源：`docs/architecture.md`、`frontend/src/app/**`

### 阅读顺序 3：前端 API 调用层

所有 HTTP 请求必须通过 `frontend/src/lib/api.ts`。组件禁止直接 `fetch()`。

- Axios 实例 + 请求/响应拦截器（自动附加 Authorization header）
- 导出：`authAPI`、`taskAPI`、`opportunityAPI`、`chatAPI`

来源：`docs/architecture.md`、`.claude/rules/code-style.md`

### 阅读顺序 4：后端入口与路由

请求通过 `backend/main.py` 进入，路由前缀 `/api/v1/`，健康检查 `/health`。

`backend/app/api/deps.py` 提供两个核心依赖注入：
- `get_db()`：注入 `AsyncSession`
- `get_current_user()`：解析 JWT，返回当前用户

来源：`docs/api-design.md`、`docs/architecture.md`

### 阅读顺序 5：路由层（只做参数校验 + 调用 service + 返回）

| 文件 | 负责接口 |
|------|---------|
| `api/v1/auth.py` | POST /register、POST /login、GET /me |
| `api/v1/tasks.py` | CRUD + POST /{id}/run |
| `api/v1/opportunities.py` | GET 列表（支持 task_id 过滤）+ GET 详情 |
| `api/v1/signals.py` | 原始信号（占位，后期实现） |
| `api/v1/chat.py` | POST /stream（SSE）+ POST /message |

来源：`docs/architecture.md`、`docs/api-design.md`

### 阅读顺序 6：业务逻辑层（services/）

| 文件 | 职责 |
|------|------|
| `analysis_service.py` | 信号文本 → 调用 OpenAI/DeepSeek → 结构化机会 JSON |
| `chat_service.py` | AI 对话，支持 stream 和非 stream 模式 |
| `base_data_service.py` | 数据采集公共基类，定义 `search()` 接口 |
| `github_service.py` | GitHub API（Token 认证，60 → 5000次/小时） |
| `hn_service.py` | Hacker News（Algolia API，无需认证） |
| `reddit_service.py` | Reddit（OAuth2，MVP 阶段为占位实现） |

来源：`docs/architecture.md`

### 阅读顺序 7：数据模型层

| 文件 | 对应数据库表 |
|------|------------|
| `database.py` | AsyncEngine 工厂 + `get_db()` + `init_db()` |
| `models/user.py` | `users` 表 |
| `models/task.py` | `tasks` 表 + `TaskStatus` 枚举 |
| `models/opportunity.py` | `opportunities` 表（含 5 维评分字段） |

数据关系：`users` 1:N `tasks` 1:N `opportunities`。

来源：`docs/database-schema.md`、`docs/architecture.md`

### 阅读顺序 8：后台 Pipeline（workers/）

三层顺序执行：

```
orchestrator.py
  └─ 调用 collector.py   → 并发采集各 service 原始数据 → List[RawSignal]
  └─ 调用 processor.py   → 去重、清洗、格式化 → signals_text
  └─ 调用 analysis_service → OpenAI 分析 → opportunities JSON
  └─ 写入数据库，更新 task 状态
```

由 `core/scheduler.py`（APScheduler）定时触发，或 `POST /tasks/{id}/run` 手动触发。

来源：`docs/architecture.md`

### 阅读顺序 9：基础设施层（core/）

| 文件 | 职责 |
|------|------|
| `core/security.py` | JWT 生成/验证（python-jose HS256）+ bcrypt 密码哈希（passlib） |
| `core/scheduler.py` | APScheduler 管理器，封装 add/remove/pause/resume job |

来源：`docs/architecture.md`、`docs/tech-stack.md`

### 阅读顺序 10：配置层（config.py）

`pydantic-settings` 的 `Settings` 类，从 `.env` 读取所有环境变量。

**重要**：由于后端从 `backend/` 目录启动，读取 `.env` 时需要指定路径 `../. env`（相对于 `backend/`），或在启动脚本中切换到项目根目录。

---

## 三、Windows 本地开发环境安装方案

> 所有命令均为 **PowerShell** 语法（Windows 11 环境）。

### 1. Docker 优先方案（推荐）

Docker 负责 PostgreSQL + Redis；本机负责 Python 后端和 Node 前端。

**需要安装：**

| 工具 | 来源 | 说明 |
|------|------|------|
| Git | git-scm.com | 版本管理，必须 |
| Python 3.11+ | python.org | 安装时勾选 "Add Python to PATH" |
| Node.js 20 LTS | nodejs.org | 随附 npm |
| Docker Desktop 24+ | docker.com | 启用 WSL 2 backend |

**安装顺序：**

```powershell
# 验证已安装工具版本
git --version
python --version      # 期望 >= 3.11
node --version        # 期望 >= 20
npm --version
docker --version      # 期望 >= 24
docker compose version
```

**常见报错：**

| 错误 | 原因 | 解决 |
|------|------|------|
| `python is not recognized` | Python 未加入 PATH | 重装时勾选 "Add Python to PATH" |
| `node is not recognized` | Node.js 未加入 PATH | 重启 PowerShell 或刷新 PATH |
| `docker: command not found` | Docker Desktop 未安装或未启动 | 启动 Docker Desktop |
| `Cannot connect to Docker daemon` | WSL integration 未启用 | Docker Desktop → Settings → WSL integration |
| 端口冲突 | 5432/6379/8000/3000 被占用 | 检查并关闭冲突进程 |

### 2. 前后端启动命令（当前不可执行，等待依赖文件创建后使用）

**后端启动流程（PowerShell）：**

```powershell
# 进入后端目录
cd backend

# 创建并激活虚拟环境
python -m venv .venv
.venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt

# 启动后端（从 backend/ 目录执行，main.py 在此目录）
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**后端验证（PowerShell）：**

```powershell
# PowerShell 中用 Invoke-RestMethod 替代 curl
Invoke-RestMethod http://localhost:8000/health
# 或使用 curl.exe（注意区分 PowerShell 的 curl 别名）
curl.exe http://localhost:8000/health
```

期望返回：

```json
{"status": "healthy", "service": "Decypher AI Backend", "version": "0.1.0"}
```

**前端启动流程（PowerShell）：**

```powershell
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动前端开发服务器
npm run dev
```

**前端验证：** 浏览器打开 `http://localhost:3000`，应看到 Decypher AI 首页或登录页。

### 3. Docker Compose 启动数据库（等待 docker-compose.yml 创建后使用）

```powershell
# 在项目根目录执行
docker compose up -d postgres redis
docker compose ps
```

期望 `postgres` 和 `redis` 服务均显示 `running` 或 `healthy`。

**失败排查：**

- Docker Desktop 未启动
- 端口 5432 或 6379 被本机其他服务占用
- `.env` 中 `DECYPHER_DATABASE_URL` 的账号密码与 `docker-compose.yml` 配置不一致

### 4. 原生安装方案（仅在 Docker 不可用时）

直接在 Windows 上安装 PostgreSQL 15 for Windows 和 Redis（建议通过 WSL2 的 Ubuntu 安装 Redis，因为 Windows 原生 Redis 长期无官方维护）。

不推荐原因：环境更容易与端口、权限、服务注册冲突，后续复现困难。

---

## 四、环境变量与密钥梳理

当前环境变量来源是项目根目录 `.env`。代码中无读取实现（`backend/app/config.py` 为空）；文档设计由 `pydantic-settings` 读取。

来源：`.env`、`docs/architecture.md`、`docs/tech-stack.md`

### 1. 环境变量完整表

| 变量名 | 是否必须 | 类别 | 用途 | 是否需手动提供 |
|--------|---------|------|------|-------------|
| `DECYPHER_APP_ENV` | 可选 | 应用配置 | 运行环境（development / production） | 否，默认 development |
| `DECYPHER_SECRET_KEY` | **必须** | JWT 安全 | JWT 签名密钥，生产必须随机生成 | **是** |
| `DECYPHER_DEBUG` | 可选 | 应用配置 | Debug 开关，生产必须 false | 否，默认 false |
| `DECYPHER_ALLOWED_ORIGINS` | **必须** | CORS 配置 | 允许跨域的源，本地开发填 `http://localhost:3000` | **是** |
| `DECYPHER_DATABASE_URL` | **必须** | 数据库 | PostgreSQL 连接串，格式 `postgresql+asyncpg://user:pass@host:port/db` | **是** |
| `DECYPHER_REDIS_URL` | **必须** | Redis | Redis 连接串，格式 `redis://host:port/db` | **是** |
| `OPENAI_API_KEY` | **必须** | AI 服务 | OpenAI API Key（主 AI 服务） | **是** |
| `OPENAI_MODEL` | 可选 | AI 服务 | OpenAI 模型名，默认 `gpt-4o-mini` | 否 |
| `OPENAI_MAX_TOKENS` | 可选 | AI 服务 | 最大 token 数，默认 4096 | 否 |
| `DEEPSEEK_API_KEY` | 条件必须 | AI 服务 | DeepSeek API Key（备用，启用时必须） | 是，若用 DeepSeek |
| `DEEPSEEK_MODEL` | 可选 | AI 服务 | DeepSeek 模型名，默认 `deepseek-chat` | 否 |
| `DECYPHER_AI_PROVIDER` | **必须** | AI 服务 | 切换主 AI 服务：`openai` 或 `deepseek` | **是** |
| `GITHUB_TOKEN` | 条件必须 | 数据采集 | GitHub Personal Access Token（未认证限 60次/小时，认证后 5000次/小时） | 是，若启用 GitHub 采集 |
| `REDDIT_CLIENT_ID` | 条件必须 | 数据采集 | Reddit OAuth2 App Client ID | 是，若启用 Reddit |
| `REDDIT_CLIENT_SECRET` | 条件必须 | 数据采集 | Reddit OAuth2 App Client Secret | 是，若启用 Reddit |
| `REDDIT_USER_AGENT` | 条件必须 | 数据采集 | Reddit API User-Agent 字符串 | 是，若启用 Reddit |
| `NEXT_PUBLIC_API_URL` | **必须** | 前端配置 | 前端调用后端的基础 URL，本地 `http://localhost:8000` | **是** |
| `NEXT_PUBLIC_APP_NAME` | 可选 | 前端配置 | 应用显示名称，默认 `Decypher AI` | 否 |
| `NEXT_PUBLIC_APP_VERSION` | 可选 | 前端配置 | 前端版本号 | 否 |
| `DECYPHER_DEFAULT_TASK_INTERVAL` | 可选 | 任务配置 | 默认任务执行间隔（秒），默认 3600 | 否 |
| `DECYPHER_MAX_CONCURRENT_TASKS` | 可选 | 任务配置 | 最大并发任务数，默认 5 | 否 |
| `DECYPHER_RATE_LIMIT_PER_MINUTE` | 可选 | API 配置 | 每分钟速率限制，默认 60 | 否 |

**注意：** 对象存储（S3/OSS/MinIO）在 MVP 阶段不需要，原始信号数据不持久化，每次重新采集。Kafka 不需要，MVP 使用 APScheduler。

### 2. 本地开发最小必填集合

开发启动只需提供：

```
DECYPHER_SECRET_KEY=<任意随机字符串，开发可用 "dev-secret">
DECYPHER_DATABASE_URL=postgresql+asyncpg://decypher:decypher123@localhost:5432/decypher_db
DECYPHER_REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=<真实 OpenAI Key>
DECYPHER_AI_PROVIDER=openai
DECYPHER_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

GitHub + Reddit 采集功能在未填写对应 Key 时可降级为空列表返回，不影响核心启动。

---

## 五、`.env.example` 草案

> 注意：以下只是草案，不代表已创建 `.env.example` 文件。所有值均为占位示例，不含任何真实密钥。

```env
# ── 应用配置 ──────────────────────────────────────────
DECYPHER_APP_ENV=development
DECYPHER_SECRET_KEY=change-me-to-a-random-secret-key
DECYPHER_DEBUG=true
DECYPHER_ALLOWED_ORIGINS=http://localhost:3000

# ── 数据库 ────────────────────────────────────────────
DECYPHER_DATABASE_URL=postgresql+asyncpg://decypher:decypher@localhost:5432/decypher_db

# ── Redis ─────────────────────────────────────────────
DECYPHER_REDIS_URL=redis://localhost:6379/0

# ── OpenAI（主 AI 服务）────────────────────────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4096

# ── DeepSeek（备用 AI 服务）────────────────────────────
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-chat
DECYPHER_AI_PROVIDER=openai

# ── GitHub 数据采集 ────────────────────────────────────
GITHUB_TOKEN=

# ── Reddit 数据采集 ────────────────────────────────────
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=DecypherAI/0.1.0

# ── 前端配置 ──────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Decypher AI
NEXT_PUBLIC_APP_VERSION=0.1.0

# ── 任务与限流配置 ─────────────────────────────────────
DECYPHER_DEFAULT_TASK_INTERVAL=3600
DECYPHER_MAX_CONCURRENT_TASKS=5
DECYPHER_RATE_LIMIT_PER_MINUTE=60
```

---

## 六、后续落地顺序

> 以下是完整的最小可运行落地步骤。每步完成后等待确认再执行下一步。

### 阶段 0：修复环境基础（不写业务代码）

**步骤 0.1 — 初始化项目 Git 仓库**

当前 Git 根是 `C:\Users\hp`（用户主目录），需要在项目目录创建独立 Git 仓库。

操作（需用户确认后执行）：
1. 在 `C:\Users\hp\Desktop\Decypher AI` 内执行 `git init`
2. 确认 `.git/` 创建在正确位置

**步骤 0.2 — 补全 `.gitignore`**

必须忽略：`.env`、`.venv`、`node_modules`、`.next`、`__pycache__`、`*.pyc`、`.pytest_cache`、`dist`、`build`、`*.log`、`.DS_Store`

**步骤 0.3 — 创建 `.env.example`**

从第五节草案生成，只填占位值，不复制真实密钥。

**步骤 0.4 — 创建 `docker-compose.yml`**

只包含 PostgreSQL 15 和 Redis 7，端口映射与 `.env` 一致（5432 / 6379），账号密码与 `DECYPHER_DATABASE_URL` 一致。

### 阶段 1：后端最小可运行（`GET /health` 能访问）

**文件创建顺序：**

1. `backend/requirements.txt`（锁定所有依赖版本）
2. `backend/app/config.py`（pydantic-settings Settings 类，含 `.env` 加载路径）
3. `backend/app/database.py`（AsyncEngine + AsyncSession + `init_db()`）
4. `backend/main.py`（FastAPI 实例 + lifespan + CORS + 路由注册 + `/health`）

**验证标准：**
```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
# 新终端：
Invoke-RestMethod http://localhost:8000/health
# 返回 {"status":"healthy",...}
```

### 阶段 2：用户认证模块（P0）

遵循 `workflow.md` 定义的开发顺序：**Model → Schema → Service → API Route → Test**

1. `backend/app/models/user.py` → 验证：表结构正确创建
2. `backend/app/schemas/__init__.py`（`UserCreate`、`UserOut`、`TokenOut`、`APIResponse`）→ 验证：Pydantic 校验通过
3. `backend/app/core/security.py`（JWT 生成/验证 + bcrypt）→ 验证：单元测试通过
4. `backend/app/api/deps.py`（`get_db`、`get_current_user`）
5. `backend/app/api/v1/auth.py`（POST /register、POST /login、GET /me）→ 验证：接口测试通过
6. `backend/tests/test_auth.py`（成功注册 + 登录 + 未认证 401）

**完成标准：** `pytest tests/test_auth.py -v` 全绿。

### 阶段 3：任务 CRUD + APScheduler（P0）

遵循 Model → Schema → Service → API Route → Test 顺序：

1. `backend/app/models/task.py`（含 `TaskStatus` 枚举）
2. `backend/app/schemas/__init__.py`（追加 `TaskCreate`、`TaskOut`、`TaskUpdate`）
3. `backend/app/core/scheduler.py`（APScheduler 管理器，Redis Job Store）
4. `backend/app/api/v1/tasks.py`（CRUD + POST /{id}/run）
5. `backend/tests/test_tasks.py`

**完成标准：** `pytest tests/test_tasks.py -v` 全绿，`POST /api/v1/tasks` 能创建任务并触发 APScheduler Job。

### 阶段 4：前端最小可运行（登录页面能访问）

1. `frontend/package.json` + `frontend/next.config.ts` + `frontend/tsconfig.json` + `frontend/tailwind.config.ts` + `frontend/postcss.config.mjs`
2. `frontend/src/app/globals.css`（Tailwind 基础样式）
3. `frontend/src/app/layout.tsx`（根布局）
4. `frontend/src/app/(auth)/login/page.tsx`（最小登录页）
5. `frontend/src/types/index.ts`（TypeScript 类型定义）
6. `frontend/src/lib/api.ts`（Axios 实例 + `authAPI`）
7. `frontend/src/store/index.ts`（auth store）
8. `frontend/src/hooks/useAuth.ts`

**验证标准：** 浏览器打开 `http://localhost:3000/login`，登录表单可见，能调用后端 `/api/v1/auth/login`。

### 阶段 5：数据采集 + AI Pipeline（P1）

按 Model → Schema → Service → API Route → Test 顺序：

1. `backend/app/models/opportunity.py`
2. `backend/app/schemas/__init__.py`（追加 `OpportunityOut`）
3. `backend/app/services/base_data_service.py`（基类）
4. `backend/app/services/github_service.py`（`search_issues`、`search_repos`）
5. `backend/app/services/hn_service.py`（`search`）
6. `backend/app/services/reddit_service.py`（占位实现）
7. `backend/app/workers/collector.py`
8. `backend/app/workers/processor.py`
9. `backend/app/services/analysis_service.py`（OpenAI 调用 + JSON 解析）
10. `backend/app/workers/orchestrator.py`（组合 + 存库）
11. `backend/app/api/v1/opportunities.py`
12. `backend/tests/test_ai_service.py`（Mock OpenAI）
13. `backend/tests/test_data_service.py`（Mock httpx）

### 阶段 6：SSE 聊天接口 + 前端 Dashboard（P1）

1. `backend/app/services/chat_service.py`（stream + 非 stream）
2. `backend/app/api/v1/chat.py`（POST /stream SSE + POST /message）
3. 前端 Dashboard 组件（TaskCard、OpportunityCard、CreateTaskModal）
4. 前端 Chat 组件（ChatWindow、ChatMessage、ChatInput）
5. 前后端对接与集成测试

### 阶段 7：CI/CD 与部署（P2/P3）

1. GitHub Actions 工作流（后端测试 + 前端 lint + type-check）
2. Vercel 部署前端（设置环境变量）
3. Railway 部署后端 + PostgreSQL + Redis

---

## 七、执行边界

本文档为分析与规划文档，**不包含任何代码实现**。

未执行的事项：

- 未修改任何业务代码文件
- 未覆盖或修改 `.env`
- 未创建 `.env.example`
- 未创建 `docker-compose.yml`
- 未安装 Python 依赖
- 未安装 Node 依赖
- 未启动 Docker
- 未启动数据库
- 未启动 Redis
- 未执行数据库迁移
- 未初始化项目 Git 仓库
- 未执行任何 git commit

下一步行动：确认本报告准确无误后，从**阶段 0（修复环境基础）**开始，按顺序逐步执行。每个阶段完成后等待确认再进行下一阶段。
