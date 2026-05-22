# Decypher AI — 项目全面总结

## 一、项目定位

**Decypher AI** 是一个 **AI 驱动的智能决策与机会发现引擎**。核心价值主张：用户配置关键词和数据源，系统自动从 GitHub、Hacker News、Reddit 持续采集技术信号，经由 LLM（OpenAI/DeepSeek/Ollama）分析，输出结构化的创业机会和投资洞察，并支持流式 AI 对话深度分析。

---

## 二、技术架构

### 整体架构图

```
浏览器 (Next.js :3000)
    ↓ REST API + SSE
FastAPI 后端 (:8000)
    ↓
PostgreSQL (数据持久化) + Redis (缓存 + APScheduler Job Store)
    ↓
外部 API: GitHub / HackerNews / Reddit / OpenAI / DeepSeek
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) + TypeScript |
| 前端样式 | Tailwind CSS（Glassmorphism 赛博朋克风格） |
| 前端状态 | Zustand |
| 前端 HTTP | Axios |
| 后端框架 | FastAPI (ASGI) + Python 3.11+ |
| 数据库 ORM | SQLAlchemy 2.0 (全异步) + asyncpg |
| 数据库 | PostgreSQL 15 |
| 缓存/队列 | Redis 7 |
| 定时任务 | APScheduler 3.x (Redis Job Store) |
| 认证 | JWT (python-jose) + bcrypt (passlib) |
| AI 接入 | OpenAI SDK（兼容 Ollama / DeepSeek） |
| 容器化 | Docker Compose |

---

## 三、后端详细结构

### 数据模型（3张核心表）

```
users (1) ──→ tasks (N) ──→ opportunities (N)
```

- **users**：邮箱、用户名、bcrypt 密码哈希、激活状态
- **tasks**：关键词数组(JSONB)、数据源数组(JSONB)、执行间隔、状态机（pending/running/completed/failed/paused）、运行次数
- **opportunities**：AI 生成的机会标题、三段内容（做什么/为什么/怎么做）、5 维评分（趋势/新颖性/竞争/可行性/商业）

### API 路由（`/api/v1/`）

| 路由 | 功能 |
|------|------|
| `POST /auth/register` | 注册 + 返回 JWT |
| `POST /auth/login` | 登录 + 返回 JWT |
| `GET /auth/me` | 获取当前用户 |
| `CRUD /tasks` | 任务增删改查 |
| `POST /tasks/{id}/run` | 手动触发分析 |
| `GET /opportunities` | 获取机会列表（支持 task_id 过滤） |
| `POST /chat/message` | AI 对话（非流式） |
| `GET /health` | 健康检查 |

### AI Pipeline（三层 Worker 架构）

```
APScheduler 定时触发
    ↓
orchestrator.py（编排层）
    ↓
collector.py（采集层）── asyncio.gather 并发调用
    ├── github_service.py  → GitHub Issues + Repos
    ├── hn_service.py      → HN Algolia API
    └── reddit_service.py  → 占位（未实现）
    ↓
processor.py（清洗层）── 去重、按 score 排序、截断至 8000 字符
    ↓
analysis_service.py（AI 分析层）── 调用 LLM，解析 JSON，返回机会列表
    ↓
写入 opportunities 表
```

### LLM 客户端设计

支持三种 Provider，通过环境变量 `DECYPHER_AI_PROVIDER` 切换：
- **ollama**（本地开发，默认）：调用 `http://localhost:11434/v1`
- **openai**（生产）：调用 OpenAI API
- **deepseek**（备用/降本）：调用 DeepSeek API

---

## 四、前端详细结构

### 页面路由

| 路由 | 页面 |
|------|------|
| `/login` | 登录/注册（Glassmorphism 风格，JWT 存 localStorage） |
| `/dashboard` | 命令中心（任务列表 + 最新机会 + 统计卡片） |
| `/tasks` | 任务管理（创建/运行/删除任务） |
| `/saved` | 机会列表（所有 AI 生成的机会） |
| `/market` | 市场洞察（机会汇总统计） |
| `/chat` | AI 深度对话（可关联特定机会，侧边栏显示评分） |
| `/settings` | 账户设置 + 登出 |

### 组件架构

每个页面都有两套实现：
1. **Stitch 静态版**（注释掉的 HTML 原型，来自 UI 设计工具）
2. **Experience 动态版**（实际连接后端 API 的功能版本）

这种双版本设计说明项目是先做 UI 原型再接入真实数据的开发流程。

### 数据流

```
组件 → hooks（useTasks/useOpportunities/useChat/useAuth）
    → api.ts（Axios 实例，自动注入 JWT）
    → 后端 API
    → Zustand store（auth 状态）
```

---

## 五、安全设计

- JWT Token 有效期 7 天，HS256 签名
- 密码 bcrypt 哈希，不存明文
- CORS 通过环境变量 `DECYPHER_ALLOWED_ORIGINS` 严格控制
- 所有任务/机会接口都验证 `user_id` 归属，防止越权访问
- `.env` 文件被 `.gitignore` 排除，API Key 不入代码

---

## 六、当前开发状态

### ✅ 已完成

- 完整的后端骨架（FastAPI + 数据库 + 认证 + 调度器）
- 用户认证模块（注册/登录/JWT）
- 任务 CRUD + APScheduler 集成
- **完整的 AI Pipeline**（采集 → 清洗 → LLM 分析 → 入库）
- GitHub 和 HN 数据采集服务
- LLM 客户端（支持 Ollama/OpenAI/DeepSeek 三路切换）
- 机会查询 API
- AI 对话服务（非流式）
- 前端所有页面（Dashboard/Tasks/Opportunities/Chat/Settings）
- 前端 hooks 和 API 客户端

### ⚠️ 待完善

- Reddit 采集（当前是占位符，返回空列表）
- SSE 流式聊天（后端 `chat.py` 只有非流式 `/message`，缺少 `/stream` 端点）
- 前后端完整联调测试
- CI/CD 配置（GitHub Actions）
- 生产部署（Vercel + Railway）

---

## 七、本地启动方式

```bash
# 1. 启动基础设施
docker compose up -d postgres redis

# 2. 后端
cd backend
python -m venv .venv && .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. 前端
cd frontend
npm install && npm run dev
```

访问 `http://localhost:3000`，API 文档在 `http://localhost:8000/api/docs`。

---

## 八、架构亮点总结

这个项目的架构设计相当成熟，几个值得注意的决策：

1. **APScheduler 而非 Celery**：MVP 阶段任务量小，避免引入 Broker 的额外复杂度
2. **全异步 I/O**：FastAPI + asyncpg + httpx，所有外部调用不阻塞主线程
3. **LLM 抽象层**：一个 `llm_client.py` 统一封装三个 Provider，防止供应商锁定
4. **双版本前端页面**：Stitch 原型 + 真实 Experience，设计与开发解耦
5. **JSON 解析容错**：`_extract_json()` 处理了 qwen3 的 `<think>` 块、markdown 代码围栏等 LLM 输出噪音
