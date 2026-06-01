# Roadmap — Decypher AI 开发路线图

> 记录分阶段开发计划和各功能的实现规格。当前实现状态见 [status.md](./status.md)。

---

## Phase 1 — 完善核心闭环（1-2 周）

> 目标：让现有功能跑通完整产品闭环。

### 后端

- [ ] Opportunity 模型增加 `category` 字段（默认值 `"startup"`）
- [ ] 新增 `/api/v1/cards` 接口，支持 `?category=market|research|startup|stocks|jobs` 过滤
- [ ] 新增 `POST /api/v1/cards/{id}/favorite` 和 `POST /api/v1/cards/{id}/like`
- [ ] `user_favorites` 表 FK 迁移到 `card_id`（见 [database/extension_plan.md](./database/extension_plan.md)）
- [ ] Reddit 采集器完整实现（PRAW 库）

### 前端

- [ ] Dashboard 五 Tab 真实切换（`useCards({ category })`）
- [ ] 全局状态新增 `selectedCard` → 点卡片高亮 + 右侧 AI Analyst 联动
- [ ] 收藏 / 点赞按钮接入真实 API
- [ ] ChatWindow 聊天记录 `localStorage` 持久化（临时方案）

### 实现规格

#### 五模块 Tab 切换

```typescript
// dashboard/page.tsx
const [activeModule, setActiveModule] = useState<Module>("market");
const { cards } = useCards({ category: activeModule, limit: 6 });
```

#### 卡片选中 → 右侧联动

```typescript
// store/index.ts — 新增
interface SelectedCardState {
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
}

// OpportunityCard.tsx
<article
  onClick={() => setSelectedCard(card)}
  className={cn("...", isSelected && "ring-2 ring-primary")}
>

// 右侧 AI Analyst：监听 selectedCard 变化，自动显示卡片摘要 + 评分
// 用户点"Analyze"时，发起 chat 请求并带上 card_id
```

#### 收藏切换

```typescript
const handleFavorite = async (cardId: number) => {
  await cardAPI.toggleFavorite(cardId);
  // POST /api/v1/cards/{id}/favorite — 幂等，已收藏则取消
};
```

---

## Phase 2 — 多模块数据源扩展（2-3 周）

> 目标：让每个模块有专属数据。

### 后端

- [ ] `arxiv_service.py` — arXiv API 采集（学术研究）
- [ ] `producthunt_service.py` — Product Hunt GraphQL（商业 / 创业）
- [ ] `sec_service.py` — SEC EDGAR 财报（股市，仅研究）
- [ ] `stackexchange_service.py` — Stack Exchange 热门问题（求职）
- [ ] `openalex_service.py` — OpenAlex 论文检索（学术增强）
- [ ] 任务调度分模块：arXiv 每 12h，SEC 每天，GitHub / HN 每 6h
- [ ] 各模块专用 Agent：`market_agent`、`research_agent`、`startup_agent`、`stock_pulse_agent`、`job_market_agent`

### 前端

- [ ] 各模块卡片的标签、图标、分数权重适配模块类型
- [ ] 模块切换时的 Loading 和空状态

### 采集器实现规格

```python
# arxiv_service.py
# API: http://export.arxiv.org/api/query?search_query=...
# 字段映射：title→title, abstract→body, arxiv_id→url

# openalex_service.py
# API: https://api.openalex.org/works?filter=title.search:...
# 可获取引用量、机构、领域分类

# producthunt_service.py
# API: https://api.producthunt.com/v2/api/graphql（需要 Token）
# 抓取 today's products、投票数、标签

# sec_service.py
# API: https://data.sec.gov/submissions/CIK{cik}.json
# API: https://efts.sec.gov/LATEST/search-index?q=...
# 抓取 8-K（重大事件）、10-Q（季报）摘要
# ⚠️ Prompt 中必须禁止写买卖建议

# stackexchange_service.py
# API: https://api.stackexchange.com/2.3/questions?tagged=...
# 抓取热门问题、投票数、回答数
```

### AI Agent 分工表

| Agent 文件 | 职责 | 核心 Prompt 侧重 |
| - | - | - |
| `market_agent.py` | 商业市场分析 | 行业动态、产品发布、市场机会、竞品 |
| `research_agent.py` | 学术研究分析 | 论文总结、研究方向聚类、paper-to-project |
| `startup_agent.py` | 创业机会分析 | MVP 建议、商业模式、市场进入策略 |
| `stock_pulse_agent.py` | 股市公开信息 | 财报摘要、AI 暴露度、新闻情绪分析 |
| `job_market_agent.py` | 求职热点分析 | 技能需求、岗位趋势、学习路线 |
| `report_agent.py` | 报告生成 | 周报、公司研究、学习路线报告 |
| `chat_agent.py` | 对话分析（RAG 版） | 当前选中卡片 + 向量检索相关 items |
| `orchestrator_agent.py` | 总调度 | 决定哪个 Agent 先跑、何时评分 |

---

## Phase 3 — AI 能力增强（3-4 周）

> 目标：让 AI Analyst 真正"懂"上下文。

### 后端

- [ ] `items` 表上线（原始信号入库，不依附于 Task）
- [ ] 向量化：`sentence-transformers` + 写入 `items.embedding`
- [ ] PostgreSQL `pgvector` 扩展启用
- [ ] RAG Chat：用户提问 → 向量检索相关 items → 丰富 prompt → LLM 回答
- [ ] 实体抽取：从 item 正文识别公司、技术、岗位（spaCy 或 LLM 辅助）
- [ ] 聊天会话持久化：`chat_sessions` 表，`GET /api/v1/chat/sessions`
- [ ] `report_agent.py`：生成周报（`POST /api/v1/reports/weekly`）

### 前端

- [ ] 笔记页 `/notes`：用户保存的洞察 + AI 生成报告
- [ ] Chat 历史会话侧边栏
- [ ] 右侧 AI Analyst 的"生成报告"按钮

### RAG Chat 实现规格

```python
# chat_agent.py
async def reply_with_rag(message: str, card: Card, history: list, db: AsyncSession):
    query_vector = embedder.encode(message)

    # pgvector 检索 Top-5 相关 items
    related_items = await db.execute(
        "SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5",
        [query_vector]
    )

    context = f"""
    当前选中卡片：{card.title}
    卡片摘要：{card.summary}
    相关数据来源：{format_items(related_items)}
    """

    return await chat_completion([
        {"role": "system", "content": ANALYST_SYSTEM_PROMPT},
        {"role": "user", "content": context},
        *history,
        {"role": "user", "content": message},
    ])
```

---

## Phase 4 — 用户个性化（4-6 周）

> 目标：系统越用越懂用户。

### 后端

- [ ] 用户行为日志表（收藏、点赞、点击卡片记录）
- [ ] 基于行为的推荐权重调整（热门 / 个性化混合）
- [ ] 邮件通知（任务完成 / 周报，可选）

### 前端

- [ ] 个性化 Dashboard：按用户常用模块 + 收藏类型优先展示
- [ ] 推荐徽章："推荐 · 基于你的收藏"
