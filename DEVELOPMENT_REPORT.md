# Decypher AI — 产品理解与开发方案

> **文档性质**：完整的产品认知 + 现有代码审查 + 缺口分析 + 分阶段开发路线图  
> **编写时间**：2026-06-01  
> **读者**：Decypher AI 开发团队

---

## 一、产品定位（我们在做什么）

Decypher AI 是一款 **AI 驱动的科技情报决策平台**，目标用户是科技创始人、投资人和研究人员。

它不是新闻聚合器，也不是聊天机器人，而是一个**闭环情报引擎**：

```
公开数据源 → AI 采集清洗 → LLM 分析评分 → 信息卡片 Dashboard
→ 用户点击反馈 → AI 深度解读 → 生成报告/笔记 → 系统记住用户偏好
```

### 核心价值主张

| 传统工具 | Decypher AI |
| - | - |
| 手动看新闻、筛信息 | 自动抓取 + AI 归因 |
| 分散工具（论文/新闻/财报各一套） | 五模块统一平台 |
| 普通聊天 AI | 基于当前信号的上下文分析师 |
| 静态仪表板 | 用户行为反馈的自适应推荐 |

---

## 二、五大核心模块

每个模块共用底层同一套数据管道，只是**信号来源和 Prompt 侧重不同**。

| 模块 | 核心数据源 | AI 分析重点 |
| - | - | - |
| **商业市场** | Product Hunt、HN、公司 Blog、GitHub 热门项目 | 行业动态、产品发布、市场机会、竞品分析 |
| **学术研究** | arXiv、OpenAlex、Crossref、GitHub | 论文总结、研究趋势、paper-to-project 建议 |
| **创业机会** | GitHub Show HN、Product Hunt、DEV.to | 市场机会评分、MVP 建议、商业模式、竞品 |
| **股市动态** | SEC EDGAR、公司 IR、GDELT 新闻 | 财报摘要、AI 业务信号、新闻情绪（仅研究，不写买卖建议） |
| **求职热点** | Stack Exchange、GitHub Jobs、HN Hiring | 技能需求、岗位趋势、学习路线推荐 |

**同一条数据可跨模块使用**：`LangGraph 热度上升` → 同时出现在商业市场、学术研究、创业机会和求职热点。

---

## 三、系统架构总图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
│  左侧导航   │   中间卡片 Bento Grid   │  右侧 AI Analyst  │
└─────────────────────────────────────────────────────────┘
                        │ REST API
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Backend (ASGI)                │
│  /api/v1/auth  /api/v1/tasks  /api/v1/opportunities     │
│  /api/v1/cards  /api/v1/chat  /api/v1/reports           │
└──────────┬────────────────────────┬─────────────────────┘
           │                        │
    ┌──────▼──────┐        ┌────────▼──────────┐
    │ AI Pipeline │        │  APScheduler Jobs │
    │             │        │  (Redis JobStore) │
    │ Orchestrator│        │  每 6h/12h/每天    │
    │ Collector   │        └───────────────────┘
    │ Processor   │
    │ LLM Client  │
    │ Agents      │
    └──────┬──────┘
           │
    ┌──────▼──────────────────────────────────────────────┐
    │                  外部数据源                          │
    │ GitHub API │ HN API │ arXiv │ OpenAlex │ SEC EDGAR  │
    │ Product Hunt │ Stack Exchange │ DEV.to │ GDELT      │
    └─────────────────────────────────────────────────────┘
           │
    ┌──────▼──────────────────────────────────────────────┐
    │                    数据库层                          │
    │  PostgreSQL 15 (主数据库)    Redis 7 (任务调度)       │
    │  items | cards | entities | embeddings | reports    │
    └─────────────────────────────────────────────────────┘
