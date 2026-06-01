# Decypher AI ── 智能科技情报与决策引擎

![Status-Active](https://img.shields.io/badge/Status-Development-emerald?style=for-the-badge&logo=statuspage)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)

AI 驱动的科技情报平台，持续从 15+ 数据源采集信号，通过 LLM 分析生成结构化机会卡片，右侧配备 SSE 流式 AI Analyst。→ [了解产品定位](docs/product.md)

---

## 系统架构

```mermaid
graph TD
    subgraph 外部数据源
        A1[GitHub] & A2[Hacker News] & A3[arXiv]
        A4[Product Hunt] & A5[SEC / OpenAlex / Dev.to / ...]
    end

    subgraph FastAPI 后端 :8000
        B1[APScheduler 定时调度]
        B2[Orchestrator 任务编排]
        B3[Collector 并发采集]
        B4[Processor 清洗去重]
        B5[LLM Client]
        B6[Analysis Service]
        B7[Chat Service / SSE]
    end

    subgraph 存储层
        C1[(PostgreSQL)]
        C2[(Redis — Job Store)]
    end

    subgraph Next.js 前端 :3000
        D1[Dashboard — Bento 卡片]
        D2[AI Analyst — 右侧聊天]
        D3[Tasks — 任务管理]
    end

    A1 & A2 & A3 & A4 & A5 -->|原始信号| B3
    B1 -->|定时触发| B2
    B2 --> B3 --> B4 --> B5 --> B6
    B6 -->|结构化机会| C1
    B2 -->|Job 元数据| C2
    C1 <-->|REST API / SSE| D1 & D2 & D3
    D2 -->|用户追问| B7
```

---

## 文档

### 文档索引

| 文档 | 内容 |
|-|-|
| [docs/product.md](docs/product.md) | 产品定位、五大模块、完整产品闭环 |
| [docs/status.md](docs/status.md) | 当前实现状态、功能缺口、技术债务 |
| [docs/roadmap.md](docs/roadmap.md) | 分阶段开发计划（Phase 1~4）+ 实现规格 |
| [docs/architecture.md](docs/architecture.md) | 系统架构、模块职责、层间调用关系 |
| [docs/api-design.md](docs/api-design.md) | API 端点、请求/响应格式、状态码规范 |
| [docs/database/overview.md](docs/database/overview.md) | 数据库概览、ERD、迁移策略 |
| [docs/database/current_schema.md](docs/database/current_schema.md) | 当前表结构定义 + 数据样例 |
| [docs/database/extension_plan.md](docs/database/extension_plan.md) | Phase 1~3 规划中的新表 |
| [docs/tech-stack.md](docs/tech-stack.md) | 技术选型及版本约束 |
| [docs/external_api/](docs/external_api/) | 外部 API 参考文档（15+ 数据源） |

### 阅读顺序

根据你的角色选择起点：

| 角色 | 阅读路径 |
|-|-|
| **新成员 / 初次了解项目** | [product](docs/product.md) → [architecture](docs/architecture.md) → [status](docs/status.md) → [roadmap](docs/roadmap.md) |
| **接手某个功能开发** | [status](docs/status.md)（确认缺口）→ [roadmap](docs/roadmap.md)（实现规格）→ [api-design](docs/api-design.md) / [database](docs/database/overview.md) |
| **AI 编程助手（Claude Code）** | 见 `CLAUDE.md`（已自动加载） |

---

## 快速开始

### 前置要求

- Python 3.11+
- Node.js 20.x (LTS)
- Docker Desktop（建议开启 WSL2）

### 1. 配置环境变量

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```env
DECYPHER_SECRET_KEY=<openssl rand -hex 32 生成>
DECYPHER_DATABASE_URL=postgresql+asyncpg://decypher:decypher123@localhost:5432/decypher_db
DECYPHER_REDIS_URL=redis://localhost:6379/0
DECYPHER_AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_API_URL=http://localhost:8000
DECYPHER_ALLOWED_ORIGINS=http://localhost:3000
```

### 2. 启动基础设施

```powershell
docker compose up -d
```

### 3. 启动后端

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

验证：`http://localhost:8000/health` → `{"status": "healthy"}`  
Swagger：`http://localhost:8000/api/docs`

### 4. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

打开 `http://localhost:3000`。

---

*Decypher AI ── 用智能解码科技，以决策重构未来。*
