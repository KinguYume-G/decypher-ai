# Database Overview — Decypher AI

---

## 配置

```
数据库：PostgreSQL 15
字符集：UTF-8
时区：UTC（所有时间字段统一用 UTC 存储）
```

---

## 当前表关系图

```
users
  │
  ├── 1:N ──→ tasks ──── 1:N ──→ opportunities
  │                                    │
  ├── 1:N ──→ notes                    │ N:M
  │                                    ▼
  └────────────────────── user_favorites
```

## 规划中的表关系图（Phase 1~3 完成后）

```
users
  │
  ├── 1:N ──→ tasks ──── 1:N ──→ opportunities
  │
  ├── 1:N ──→ notes
  │
  ├── 1:N ──→ chat_sessions ── N:1 ──→ cards
  │
  ├── 1:N ──→ reports
  │
  └── N:M ──→ user_favorites ──→ cards
                                   │
                             N:1 ──┘
                              cards ←── items (M:N, via card_items 或 JSONB)
```

---

## 迁移策略

- **开发环境**：`init_db()` 启动时自动 `CREATE TABLE IF NOT EXISTS`（SQLAlchemy metadata）
- **生产环境**：使用 Alembic 管理版本化迁移（MVP 阶段先不用，Phase 3 引入）

---

## 存储策略

| 数据类型 | 存储位置 | 原因 |
|-|-|-|
| 用户/任务/机会 | PostgreSQL | 需要事务、关联查询 |
| Session/缓存 | Redis | 高速读写，可丢失 |
| APScheduler Jobs | Redis | 持久化 Job 元数据 |
| 原始信号数据 | **不持久化（当前）** | 每次重新采集，控制存储成本 |
| 原始信号数据 | PostgreSQL `items` 表（Phase 3） | 支持 RAG 向量检索 |
| 向量嵌入 | PostgreSQL `pgvector` 扩展（Phase 3） | < 100 万向量时 pgvector 够用 |