```

---

## 四、现有代码盘点（已实现的部分）

通过完整读取所有源代码，目前已实现：

### ✅ 已完成（可用）

#### Backend

| 模块 | 文件 | 状态 |
| - | - | - |
| FastAPI ASGI 入口 | `backend/main.py` | ✅ 完整 |
| 多 AI 供应商配置 | `app/config.py` | ✅ 支持 ollama/openai/deepseek |
| JWT 认证 | `app/core/security.py` | ✅ HS256, 7天有效期 |
| APScheduler + Redis | `app/core/scheduler.py` | ✅ IntervalTrigger |
| 用户注册/登录 API | `app/api/v1/auth.py` | ✅ 完整 |
| 任务 CRUD + 手动触发 | `app/api/v1/tasks.py` | ✅ 完整 |
| 机会列表/详情 API | `app/api/v1/opportunities.py` | ✅ 完整 |
| Chat 消息 API | `app/api/v1/chat.py` | ✅ 完整 |
| 数据库模型 | `app/models/` | ✅ User + Task + Opportunity |
| GitHub 采集器 | `app/services/github_service.py` | ✅ issues + repos |
| HackerNews 采集器 | `app/services/hn_service.py` | ✅ Algolia API |
| Reddit 采集器 | `app/services/reddit_service.py` | ⚠️ Stub（框架存在，无实际抓取逻辑） |
| 采集编排 | `app/workers/collector.py` | ✅ 并发抓取 |
| 数据清洗 | `app/workers/processor.py` | ✅ 文本清洗+格式化 |
| 流水线编排 | `app/workers/orchestrator.py` | ✅ 状态机 |
| LLM 统一客户端 | `app/services/llm_client.py` | ✅ OpenAI-compatible |
| 创业机会分析 | `app/services/analysis_service.py` | ✅ JSON 结构化提取 |
| 聊天分析 | `app/services/chat_service.py` | ✅ 带 fallback |
| Pydantic Schemas | `app/schemas/__init__.py` | ✅ 完整类型定义 |

#### Frontend

| 模块 | 文件 | 状态 |
| - | - | - |
| Next.js 14 App Router | `src/app/` | ✅ 完整路由结构 |
| 新版 Stitch 设计系统 | `tailwind.config.ts` + `globals.css` | ✅ 亮色主题完成 |
| AppShell 侧边栏 | `AppShell.tsx` | ✅ 亮色 Stitch 风格 |
| 登录/注册页 | `(auth)/login/page.tsx` | ✅ 完整 |
| Dashboard 主页 | `dashboard/page.tsx` | ✅ Bento Grid + 顶导栏 |
| 任务管理页 | `tasks/page.tsx` | ✅ 完整 CRUD |
| 机会收藏页 | `saved/page.tsx` | ✅ 带搜索过滤 |
| Chat 分析页 | `chat/page.tsx` | ✅ AI Analyst 双栏布局 |
| OpportunityCard | `dashboard/OpportunityCard.tsx` | ✅ Stitch 风格 |
| TaskCard | `dashboard/TaskCard.tsx` | ✅ 完整 |
| Zustand 状态 | `store/index.ts` | ✅ useAuthStore |
| API 客户端 | `lib/api.ts` | ✅ Axios + 拦截器 |
| 自定义 Hooks | `hooks/` | ✅ useAuth/useTasks/useOpportunities/useChat |

---

### ⚠️ 缺口分析（未实现 / 需要扩展）

对照完整产品愿景，以下功能**目前还不存在**：

#### 后端缺口

| 缺失功能 | 重要程度 | 说明 |
| - | - | - |
| **5 个模块分类** | 🔴 高 | 现在所有机会都是同一种类型，没有 category 字段 |
| **arXiv 采集器** | 🔴 高 | 学术研究模块的核心数据源 |
| **SEC EDGAR 采集器** | 🟡 中 | 股市模块|
| **Product Hunt 采集器** | 🟡 中 | 商业市场和创业机会模块 |
| **OpenAlex 采集器** | 🟡 中 | 学术研究|
| **Stack Exchange 采集器** | 🟡 中 | 求职热点|
| **RAG 向量检索** | 🔴 高 | Chat 当前直接传 opportunity 文本，没有向量数据库检索相关信号 |
| **卡片表（cards）** | 🔴 高 | 现在 opportunity = card，但业务上需要独立的 Card 实体，含 category/tags/is_favorited |
| **实体抽取**| 🟡 中 | 无公司/技术/岗位实体识别 |
| **用户收藏/点赞** | 🟡 中 | 有 UI 按钮，但没有后端接口和数据表 |
| **报告生成**| 🟡 中 | ReportAgent 尚未实现|
| **对话持久化** | 🟡 中 | Chat 消息不保存，刷新后消失 |
| **多 Agent 分工** | 🟠 低 | 当前只有一个 analysis_service，没有 MarketAgent/ResearchAgent 等 |
| **定时任务分模块**| 🟠 低 | 所有采集任务用统一间隔，没有按模块差异化调度|

#### 前端缺口

| 缺失功能| 重要程度 | 说明|
| - | - | - |
| **五模块 Tab 切换** | 🔴 高 | 顶导栏有 Tab，但点击无实际过滤效果|
| **卡片选中→右侧联动** | 🔴 高 | 点卡片后右侧 AI Analyst 自动读取，是核心交互，当前未实现 |
| **收藏/点赞按钮功能** | 🟡 中 | UI 有按钮，无实际 API 调用 |
| **Notes（笔记）功能** | 🟡 中 | 导航有 Notes，页面不存在 |
| **卡片翻转动效** | 🟠 低 | 每张卡片的翻转按钮 |
| **周报页面** | 🟠 低 | 报告功能尚未设计|
| **移动端适配**| 🟠 低  | 底部 nav 存在但不完善 |

---

## 五、数据库扩展方案

在现有 `users`、`tasks`、`opportunities` 三张表基础上，需要新增：

### 新增核心表

```sql
-- ── 信息卡片表（核心展示单元）─────────────────────────────────
CREATE TABLE cards (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    -- 可以是 AI 生成（绑 opportunity）或系统自动生成（绑 item）
    opportunity_id  INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
    category        VARCHAR(50) NOT NULL,   -- 'market' | 'research' | 'startup' | 'stocks' | 'jobs'
    title           VARCHAR(300) NOT NULL,
    summary         TEXT NOT NULL,
    score           FLOAT NOT NULL DEFAULT 0.0,
    tags            JSONB NOT NULL DEFAULT '[]',
    source          VARCHAR(100),           -- 'github' | 'hackernews' | 'arxiv' | ...
    detail_analysis TEXT,                   -- AI 深度分析全文
    risk_notes      TEXT,
    next_steps      TEXT,
    is_favorited    BOOLEAN NOT NULL DEFAULT FALSE,
    like_count      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cards_category ON cards(category);
CREATE INDEX idx_cards_score ON cards(score DESC);
CREATE INDEX idx_cards_user_id ON cards(user_id);

-- ── 原始信号/数据项表 ────────────────────────────────────────
CREATE TABLE items (
    id              SERIAL PRIMARY KEY,
    source          VARCHAR(50) NOT NULL,   -- 'github' | 'hackernews' | 'arxiv' | 'sec' | ...
    category        VARCHAR(50),            -- 哪个模块使用
    external_id     VARCHAR(200),           -- 原始 ID（避免重复抓取）
    title           VARCHAR(500) NOT NULL,
    body            TEXT,
    url             VARCHAR(2000),
    author          VARCHAR(200),
    score           INTEGER DEFAULT 0,      -- stars/upvotes/citations
    content_hash    VARCHAR(64) UNIQUE,     -- SHA256 去重
    published_at    TIMESTAMPTZ,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_items_source ON items(source);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_content_hash ON items(content_hash);

-- ── 实体表 ──────────────────────────────────────────────────
CREATE TABLE entities (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    type        VARCHAR(50) NOT NULL,    -- 'company' | 'technology' | 'job_role' | 'paper_topic' | 'product'
    aliases     JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 用户收藏表 ───────────────────────────────────────────────
CREATE TABLE user_favorites (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id     INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, card_id)
);

-- ── 聊天会话表 ───────────────────────────────────────────────
CREATE TABLE chat_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id         INTEGER REFERENCES cards(id) ON DELETE SET NULL,
    messages        JSONB NOT NULL DEFAULT '[]',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 报告表 ──────────────────────────────────────────────────
CREATE TABLE reports (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,   -- 'weekly' | 'startup' | 'company' | 'learning_path'
    title       VARCHAR(300) NOT NULL,
    content     TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 向量嵌入（pgvector 支持后启用）──────────────────────────
-- CREATE EXTENSION IF NOT EXISTS vector;
-- ALTER TABLE items ADD COLUMN embedding vector(384);
-- CREATE INDEX idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops);
```

---

## 六、新增数据采集器

在 `backend/app/services/` 下新增以下 Collector，继承 `BaseDataService`：

### 6.1 arXiv 采集器（学术研究）

```python
# arxiv_service.py
# API: http://export.arxiv.org/api/query?search_query=...
# 返回最新论文 title + abstract
# 字段映射：title→title, abstract→body, arxiv_id→url
```

### 6.2 OpenAlex 采集器（学术研究增强）

```python
# openalex_service.py
# API: https://api.openalex.org/works?filter=title.search:...
# 可获取引用量、机构、领域分类
```

### 6.3 Product Hunt 采集器（商业/创业）

```python
# producthunt_service.py
# API: https://api.producthunt.com/v2/api/graphql
# 需要 API Token
# 抓取 today's products、投票数、标签
```

### 6.4 SEC EDGAR 采集器（股市）

```python
# sec_service.py
# API: https://data.sec.gov/submissions/CIK{cik}.json
# API: https://efts.sec.gov/LATEST/search-index?q=...
# 抓取 8-K (重大事件)、10-Q (季报) 摘要
# 注意：只做研究，prompt 中明确禁止写买卖建议
```

### 6.5 Stack Exchange 采集器（求职/技术热点）

```python
# stackexchange_service.py
# API: https://api.stackexchange.com/2.3/questions?tagged=...
# 抓取热门问题、投票数、回答数
```

---

## 七、新增 AI Agents

在 `backend/app/services/agents/` 下实现各专业 Agent，每个 Agent 本质是带专用 System Prompt 的 `chat_completion` 封装：

### Agent 分工表

| Agent 文件 | 职责 | 核心 Prompt 侧重 |
| - | - | - |
| `market_agent.py` | 商业市场分析 | 行业动态、产品发布、市场机会、竞品 |
| `research_agent.py` | 学术研究分析 | 论文总结、研究方向聚类、paper-to-project |
| `startup_agent.py` | 创业机会分析 | MVP 建议、商业模式、市场进入策略 |
| `stock_pulse_agent.py` | 股市公开信息 | 财报摘要、AI 暴露度、新闻情绪分析 |
| `job_market_agent.py` | 求职热点分析 | 技能需求、岗位趋势、学习路线 |
| `report_agent.py` | 报告生成 | 周报、公司研究、学习路线报告 |
| `chat_agent.py` | 对话分析（RAG 版） | 当前选中卡片 + 向量检索相关 items |
| `orchestrator_agent.py` | 总调度 | 决定哪个 Agent 先跑、什么时候评分 |

### RAG Chat 增强方案

```python
# chat_agent.py 核心逻辑（RAG 版）
async def reply_with_rag(message, card, history, db):
    # 1. 向量化用户问题
    query_vector = embedder.encode(message)

    # 2. pgvector 检索相关 items（Top-K = 5）
    related_items = await db.execute(
        "SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5",
        [query_vector]
    )

    # 3. 组合 Prompt
    context = f"""
    当前选中卡片：{card.title}
    卡片摘要：{card.summary}
    相关数据来源：
    {format_items(related_items)}
    """

    # 4. LLM 生成回答（含结论、原因、数据来源、风险、建议）
    return await chat_completion([
        {"role": "system", "content": ANALYST_SYSTEM_PROMPT},
        {"role": "user", "content": context},
        ...history,
        {"role": "user", "content": message}
    ])
```

---

## 八、前端核心交互升级

### 8.1 五模块 Tab 切换（最高优先级）

Dashboard 顶导栏的 Tab 点击需要：

```typescript
// dashboard/page.tsx 需要增加
const [activeModule, setActiveModule] = useState<Module>("market");

// API 查询带 category 过滤
const { cards } = useCards({ category: activeModule, limit: 6 });
```

后端需要新增 `/api/v1/cards` 接口，支持 `?category=` 过滤。

### 8.2 卡片选中 → 右侧联动（核心交互）

这是整个产品最核心的 UX：

```typescript
// 全局状态需要新增 selectedCard
interface SelectedCardState {
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
}

// OpportunityCard 点击后：
<article onClick={() => setSelectedCard(card)}
  className={`... ${isSelected ? "selected-glow" : ""}`}
>

// 右侧 AI Analyst 监听 selectedCard：
// 当 selectedCard 改变时，自动显示该卡片摘要 + 评分
// 用户点"Analyze"时，发起 chat 请求带上 card_id
```

### 8.3 Notes 笔记页

路径：`/notes`  
功能：用户在 AI 对话中生成的洞察，可以手动保存为笔记。  
后端：`POST /api/v1/notes`，数据存 `reports` 表的 `type='note'`。

### 8.4 收藏 & 点赞

```typescript
// 每张卡片的 favorite 按钮：
const handleFavorite = async (cardId: number) => {
  await cardAPI.toggleFavorite(cardId);
  // 后端：POST /api/v1/cards/{id}/favorite
};
```

---

## 九、分阶段开发路线图

### Phase 1 — 完善核心闭环（1-2 周）

> 目标：让现有功能跑通完整产品闭环

**后端：**

- [ ] Opportunity 模型增加 `category` 字段（迁移现有数据 → 默认值 "startup"）
- [ ] 新增 `/api/v1/cards` 接口，支持 `?category=market|research|startup|stocks|jobs` 过滤
- [ ] 新增 `POST /api/v1/cards/{id}/favorite` 和 `POST /api/v1/cards/{id}/like`
- [ ] 新增 `user_favorites` 表
- [ ] Reddit 采集器完整实现（PRAW 库）

**前端：**

- [ ] Dashboard 顶导五 Tab 真实切换（调用 `useCards({ category })`）
- [ ] 全局状态新增 `selectedCard` → 点卡片高亮 + 右侧 AI Analyst 联动
- [ ] 收藏/点赞按钮接入真实 API
- [ ] ChatWindow 聊天记录 `localStorage` 持久化（临时方案）

---

### Phase 2 — 多模块数据源扩展（2-3 周）

> 目标：让每个模块有专属数据

**后端：**

- [ ] `arxiv_service.py` — arXiv API 采集（学术研究）
- [ ] `producthunt_service.py` — Product Hunt GraphQL（商业/创业）
- [ ] `sec_service.py` — SEC EDGAR 财报（股市，仅研究）
- [ ] `stackexchange_service.py` — Stack Exchange 热门问题（求职）
- [ ] `openalex_service.py` — OpenAlex 论文检索（学术增强）
- [ ] 任务调度分模块：arXiv 每 12h，SEC 每天，GitHub/HN 每 6h
- [ ] 各模块专用 System Prompt：`market_agent`、`research_agent`、`startup_agent`、`stock_pulse_agent`、`job_market_agent`

**前端：**

- [ ] 每个模块的卡片展示逻辑（标签、图标、分数权重）适配各模块数据
- [ ] 模块切换时的 Loading 状态和空状态优化

---

### Phase 3 — AI 能力增强（3-4 周）

> 目标：让 AI Analyst 真正"懂"上下文

**后端：**

- [ ] `items` 表上线（存储原始信号，不依附于 Task）
- [ ] 向量化模块：`sentence-transformers` + 存入 `items.embedding`
- [ ] `pgvector` 扩展启用（PostgreSQL）
- [ ] RAG Chat：用户提问 → 向量检索相关 items → 丰富 prompt → LLM 回答
- [ ] 实体抽取：从 item 正文识别公司、技术、岗位名词（spaCy 或 LLM 辅助）
- [ ] 聊天会话持久化：`chat_sessions` 表，`GET /api/v1/chat/sessions`
- [ ] `report_agent.py`：生成周报（`POST /api/v1/reports/weekly`）

**前端：**

- [ ] 笔记页 `/notes`：展示用户保存的洞察和 AI 生成报告
- [ ] Chat 页面历史会话侧边栏
- [ ] 右侧 AI Analyst 的"生成报告"按钮接入 `report_agent`

---

### Phase 4 — 用户个性化（4-6 周）

> 目标：系统越用越懂用户

**后端：**

- [ ] 用户行为日志表（收藏、点赞、点击卡片记录）
- [ ] 基于用户行为的推荐权重调整（热门/个性化混合）
- [ ] 邮件通知：任务完成/周报发送（可选）

**前端：**

- [ ] 个性化 Dashboard：根据用户常用模块和收藏类型优先展示
- [ ] 推荐徽章："推荐 · 基于你的收藏"

---

## 十、关键 API 接口扩展清单

在现有 4 个路由之上，需要新增：

```
# 卡片相关（前端展示核心）
GET    /api/v1/cards?category=&limit=6&sort=score   # 按模块获取卡片
GET    /api/v1/cards/{id}                            # 卡片详情
POST   /api/v1/cards/{id}/favorite                   # 收藏/取消收藏
POST   /api/v1/cards/{id}/like                       # 点赞

# 聊天增强
GET    /api/v1/chat/sessions                          # 历史会话列表
GET    /api/v1/chat/sessions/{id}                     # 单个会话详情

# 报告
POST   /api/v1/reports/weekly                         # 生成本周报告
GET    /api/v1/reports                                # 报告列表

# 笔记
POST   /api/v1/notes                                  # 保存笔记
GET    /api/v1/notes                                  # 笔记列表
DELETE /api/v1/notes/{id}                             # 删除笔记
```

---

## 十一、技术债务和注意事项

> [!WARNING]
> **`source_signals` 字段始终为 `[]`**  
> `orchestrator.py` 第 100 行硬编码 `source_signals=[]`。原始信号摘要（URL、来源）没有被存储。Phase 3 上线 `items` 表后需要修复这里，让 opportunity 关联具体的 item 记录。

> [!WARNING]
> **`tasks/page.tsx` 和 `saved/page.tsx` 里有 unreachable code**  
> 两个文件都有 `export default function Page()` → `return <ExperienceComponent />` 然后又有完整的 JSX 永远不会执行的老版本代码。需要清理，否则会影响构建性能分析。

> [!NOTE]
> **Reddit 采集器是 Stub**  
> `reddit_service.py` 导入 PRAW 并 mock 了结果，没有真实抓取。后续需要注册 Reddit App 获取 `client_id` + `client_secret`。

> [!NOTE]
> **数据库用 `create_all` 而非 Alembic 迁移**  
> 当前 `main.py` 的 `lifespan` 直接调用 `Base.metadata.create_all()`。随着表的增加，必须引入 Alembic 做版本化迁移，否则生产环境无法零停机更新 schema。

> [!CAUTION]
> **AI Prompt 中无明确的股市免责声明**  
> `stock_pulse_agent` 的 System Prompt 必须包含："本分析仅基于公开信息，不构成投资建议，不对任何投资损失负责。"这是合规要求。

---

## 十二、最终产品闭环

```
用户打开 Decypher AI（首页看到五个模块）
        ↓
点击模块（商业/学术/创业/股市/求职）
        ↓
系统从对应数据源（GitHub/arXiv/SEC/Product Hunt 等）获取数据
        ↓
AI Agent 分析、评分、生成 6 张信息卡片
        ↓
用户点击一张卡片 → 卡片紫色高亮
        ↓
右侧 AI Analyst 自动加载该卡片上下文
        ↓
用户点"Analyze" → AI 基于卡片+向量检索相关信号深度分析
        ↓
用户追问 → AI 引用具体数据来源回答
        ↓
用户可以：收藏 / 点赞 / 保存为笔记 / 生成报告
        ↓
系统记录用户偏好 → 下次推荐更符合口味的卡片
```

这就是 Decypher AI 的完整产品闭环。**不是仪表板，不是聊天机器人——是一个会学习、有上下文、跨模块关联的情报引擎。**

---

_文档版本：v1.0 · 基于代码库完整扫描生成_
