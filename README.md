# Decypher AI ── 智能科技情报与决策引擎

![Status-Active](https://img.shields.io/badge/Status-Development-emerald?style=for-the-badge&logo=statuspage)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=nextdotjs)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis)

**Decypher AI** 是一款面向科技创业者和研究者的 **AI 智能情报决策平台**。它持续监测全网碎片化信号（GitHub、Hacker News、arXiv、Product Hunt、SEC EDGAR 等 15 个以上数据源），运用大语言模型对信号进行结构化分析和多维度评分，并在 Bento Grid 仪表板上展示可操作的机会卡片，右侧配备联动的 AI Analyst 智能助理。

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

**数据流**：`采集 (Collector)` → `清洗去重 (Processor)` → `AI 分析打分 (Analysis Service)` → `存库 (PostgreSQL)` → `前端渲染`。用户点击卡片时，右侧 AI Analyst 自动装载该卡片上下文，支持流式追问。

---

## 详细文档

| 文档 | 内容 |
|-|-|
| [docs/architecture.md](docs/architecture.md) | 模块划分、文件职责、层间调用关系 |
| [docs/api-design.md](docs/api-design.md) | 所有 API 端点、请求/响应格式、状态码规范 |
| [docs/database-schema.md](docs/database-schema.md) | 数据库表结构、字段说明、状态机、ERD |
| [docs/tech-stack.md](docs/tech-stack.md) | 技术选型及版本约束 |
| [docs/external_api/](docs/external_api/) | 外部 API 调用文档 |

---

## 快速开始

### 前置要求

- Python 3.11+
- Node.js 20.x (LTS)
- Docker Desktop（建议开启 WSL2）
- Git

### 1. 配置环境变量

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```env
# 鉴权
DECYPHER_SECRET_KEY=<openssl rand -hex 32 生成>
DECYPHER_ACCESS_TOKEN_EXPIRE_MINUTES=10080

# 数据库与缓存（Docker Compose 默认端口）
DECYPHER_DATABASE_URL=postgresql+asyncpg://decypher:decypher123@localhost:5432/decypher_db
DECYPHER_REDIS_URL=redis://localhost:6379/0

# 大模型（openai | deepseek | ollama）
DECYPHER_AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
DECYPHER_OPENAI_MODEL=gpt-4o-mini

# 跨域
NEXT_PUBLIC_API_URL=http://localhost:8000
DECYPHER_ALLOWED_ORIGINS=http://localhost:3000
```

### 2. 拉起数据库与缓存

```powershell
docker compose up -d
# 验证：docker compose ps（确保 postgres 和 redis 状态为 Up）
```

### 3. 启动后端

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

访问 `http://localhost:8000/health` 验证启动；Swagger 文档在 `http://localhost:8000/api/docs`。

### 4. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

打开 `http://localhost:3000` 查看仪表板。

---

*Decypher AI ── 用智能解码科技，以决策重构未来。*
