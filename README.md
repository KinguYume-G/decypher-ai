# Decypher AI ── 智能科技情报与决策引擎

![Status-Active](https://img.shields.io/badge/Status-Development-emerald?style=for-the-badge&logo=statuspage)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Stitch-38BDF8?style=for-the-badge&logo=tailwindcss)

**Decypher AI** 是一款专为科技创业者、投资机构与科研人员打造的 **AI 智能科技情报决策平台**。它绝非普通的新闻聚合器，而是一个集**全网信号采集、AI 结构化清洗、多 Agent 深度归因、多模态看板展示、RAG 双向交互分析**于一体的闭环情报智能体系统。

通过对全网碎片化信号（GitHub, Hacker News, arXiv, Product Hunt, SEC EDGAR 等）的持续监测，Decypher AI 运用大语言模型（LLM）与专有算法对情报进行多维度打分与分析，并以极具视觉冲击力的 "Cyber-Premium" 玻璃态（Stitch 风格）Bento Grid 仪表板呈现给用户，右侧配备深度联动的 AI Analyst 智能助理，实现“信号发现 → 深度归因 → 用户反馈 → 决策生成”的完整闭环。

---

## 🏗️ 1. 系统架构与数据流向

Decypher AI 采用现代前后端完全解耦的异步微服务架构，以处理高吞吐量的并发采集与重度 LLM 编排任务。

```mermaid
graph TD
    subgraph 外部数据源 (Data Ingestion)
        A1[GitHub API]
        A2[Hacker News]
        A3[arXiv API]
        A4[Product Hunt]
        A5[SEC EDGAR / GDELT]
    end

    subgraph 后端核心服务 (FastAPI Backend)
        B1[APScheduler 定时任务]
        B2[Orchestrator 任务编排器]
        B3[Collector 并发采集服务]
        B4[Processor 数据清洗与去重]
        B5[LLM Client 统一调用链]
        B6[Analysis Service 智能提取评分]
        B7[Chat Service / RAG 检索]
    end

    subgraph 存储与缓存层 (Storage & Cache)
        C1[(PostgreSQL 主数据库)]
        C2[(Redis 任务状态与分布式锁)]
        C3[(PGVector 向量检索)]
    end

    subgraph 前端展示层 (Next.js Cyber UI)
        D1[Left Sidebar 全局导航]
        D2[Center Bento Card 仪表盘]
        D3[Right AI Analyst 双栏联动]
    end

    %% 数据流动方向
    A1 & A2 & A3 & A4 & A5 -->|原始信号| B3
    B1 -->|触发信号| B2
    B2 --> B3 --> B4 --> B5 --> B6
    B4 -->|Hash 校验去重| C2
    B6 -->|结构化入库| C1
    B6 -->|嵌入向量化| C3
    
    C1 & C3 & B7 <==>|REST API / SSE 流式推送| D1 & D2 & D3
    D2 -->|点击卡片联动| D3
    D3 -->|用户反馈 / 追问| B7
```

### 🔁 数据闭环流动机制
1. **Ingest (采集)**：`Collector` 异步轮询或监听第三方 API，抓取最新科技论文、开源库、融资信息、股市变动等。
2. **Process (清洗去重)**：`Processor` 清洗 HTML 标签，生成 Content Hash，并在 Redis 中进行秒级去重，确保无重复噪音。
3. **Analyze (分析打分)**：`Orchestrator` 调用大模型，提取多维度标签，进行 **AI 商业价值与技术可行性评分**，将非结构化文本转化为强结构化的卡片信息。
4. **Serve (消费与联动)**：前端 Next.js 实时渲染卡片，用户点击卡片时，右侧 AI Analyst 自动装载当前卡片的所有关联上下文，实现基于精准信号的智能问答。

---

## 🛠️ 2. 八层技术栈深度映射

Decypher AI 围绕生产级 AI SaaS 应用进行了精准的技术选型，在性能、扩展性与开发周期之间取得最佳平衡：

| 层级 | 核心技术选型 | 在 Decypher AI 中的具体作用 | 规划状态 |
| :--- | :--- | :--- | :---: |
| **L1. 数据与算法基础** | `Python 3.11` / `TypeScript 5` / `spaCy` | 全栈开发语言底座；利用 NLP 库进行冷启动阶段的实体抽取与分词。 | ✅ 已落地 |
| **L2. 数据工程与 ETL** | `APScheduler` + `Redis` + `httpx` (async) | 基于 Redis 的分布式定时任务调度；多源数据异步高并发抓取与 Hash 去重。 | ✅ 已落地 |
| **L3. RAG 知识库层** | `pgvector` / `RecursiveCharacterTextSplitter` | 在 PostgreSQL 基础上直接利用 pgvector 进行卡片和论文的向量存储与相似度检索。 | 🟠 扩展中 |
| **L4. LLM 与模型层** | `OpenAI API` / `DeepSeek API` (Fallback) | 用于高质量信息提取、分析评分以及右侧 AI Analyst 的逻辑推理与流式生成。 | ✅ 已落地 |
| **L5. Agent 智能体层** | `Function Calling` / `Structured Outputs` | 采用 OpenAI 原生的结构化 JSON 输出与工具回调，确保分析数据格式 100% 稳定。 | ✅ 已落地 |
| **L6. 应用与接口层** | `FastAPI (ASGI)` / `Uvicorn` / `SSE` | 异步高性能 Web 服务，承载海量数据 API，支持 AI Chat 的 Server-Sent Events (SSE) 流式传输。 | ✅ 已落地 |
| **L7. 前端展现层** | `Next.js 14 (App Router)` / `Zustand` / `Axios` | 顶层渲染核心，采用 Zustand 极简状态管理，双拦截器处理 Token 刷新。 | ✅ 已落地 |
| **L8. 系统架构与运维** | `Docker` / `Docker Compose` / `PostgreSQL 15` | 本地基础架构一键拉起，提供高可靠的结构化存储与高速缓存。 | ✅ 已落地 |

---

## 📂 3. 规范化项目目录结构

```text
Decypher AI/
├── backend/                         # FastAPI 后端应用
│   ├── app/                         # 业务核心源码
│   │   ├── api/                     # 接口路由层
│   │   │   └── v1/                  # V1 版本 API (auth, tasks, opportunities, chat)
│   │   ├── core/                    # 系统核心配置
│   │   │   ├── config.py            # 全局配置与环境变量映射
│   │   │   ├── database.py          # 异步 SQLAlchemy 连接池
│   │   │   ├── scheduler.py         # APScheduler 任务调度引擎
│   │   │   └── security.py          # JWT 鉴权与密码哈希算法
│   │   ├── models/                  # 数据库 ORM 实体模型 (SQLAlchemy 2.0 Async)
│   │   │   ├── base.py              # 声明性基类
│   │   │   ├── opportunity.py       # 科技情报机会模型
│   │   │   ├── task.py              # 数据采集任务模型
│   │   │   └── user.py              # 用户账户模型
│   │   ├── schemas/                 # Pydantic 数据校验与序列化 (V2)
│   │   │   ├── auth.py              # 登录注册及 Token 架构
│   │   │   ├── opportunity.py       # 机会/卡片序列化结构
│   │   │   └── task.py              # 任务创建与状态结构
│   │   ├── services/                # 核心业务逻辑层 (纯 Service 模式)
│   │   │   ├── analysis_service.py  # AI 智能决策与机会评估分析
│   │   │   ├── chat_service.py      # AI Analyst 追问及流式生成
│   │   │   ├── github_service.py    # GitHub 数据源爬取
│   │   │   ├── hn_service.py        # Hacker News 数据源爬取
│   │   │   └── llm_client.py        # OpenAI/DeepSeek 统合大模型客户端
│   │   └── workers/                 # 数据处理与流水分流器
│   │       ├── collector.py         # 异步数据并发收集器
│   │       ├── orchestrator.py      # 流水线生命周期协调器
│   │       └── processor.py         # 文本正则清洗与 Hash 去重处理器
│   ├── main.py                      # ASGI 启动入口
│   └── requirements.txt             # 依赖声明文件
│
├── frontend/                        # Next.js 14 前端应用 (App Router)
│   ├── src/
│   │   ├── app/                     # 路由与页面组件
│   │   │   ├── (auth)/              # 鉴权路由组 (login, register)
│   │   │   ├── chat/                # AI Analyst 深度交谈室
│   │   │   ├── dashboard/           # Bento Grid 主视图看板
│   │   │   ├── saved/               # 个人情报收藏夹
│   │   │   ├── tasks/               # 定时任务监控及手动触发器
│   │   │   ├── globals.css          # 全局全局样式及 Stitch 主题定义
│   │   │   ├── layout.tsx           # 全局 Layout 注入
│   │   │   └── page.tsx             # 导航中转
│   │   ├── components/              # 共享 UI 组件
│   │   │   ├── layout/              # AppShell 侧边栏与导航骨架
│   │   │   └── ui/                  # 基础原子组件
│   │   ├── hooks/                   # 封装的 React 钩子 (useAuth, useOpportunities, useChat 等)
│   │   ├── lib/                     # 外部服务集成 (api.ts Axios 封装)
│   │   └── store/                   # Zustand 轻量全局状态管理
│   ├── tailwind.config.ts           # Stitch "Cyber-Premium" 调色板及动画参数
│   └── package.json                 # Node 项目配置文件
│
├── docker-compose.yml               # 本地基础设施容器定义 (Postgres 15, Redis 7)
├── .env.example                     # 环境变量范本
└── DEVELOPMENT_REPORT.md            # 系统开发报告与未来架构规划
```

---

## 💾 4. 数据库模式 (Schema) 关系设计

Decypher AI 采用关系型 PostgreSQL 存储核心业务实体，并预留了支持向量检索的扩展结构。

### 📌 实体关系图 (ERD)

```text
+-------------------+             +-----------------------+             +-----------------------+
|       users       |             |         tasks         |             |     opportunities     |
+-------------------+             +-----------------------+             +-----------------------+
| id (PK)           |<----+       | id (PK)               |       +---->| id (PK)               |
| email (Unique)    |     |       | name                  |       |     | title                 |
| hashed_password   |     |       | keyword               |       |     | description           |
| full_name         |     |       | interval_hours        |       |     | score (Float)         |
| created_at        |     |       | is_active             |       |     | market_fit (Float)    |
+-------------------+     |       | last_run              |       |     | technical_bar (Float) |
  |                       |       | created_at            |       |     | status (Draft/Active) |
  |                       |       +-----------------------+       |     | raw_data (JSONB)      |
  |                       |                                       |     | created_at            |
  |                       +----------------------------------+    |     +-----------------------+
  |                                                          |    |
  | 1                                                        |    | 1
  v 0..*                                                     v    | 0..*
+-------------------+             +-----------------------+  |    |     +-----------------------+
|    chat_sessions  |             |         cards         |--+----+     |     user_favorites    |
+-------------------+             +-----------------------+             +-----------------------+
| id (PK)           |             | id (PK)               |             | id (PK)               |
| user_id (FK)      |             | opportunity_id (FK)   |             | user_id (FK)          |
| card_id (FK)----->+             | category (Enum)       |             | card_id (FK)          |
| messages (JSONB)  |             | title                 |             +-----------------------+
| created_at        |             | summary               |
+-------------------+             | score                 |
                                  | tags (JSONB)          |
                                  | is_favorited          |
                                  +-----------------------+
```

### 📝 新增扩展表 DDL (面向 Phase 2/3)

```sql
-- 1. 信息卡片表：作为前端 Dashboard 展示与交互的最小物理单元
CREATE TABLE cards (
    id              SERIAL PRIMARY KEY,
    opportunity_id  INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
    category        VARCHAR(50) NOT NULL,   -- 'market' | 'research' | 'startup' | 'stocks' | 'jobs'
    title           VARCHAR(300) NOT NULL,
    summary         TEXT NOT NULL,
    score           FLOAT NOT NULL DEFAULT 0.0,
    tags            JSONB NOT NULL DEFAULT '[]',
    source          VARCHAR(100),           -- 'github' | 'hackernews' | 'arxiv' | ...
    detail_analysis TEXT,                   -- AI 深度剖析
    risk_notes      TEXT,                   -- 潜在风险
    next_steps      TEXT,                   -- 下一步行动建议
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cards_category ON cards(category);
CREATE INDEX idx_cards_score ON cards(score DESC);

-- 2. 原始信号数据暂存表：用于去重及多级加工过滤
CREATE TABLE items (
    id              SERIAL PRIMARY KEY,
    source          VARCHAR(50) NOT NULL,   -- 'github' | 'hackernews' | ...
    external_id     VARCHAR(200),           -- 外部 API 的唯一 ID
    title           VARCHAR(500) NOT NULL,
    body            TEXT,
    url             VARCHAR(2000),
    content_hash    VARCHAR(64) UNIQUE,     -- 用于防重
    published_at    TIMESTAMPTZ,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_items_content_hash ON items(content_hash);

-- 3. 用户收藏关联表
CREATE TABLE user_favorites (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id     INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, card_id)
);

-- 4. 对话会话历史表：实现 AI Analyst 聊天的历史保存与追问
CREATE TABLE chat_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id         INTEGER REFERENCES cards(id) ON DELETE SET NULL,
    messages        JSONB NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🚀 5. 快速开始与本地开发指南

根据以下步骤，你可以在 Windows/macOS 系统上一键拉起整个开发环境。

### 5.1 环境前置准备
在你的系统上，请确保已安装以下工具：
*   **Python 3.11+**
*   **Node.js 20.x (LTS)**
*   **Docker Desktop** (在 Windows 上建议开启 WSL2 引擎)
*   **Git**

---

### 5.2 步骤一：配置环境变量
在项目根目录下，基于 `.env.example`（或直接新建）创建全局 `.env` 文件。

```env
# ── 安全鉴权配置 ──
DECYPHER_SECRET_KEY=9a15fcf80e302061de88f01b3a1a1f0a1c6a2c3b4d5e6f7g8h9i0j  # 随机生成的长十六进制串
DECYPHER_ACCESS_TOKEN_EXPIRE_MINUTES=10080                                 # Token 有效期（默认 7 天）

# ── 数据库与缓存配置 (Docker Compose 默认端口) ──
DECYPHER_DATABASE_URL=postgresql+asyncpg://decypher:decypher123@localhost:5432/decypher_db
DECYPHER_REDIS_URL=redis://localhost:6379/0

# ── 大语言模型配置 ──
DECYPHER_AI_PROVIDER=openai                                                # openai | deepseek | ollama
OPENAI_API_KEY=sk-proj-yourActualOpenAIApiKeyHere                          # 对应供应商的 API Key
DECYPHER_OPENAI_MODEL=gpt-4o-mini                                          # 默认使用高性价比模型

# ── 跨域与网络配置 ──
NEXT_PUBLIC_API_URL=http://localhost:8000
DECYPHER_ALLOWED_ORIGINS=http://localhost:3000
```

---

### 5.3 步骤二：拉起基础设施 (Database & Cache)
在项目根目录，通过 PowerShell/Terminal 运行 Docker Compose，后台拉起 PostgreSQL 与 Redis 容器：

```powershell
docker compose up -d
```

> **验证状态**：运行 `docker compose ps` 确保 `decypher-postgres` 与 `decypher-redis` 的状态为 `Up` 且端口映射正常 (5432 / 6379)。

---

### 5.4 步骤三：初始化并运行后端 (FastAPI)
1. 进入 backend 文件夹，创建 Python 虚拟环境并激活：
   ```powershell
   cd backend
   python -m venv .venv
   
   # Windows 激活命令
   .venv\Scripts\Activate.ps1
   # macOS/Linux 激活命令
   # source .venv/bin/activate
   ```
2. 安装依赖包：
   ```powershell
   pip install -r requirements.txt
   ```
3. 启动开发服务器（热重载模式）：
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
4. **服务自测**：访问 [http://localhost:8000/health](http://localhost:8000/health)，若返回 `{"status": "healthy"}` 则表示后端启动成功！
   > 访问 [http://localhost:8000/docs](http://localhost:8000/docs) 可以查看完整交互式 Swagger API 文档。

---

### 5.5 步骤四：初始化并运行前端 (Next.js)
1. 打开一个新的终端窗口，进入 frontend 文件夹：
   ```powershell
   cd frontend
   ```
2. 安装 Node.js 依赖：
   ```powershell
   npm install
   ```
3. 启动本地 Next.js 开发服务器：
   ```powershell
   npm run dev
   ```
4. **浏览器访问**：打开 [http://localhost:3000](http://localhost:3000)，你将看到极致美观的 Bento Box 玻璃态仪表板。

---

## 📡 6. 核心开发 API 概览

### 🔑 6.1 用户鉴权模块
| API 端点 | 请求方法 | 描述 | 鉴权要求 |
| :--- | :---: | :--- | :---: |
| `/api/v1/auth/register` | `POST` | 注册新用户 | 🟢 公开 |
| `/api/v1/auth/token` | `POST` | 登录获取 JWT Access Token (`OAuth2PasswordRequestForm`) | 🟢 公开 |
| `/api/v1/auth/me` | `GET` | 获取当前登录用户的详细信息 | 🔴 JWT Token |

### ⚙️ 6.2 任务管道管理模块
| API 端点 | 请求方法 | 描述 | 鉴权要求 |
| :--- | :---: | :--- | :---: |
| `/api/v1/tasks/` | `GET` | 获取当前用户的全部采集调度任务列表 | 🔴 JWT Token |
| `/api/v1/tasks/` | `POST` | 创建新的关键字采集调度任务 (如 "AI Agent", "SaaS") | 🔴 JWT Token |
| `/api/v1/tasks/{task_id}` | `DELETE` | 删除指定的采集任务，同时注销 Redis 中的调度 | 🔴 JWT Token |
| `/api/v1/tasks/{task_id}/trigger` | `POST` | **即时手动触发** 该任务的数据抓取与大模型分析流水线 | 🔴 JWT Token |

### 📊 6.3 科技情报/机会模块
| API 端点 | 请求方法 | 描述 | 鉴权要求 |
| :--- | :---: | :--- | :---: |
| `/api/v1/opportunities/` | `GET` | 检索已被 AI 提取评分的所有科技机会，支持过滤 | 🔴 JWT Token |
| `/api/v1/opportunities/{opp_id}` | `GET` | 查询单个机会的深度剖析 JSON (包含痛点、风险、商业模式) | 🔴 JWT Token |

### 💬 6.4 AI Analyst 互动模块
| API 端点 | 请求方法 | 描述 | 鉴权要求 |
| :--- | :---: | :--- | :---: |
| `/api/v1/chat/stream` | `GET` | 开启 Server-Sent Events (SSE) **流式对话** 管道 | 🔴 JWT Token |

> **流式调用示例 (EventSource)**：
> 前端通过 `GET /api/v1/chat/stream?message=your_question&opportunity_id=123` 建立长连接，后端会逐字推送大模型的解析内容。

---

## 🔒 7. 安全规范与最佳实践

1. **环境隔离**：切勿将 `.env` 提交至 Git 仓库。本地的 `.env` 必须被 `..gitignore` 覆盖。在生产环境（例如 Vercel / Railway / AWS）请使用平台内置的 Environment Secrets 管理。
2. **密钥强度**：生产环境中的 `DECYPHER_SECRET_KEY` 必须通过加密强随机数生成器产生（如 `openssl rand -hex 32`）。
3. **数据库连接限制**：在高并发场景下，使用 `asyncpg` 连接池需要妥善限制池的最大尺寸（例如 `max_overflow=10`, `pool_size=20`），防止耗尽 PostgreSQL 的进程连接数。
4. **LLM 熔断与多供应商灾备**：大模型调用设置有超时重试与供应商 Fallback 机制（当 OpenAI 出现网络抖动时，底层 `llm_client.py` 会自动切换至备选的 DeepSeek API 或本地 Ollama 实例）。

---

*Decypher AI ── 用智能解码科技，以决策重构未来。*
