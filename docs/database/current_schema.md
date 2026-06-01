# Current Schema — Decypher AI 现有表结构

> 5 张表，由 `init_db()` 启动时自动建表。

---

## `users` — 用户表

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_superuser    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

| 字段 | 类型 | 约束 | 说明 |
|-|-|-|-|
| id | SERIAL | PK | 自增主键 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 登录邮箱 |
| username | VARCHAR(100) | UNIQUE, NOT NULL | 显示名称 |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt 哈希后的密码 |
| is_active | BOOLEAN | DEFAULT TRUE | 账号是否启用 |
| is_superuser | BOOLEAN | DEFAULT FALSE | 管理员标志 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 注册时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 最后更新时间 |

---

## `tasks` — 分析任务表

```sql
CREATE TABLE tasks (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             VARCHAR(200) NOT NULL,
    keywords         JSONB NOT NULL DEFAULT '[]',
    sources          JSONB NOT NULL DEFAULT '[]',
    interval_seconds INTEGER NOT NULL DEFAULT 3600,
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    last_run_at      TIMESTAMPTZ,
    next_run_at      TIMESTAMPTZ,
    run_count        INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status  ON tasks(status);
```

| 字段 | 类型 | 说明 |
|-|-|-|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users.id，CASCADE 删除 |
| name | VARCHAR(200) | 任务名称，用户自定义 |
| keywords | JSONB | 关键词数组，如 `["ai agent", "llm"]` |
| sources | JSONB | 数据源，如 `["github", "hackernews"]` |
| interval_seconds | INTEGER | 执行间隔（秒），默认 3600 |
| status | VARCHAR(20) | `pending` / `running` / `completed` / `failed` / `paused` |
| is_active | BOOLEAN | 是否启用定时调度 |
| last_run_at | TIMESTAMPTZ | 最后一次执行时间 |
| next_run_at | TIMESTAMPTZ | 下次计划执行时间 |
| run_count | INTEGER | 累计执行次数 |

**status 状态机**
```
pending → running → completed
                 ↘ failed
任意状态 → paused（用户手动暂停）
paused → pending（用户恢复）
```

---

## `opportunities` — 机会结果表

```sql
CREATE TABLE opportunities (
    id                SERIAL PRIMARY KEY,
    task_id           INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title             VARCHAR(300) NOT NULL,
    what_to_build     TEXT NOT NULL,
    why_it_matters    TEXT NOT NULL,
    how_to_execute    TEXT NOT NULL,
    score_trend       FLOAT NOT NULL DEFAULT 0,
    score_novelty     FLOAT NOT NULL DEFAULT 0,
    score_competition FLOAT NOT NULL DEFAULT 0,
    score_feasibility FLOAT NOT NULL DEFAULT 0,
    score_commercial  FLOAT NOT NULL DEFAULT 0,
    score_total       FLOAT NOT NULL DEFAULT 0,
    source_signals    JSONB NOT NULL DEFAULT '[]',
    keywords_matched  JSONB NOT NULL DEFAULT '[]',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_task_id    ON opportunities(task_id);
CREATE INDEX idx_opportunities_score_total ON opportunities(score_total DESC);
CREATE INDEX idx_opportunities_created_at  ON opportunities(created_at DESC);
```

| 字段 | 类型 | 说明 |
|-|-|-|
| id | SERIAL | PK |
| task_id | INTEGER | FK → tasks.id |
| title | VARCHAR(300) | 机会标题，15字以内 |
| what_to_build | TEXT | 做什么（AI生成） |
| why_it_matters | TEXT | 为什么重要（AI生成） |
| how_to_execute | TEXT | 如何执行（AI生成） |
| score_trend | FLOAT | 趋势强度 1-10 |
| score_novelty | FLOAT | 新颖性 1-10 |
| score_competition | FLOAT | 竞争程度 1-10（越低越好） |
| score_feasibility | FLOAT | 可行性 1-10 |
| score_commercial | FLOAT | 商业潜力 1-10 |
| score_total | FLOAT | 综合评分（5维平均）|
| source_signals | JSONB | 来源 URL 列表 |
| keywords_matched | JSONB | 匹配到的关键词 |

---

## `notes` — 用户笔记表

```sql
CREATE TABLE notes (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(300) NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
```

| 字段 | 类型 | 说明 |
|-|-|-|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users.id，CASCADE 删除 |
| title | VARCHAR(300) | 笔记标题 |
| content | TEXT | 笔记正文（自由文本） |
| created_at | TIMESTAMPTZ | 创建时间 |

---

## `user_favorites` — 用户收藏表（多对多）

> ⚠️ Phase 1 引入 `cards` 表后，FK 将从 `opportunity_id` 迁移到 `card_id`。见 [extension_plan.md](./extension_plan.md)。

```sql
CREATE TABLE user_favorites (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_opportunity UNIQUE (user_id, opportunity_id)
);

CREATE INDEX idx_user_favorites_user_id        ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_opportunity_id ON user_favorites(opportunity_id);
```

| 字段 | 类型 | 说明 |
|-|-|-|
| id | SERIAL | PK |
| user_id | INTEGER | FK → users.id |
| opportunity_id | INTEGER | FK → opportunities.id |
| created_at | TIMESTAMPTZ | 收藏时间 |

唯一约束防止同一用户重复收藏；`POST /cards/{id}/favorite` 为幂等接口，已收藏则取消，未收藏则添加。

---

## 数据样例

### tasks 表
```json
{
  "id": 1,
  "user_id": 1,
  "name": "AI Agent 机会追踪",
  "keywords": ["ai agent", "llm", "autonomous"],
  "sources": ["github", "hackernews"],
  "interval_seconds": 3600,
  "status": "completed",
  "run_count": 5
}
```

### opportunities 表
```json
{
  "id": 1,
  "task_id": 1,
  "title": "AI Agent 测试自动化工具",
  "what_to_build": "一个专为 AI Agent 设计的端到端测试框架，支持 prompt injection 检测、行为一致性验证",
  "why_it_matters": "GitHub 上有超过 2000 个 Issue 请求 AI Agent 测试工具，现有测试工具无法处理非确定性输出",
  "how_to_execute": "MVP: 先做 ReAct 模式 Agent 的行为记录和回放功能，接入 LangChain/AutoGen",
  "score_trend": 9.0,
  "score_novelty": 7.5,
  "score_competition": 3.0,
  "score_feasibility": 8.0,
  "score_commercial": 8.5,
  "score_total": 7.2,
  "keywords_matched": ["ai agent", "llm"]
}
```
