# Database Extension Plan — Decypher AI 数据库扩展方案

> 在现有 5 张表基础上，Phase 1~3 需新增以下表。实施顺序见 [DEVELOPMENT_REPORT.md](../../DEVELOPMENT_REPORT.md) 的分阶段路线图。

---

## Phase 1 新增

### `cards` — 情报卡片表（核心展示单元）

cards 是 opportunities 的前端展示视图，加入 category 分桶、收藏状态、标签等字段，与 opportunities 解耦后可独立演进。

```sql
CREATE TABLE cards (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id  INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
    category        VARCHAR(50) NOT NULL,   -- 'market' | 'research' | 'startup' | 'stocks' | 'jobs'
    title           VARCHAR(300) NOT NULL,
    summary         TEXT NOT NULL,
    score           FLOAT NOT NULL DEFAULT 0.0,
    tags            JSONB NOT NULL DEFAULT '[]',
    source          VARCHAR(100),           -- 'github' | 'hackernews' | 'arxiv' | ...
    detail_analysis TEXT,
    risk_notes      TEXT,
    next_steps      TEXT,
    is_favorited    BOOLEAN NOT NULL DEFAULT FALSE,
    like_count      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cards_category ON cards(category);
CREATE INDEX idx_cards_score    ON cards(score DESC);
CREATE INDEX idx_cards_user_id  ON cards(user_id);
```

| 字段 | 类型 | 说明 |
|-|-|-|
| category | VARCHAR(50) | `market` / `research` / `startup` / `stocks` / `jobs` |
| opportunity_id | INTEGER | 关联 AI 生成的机会，可为 NULL（系统直接生成的卡片） |
| tags | JSONB | 标签数组，用于过滤和展示 |
| detail_analysis | TEXT | AI 深度分析全文（右侧 Analyst 展示用） |
| is_favorited | BOOLEAN | 冗余字段，方便快速查询；真实状态以 user_favorites 为准 |
| like_count | INTEGER | 累计点赞数 |

### `user_favorites` 更新（FK 迁移）

Phase 1 引入 `cards` 表后，`user_favorites` 的 FK 从 `opportunity_id` 迁移到 `card_id`：

```sql
-- 替换现有 user_favorites 表
CREATE TABLE user_favorites (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id     INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, card_id)
);
```

---

## Phase 2 新增

### `items` — 原始信号表

存储各数据源采集到的原始内容，去重后统一入库，为 Phase 3 的向量检索做准备。

```sql
CREATE TABLE items (
    id           SERIAL PRIMARY KEY,
    source       VARCHAR(50) NOT NULL,    -- 'github' | 'hackernews' | 'arxiv' | 'sec' | ...
    category     VARCHAR(50),             -- 对应哪个模块
    external_id  VARCHAR(200),            -- 原始 ID（避免重复抓取）
    title        VARCHAR(500) NOT NULL,
    body         TEXT,
    url          VARCHAR(2000),
    author       VARCHAR(200),
    score        INTEGER DEFAULT 0,       -- stars / upvotes / citations
    content_hash VARCHAR(64) UNIQUE,      -- SHA256 去重
    published_at TIMESTAMPTZ,
    fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_source       ON items(source);
CREATE INDEX idx_items_category     ON items(category);
CREATE INDEX idx_items_content_hash ON items(content_hash);
```

`content_hash` 用 SHA256 对 `title + url` 计算，阻止同一内容被重复写入。

---

## Phase 3 新增

### `entities` — 实体表

从 item 正文中抽取的结构化实体（公司、技术、岗位名词），用于跨模块关联。

```sql
CREATE TABLE entities (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    type       VARCHAR(50) NOT NULL,  -- 'company' | 'technology' | 'job_role' | 'paper_topic' | 'product'
    aliases    JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `chat_sessions` — 聊天会话表

持久化聊天记录，支持历史会话查询。

```sql
CREATE TABLE chat_sessions (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id    INTEGER REFERENCES cards(id) ON DELETE SET NULL,
    messages   JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`messages` JSONB 格式：
```json
[
  { "role": "user", "content": "帮我分析这个机会", "ts": "2024-01-01T00:00:00Z" },
  { "role": "assistant", "content": "...", "ts": "2024-01-01T00:00:01Z" }
]
```

### `reports` — 报告表

```sql
CREATE TABLE reports (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL,  -- 'weekly' | 'startup' | 'company' | 'learning_path'
    title      VARCHAR(300) NOT NULL,
    content    TEXT NOT NULL,
    metadata   JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 向量嵌入（pgvector）

Phase 3 启用 pgvector 支持后，在 `items` 表上增加 embedding 列：

```sql
-- 需要先在 PostgreSQL 中安装 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE items ADD COLUMN embedding vector(384);
CREATE INDEX idx_items_embedding ON items USING ivfflat (embedding vector_cosine_ops);
```

向量维度 384 对应 `sentence-transformers/all-MiniLM-L6-v2` 模型输出。RAG Chat 检索逻辑：

```sql
-- 按余弦相似度检索 Top-5 相关 items
SELECT * FROM items
ORDER BY embedding <-> $1   -- $1 为查询向量
LIMIT 5;
```
