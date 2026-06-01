# Tech Stack — Decypher AI

> 所有技术选型已确定，Claude Code 开发时严格遵守，不得自行替换

---

## 后端

| 层级 | 技术 | 版本 | 选择原因 |
|-|-|-|-|
| Web 框架 | **FastAPI** | 0.111.x | 原生异步、自动生成 Swagger 文档、性能优秀 |
| 语言 | **Python** | 3.11+ | 生态成熟，AI 库支持最好 |
| ORM | **SQLAlchemy** | 2.0（async） | 支持异步查询，类型安全 |
| DB 迁移 | **Alembic** | 1.13.x | SQLAlchemy 官方迁移工具 |
| 数据验证 | **Pydantic** | v2 | FastAPI 原生集成，性能比 v1 快 5-10x |
| 配置管理 | **pydantic-settings** | 2.x | 从环境变量自动读取配置，类型安全 |
| 服务器 | **Uvicorn** | 0.29.x | FastAPI 推荐的 ASGI 服务器 |
| HTTP 客户端 | **httpx** | 0.27.x | 异步 HTTP，数据采集必须用 |
| 定时任务 | **APScheduler** | 3.10.x | 轻量级，支持 AsyncIO，无需额外消息队列 |
| 认证 | **python-jose** + **passlib** | 最新稳定版 | JWT 生成/验证 + bcrypt 密码哈希 |

### AI 层

| 组件 | 技术 | 说明 |
|-|-|-|
| 主 AI | **OpenAI API** (gpt-4o-mini) | 成本低、效果好，首选 |
| 备用 AI | **DeepSeek API** | 国内可用，成本更低 |
| SDK | **openai** Python SDK 1.30.x | 官方 SDK，支持 async |
| 切换方式 | 环境变量 `DECYPHER_AI_PROVIDER` | openai / deepseek 动态切换 |

### 数据库

| 角色 | 技术 | 版本 | 用途 |
|-|-|-|-|
| 主数据库 | **PostgreSQL** | 15 | 存储用户、任务、机会数据 |
| 缓存/队列 | **Redis** | 7 | 缓存 + APScheduler Job Store |
| 异步驱动 | **asyncpg** | 0.29.x | PostgreSQL 异步驱动（SQLAlchemy 用） |

---

## 前端

| 层级 | 技术 | 版本 | 选择原因 |
|-|-|-|-|
| 框架 | **Next.js** | 14（App Router） | React 全栈框架，SEO 友好，Vercel 部署简单 |
| 语言 | **TypeScript** | 5.x | 类型安全，减少运行时错误 |
| 样式 | **Tailwind CSS** | 3.4.x | 开发速度快，设计系统一致 |
| 状态管理 | **Zustand** | 4.5.x | 轻量级，比 Redux 简单 10 倍 |
| HTTP | **Axios** | 1.7.x | 请求拦截器、自动 JSON 解析 |
| UI 组件 | **Radix UI** | 最新 | 无样式组件，配合 Tailwind 使用 |
| 图标 | **Lucide React** | 0.383.x | 轻量、风格统一 |
| Toast 通知 | **react-hot-toast** | 2.4.x | 简单好用 |
| 日期处理 | **date-fns** | 3.x | 轻量，比 moment.js 小 |

---

## 基础设施

| 组件 | 技术 | 用途 |
|-|-|-|
| 本地开发 | **Docker Compose** | PostgreSQL + Redis 一键启动 |
| 前端部署 | **Vercel** | 自动 CI/CD，免费套餐够用 |
| 后端部署 | **Railway** | 支持 PostgreSQL，部署简单 |
| CI/CD | **GitHub Actions** | PR 自动测试 + merge 自动部署 |
| API 文档 | **Swagger UI**（FastAPI 内置） | `/api/docs` 自动生成 |

---

## 版本约束（重要）

```
Python >= 3.11
Node.js >= 20.x
PostgreSQL >= 15
Redis >= 7.0
Docker >= 24.0
```

---

## 禁止使用的技术

- ❌ Django / Flask（用 FastAPI）
- ❌ Celery（用 APScheduler，更轻量）
- ❌ Redux Toolkit（用 Zustand）
- ❌ moment.js（用 date-fns）
- ❌ CSS Modules / styled-components（用 Tailwind）
- ❌ JavaScript（所有前端文件必须是 TypeScript）
