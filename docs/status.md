# Status — Decypher AI 实现现状

> 每个 Sprint 更新。记录已实现的模块、未实现的缺口、以及已知技术债务。  
> 开发计划见 [roadmap.md](./roadmap.md)。

---

## 已实现（可用）

### 后端

| 模块 | 文件 | 状态 |
| - | - | - |
| FastAPI ASGI 入口 | `backend/main.py` | ✅ 完整 |
| 多 AI 供应商配置 | `app/config.py` | ✅ 支持 ollama / openai / deepseek |
| JWT 认证 | `app/core/security.py` | ✅ HS256，7 天有效期 |
| APScheduler + Redis | `app/core/scheduler.py` | ✅ IntervalTrigger |
| 用户注册 / 登录 API | `app/api/v1/auth.py` | ✅ 完整 |
| 任务 CRUD + 手动触发 | `app/api/v1/tasks.py` | ✅ 完整 |
| 机会列表 / 详情 API | `app/api/v1/opportunities.py` | ✅ 完整 |
| 情报卡片 API | `app/api/v1/cards.py` | ✅ 按 category 浏览 + 收藏切换 |
| Chat 消息 API | `app/api/v1/chat.py` | ✅ SSE 流式 |
| 笔记 CRUD | `app/api/v1/notes.py` | ✅ 完整 |
| 数据库模型 | `app/models/` | ✅ User / Task / Opportunity / Note / UserFavorite |
| GitHub 采集器 | `app/services/github_service.py` | ✅ issues + repos |
| HackerNews 采集器 | `app/services/hn_service.py` | ✅ Algolia API |
| arXiv 采集器 | `app/services/arxiv_service.py` | ✅ |
| OpenAlex 采集器 | `app/services/openalex_service.py` | ✅ |
| Product Hunt 采集器 | `app/services/producthunt_service.py` | ✅ |
| SEC EDGAR 采集器 | `app/services/sec_service.py` | ✅ |
| Stack Exchange 采集器 | `app/services/stackexchange_service.py` | ✅ |
| Dev.to 采集器 | `app/services/devto_service.py` | ✅ |
| Semantic Scholar 采集器 | `app/services/semantic_scholar_service.py` | ✅ |
| Papers With Code 采集器 | `app/services/papers_with_code_service.py` | ✅ |
| Remote OK 采集器 | `app/services/remoteok_service.py` | ✅ |
| RSS 采集器 | `app/services/rss_service.py` | ✅ 通用 |
| Reddit 采集器 | `app/services/reddit_service.py` | ⚠️ Stub（见技术债务） |
| 采集编排 | `app/workers/collector.py` | ✅ asyncio.gather 并发 |
| 数据清洗 | `app/workers/processor.py` | ✅ 去重 + 格式化 |
| 流水线编排 | `app/workers/orchestrator.py` | ✅ 状态机 |
| LLM 统一客户端 | `app/services/llm_client.py` | ✅ OpenAI-compatible |
| 创业机会分析 | `app/services/analysis_service.py` | ✅ JSON 结构化提取 |
| 聊天服务 | `app/services/chat_service.py` | ✅ 带 fallback |
| Pydantic Schemas | `app/schemas/__init__.py` | ✅ 完整类型定义 |

### 前端

| 模块 | 文件 | 状态 |
| - | - | - |
| Next.js 14 App Router | `src/app/` | ✅ 完整路由结构 |
| Stitch 设计系统 | `tailwind.config.ts` + `globals.css` | ✅ 亮色主题 |
| AppShell 侧边栏 | `AppShell.tsx` | ✅ |
| 登录 / 注册页 | `(auth)/login/page.tsx` | ✅ |
| Dashboard 主页 | `dashboard/page.tsx` | ✅ Bento Grid |
| 任务管理页 | `tasks/page.tsx` | ✅ 完整 CRUD |
| 机会收藏页 | `saved/page.tsx` | ✅ 带搜索过滤 |
| Chat 分析页 | `chat/page.tsx` | ✅ AI Analyst 双栏布局 |
| OpportunityCard | `dashboard/OpportunityCard.tsx` | ✅ |
| TaskCard | `dashboard/TaskCard.tsx` | ✅ |
| Zustand 状态 | `store/index.ts` | ✅ auth / task / chat |
| API 客户端 | `lib/api.ts` | ✅ Axios + 拦截器 |
| 自定义 Hooks | `hooks/` | ✅ useAuth / useTasks / useOpportunities / useChat |

---

## 缺口（未实现）

### 后端

| 功能 | 优先级 | 说明 |
| - | - | - |
| **RAG 向量检索** | 🔴 高 | Chat 当前直接传文本，没有向量检索相关信号 |
| **items 原始信号表** | 🔴 高 | 原始信号目前不入库，无法支持 RAG |
| **cards 独立表** | 🔴 高 | 现在 opportunity ≈ card，需要独立 Card 实体支持 category/tags |
| **实体抽取** | 🟡 中 | 无公司 / 技术 / 岗位实体识别 |
| **报告生成** | 🟡 中 | ReportAgent 尚未实现 |
| **对话持久化** | 🟡 中 | Chat 消息不保存，刷新消失 |
| **多 Agent 分工** | 🟠 低 | 当前单一 analysis_service，无 MarketAgent / ResearchAgent 等 |
| **定时任务分模块** | 🟠 低 | 统一间隔，未按数据源差异化调度 |

### 前端

| 功能 | 优先级 | 说明 |
| - | - | - |
| **五模块 Tab 切换** | 🔴 高 | Tab 存在但点击无实际过滤 |
| **卡片选中 → 右侧联动** | 🔴 高 | 点卡片后右侧 AI Analyst 未自动读取，是核心交互 |
| **收藏 / 点赞按钮** | 🟡 中 | UI 有按钮，无实际 API 调用 |
| **Notes 页面** | 🟡 中 | 导航有入口，页面不存在 |
| **周报页面** | 🟠 低 | 报告功能未设计 |
| **移动端适配** | 🟠 低 | 底部 nav 不完善 |

---

## 技术债务

> [!WARNING]
> **`source_signals` 始终为 `[]`**  
> `orchestrator.py` 约第 100 行硬编码 `source_signals=[]`。原始信号 URL 未被存储。Phase 3 上线 `items` 表后修复，让 opportunity 关联具体 item 记录。

> [!WARNING]
> **`tasks/page.tsx` 和 `saved/page.tsx` 有 unreachable code**  
> 两文件均有旧版 JSX 永远不会执行。需清理，否则影响构建分析。

> [!NOTE]
> **Reddit 采集器是 Stub**  
> `reddit_service.py` mock 了结果，无真实抓取。需注册 Reddit App 获取 `client_id` + `client_secret`。

> [!NOTE]
> **数据库用 `create_all` 而非 Alembic**  
> `lifespan` 直接调用 `Base.metadata.create_all()`。引入新表后必须改用 Alembic 版本化迁移，否则生产环境无法零停机更新 schema。

> [!CAUTION]
> **股市 Prompt 缺免责声明**  
> `stock_pulse_agent` 的 System Prompt 必须加入："本分析仅基于公开信息，不构成投资建议，不对任何投资损失负责。"这是合规要求。
