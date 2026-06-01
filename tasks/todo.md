# Decypher AI — 任务追踪

> 每次开发任务开始时，Claude 在这里写计划，用户确认后执行。

---

## 当前阶段：准备阶段 ✅

- [x] 项目骨架生成
- [x] CLAUDE.md 编写
- [x] docs/ 文档体系（architecture / tech-stack / api-design / database-schema）
- [x] .claude/rules/ 行为规范（behavior / code-style / testing / workflow）
- [x] .env.example
- [x] docker-compose.yml

---

## 当前阶段：环境配置 🔄

- [x] 安装 Python 3.12 虚拟环境 (适配系统本机 Python 3.12)
- [x] 安装后端依赖（pip install -r requirements.txt）
- [ ] 启动 Docker Compose（PostgreSQL + Redis）
- [ ] 配置 .env（填入真实 API Key）
- [x] 验证后端底层与测试完全通过 (26/26 单元测试 100% 成功通过)
- [x] 安装前端依赖（npm install - 已预装完成）
- [ ] 验证前端能启动（npm run dev）

---

## 待开发模块（按优先级）

- [ ] **P0** 后端：用户认证（注册 / 登录 / JWT）
- [ ] **P0** 后端：任务 CRUD + APScheduler 集成
- [ ] **P0** 前端：登录/注册页面
- [ ] **P1** 后端：数据采集服务（GitHub + HN）
- [ ] **P1** 后端：AI Pipeline（分析 + 评分）
- [ ] **P1** 后端：SSE 流式聊天接口
- [ ] **P1** 前端：Dashboard（任务列表 + 机会展示）
- [ ] **P1** 前端：AI 聊天界面（流式打字机效果）
- [ ] **P2** 前后端对接
- [ ] **P2** 测试（单元 + 集成）
- [ ] **P3** CI/CD 配置（GitHub Actions）
- [ ] **P3** 部署（Vercel + Railway）

---

<!-- 每次任务完成后，在这里补充 Review -->
