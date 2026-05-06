# CLAUDE.md — Decypher AI

> 每次新对话开始时，先读本文件，回复「已就绪」再开始工作。

---

## 项目

Decypher AI — AI 决策引擎。将 GitHub / Reddit / HN 的多源信号，转化为结构化创业机会和投资洞察。

---

## 必读文档索引

| 任务类型 | 读这个文件 |
|---------|-----------|
| 任何开发任务开始前（行为准则） | @.claude/rules/behavior.md |
| 代码风格、命名 | @.claude/rules/code-style.md |
| 测试规范 | @.claude/rules/testing.md |
| Git 流程 | @.claude/rules/workflow.md |
| 系统架构、模块划分 | @docs/architecture.md |
| 技术栈版本 | @docs/tech-stack.md |
| API 接口规范 | @docs/api-design.md |
| 数据库表结构 | @docs/database-schema.md |
| 任务进度 | @tasks/todo.md |
| 经验教训 | @tasks/lessons.md |

---

## 技术栈（不得替换）

- 后端：Python 3.11 + FastAPI + SQLAlchemy 2.0(async) + PostgreSQL 15 + Redis 7
- AI：OpenAI gpt-4o-mini（主）/ DeepSeek（备）
- 定时：APScheduler 3.x（不用 Celery）
- 前端：Next.js 14 + TypeScript + Tailwind + Zustand + Axios
- 部署：前端 Vercel / 后端 Railway

---

## 目录结构

```
DECYPHER AI/
├── CLAUDE.md              ← 本文件
├── .claude/rules/         ← 行为规范（behavior / code-style / testing / workflow）
├── docs/                  ← 项目知识（architecture / tech-stack / api-design / database-schema）
├── tasks/                 ← 任务追踪（todo.md / lessons.md）
├── backend/               ← FastAPI 后端
├── frontend/              ← Next.js 前端
├── docker-compose.yml
└── .env.example
```

---

## 硬性禁止

- 不把 API Key 写入任何代码文件
- 不修改 docker-compose.yml 端口映射
- 不未经确认替换技术栈
- 不一次生成超过 1 个模块（做完确认再做下一个）
- 不在 main.py 写业务逻辑
