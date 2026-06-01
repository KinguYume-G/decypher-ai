# Hacker News API

**官方文档**: https://github.com/HackerNews/API  
**模块用途**: 商业市场 / 创业机会（技术圈真实讨论和产品信号）

---

## 概览

Hacker News API 由 Firebase 提供支持，提供近实时的 HN 数据访问，包括帖子、评论、用户信息等。另有 Algolia Search API 用于全文搜索历史数据。

**两个主要接口**：
| 接口 | 用途 | 地址 |
|-|-|-|
| Firebase API | 实时数据（最新帖子、评论） | `https://hacker-news.firebaseio.com/v0/` |
| Algolia Search API | 历史搜索 | `https://hn.algolia.com/api/v1/` |

---

## 认证

**无需认证，无需 API Key。** 所有端点公开可用。

---

## 速率限制

**目前没有明确的速率限制**，但建议合理控制请求频率，避免滥用。

---

## Firebase API Endpoints

**Base URL**: `https://hacker-news.firebaseio.com/v0/`

### 获取单条 Item（帖子/评论/工作）
```
GET /item/{id}.json
```

返回示例（Story）：
```json
{
  "id": 8863,
  "type": "story",
  "by": "dhouston",
  "time": 1175714200,
  "title": "My YC app: Dropbox - Throw away your USB drive",
  "url": "http://www.getdropbox.com/u/2/screencast.html",
  "score": 111,
  "descendants": 71,
  "kids": [8952, 9224, 8917]
}
```

`type` 可以是：`story` / `comment` / `job` / `poll` / `pollopt`

### 获取用户信息
```
GET /user/{username}.json
```

### 获取故事列表（Story Lists）

| Endpoint | 说明 |
|-|-|
| `/topstories.json` | 最多 500 条热门帖子 ID |
| `/newstories.json` | 最多 500 条最新帖子 ID |
| `/beststories.json` | 最多 500 条最佳帖子 ID |
| `/askstories.json` | 最多 200 条 Ask HN ID |
| `/showstories.json` | 最多 200 条 Show HN ID |
| `/jobstories.json` | 最多 200 条 Job ID |

> **注意**：以上接口只返回 ID 列表，需要逐个请求 `/item/{id}.json` 获取详情

### 获取最大 Item ID
```
GET /maxitem.json
```
返回当前最大的 item ID，可用于遍历所有内容。

### 获取实时更新
```
GET /updates.json
```
返回最近更新的 item IDs 和 user IDs。

---

## Algolia Search API（历史搜索）

**Base URL**: `https://hn.algolia.com/api/v1/`

### 搜索帖子
```
GET /search?query={keyword}&tags=story
```

### 搜索最新内容（按时间排序）
```
GET /search_by_date?query={keyword}&tags=story
```

### 常用 tags 过滤
| tag | 说明 |
|-|-|
| `story` | 只搜索帖子 |
| `comment` | 只搜索评论 |
| `ask_hn` | Ask HN 类型 |
| `show_hn` | Show HN 类型 |
| `job` | 招聘帖子 |
| `author_{username}` | 特定用户内容 |

### 按时间范围过滤
```
GET /search_by_date?query=AI+startup&tags=story&numericFilters=created_at_i>1700000000
```
（`created_at_i` 是 Unix 时间戳）

### 示例：获取最近的 Show HN AI 项目
```
GET https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=AI&hitsPerPage=50
```

---

## Python 快速上手

### 抓取 Top Stories 详情
```python
import requests

# 获取 top story IDs
top_ids = requests.get(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
).json()[:30]

# 获取每条帖子详情
stories = []
for id in top_ids:
    item = requests.get(
        f"https://hacker-news.firebaseio.com/v0/item/{id}.json"
    ).json()
    stories.append(item)
    print(item.get("title"), item.get("score"))
```

### Algolia 搜索 AI 相关 Show HN
```python
import requests

resp = requests.get(
    "https://hn.algolia.com/api/v1/search_by_date",
    params={
        "tags": "show_hn",
        "query": "AI agent",
        "hitsPerPage": 50
    }
)

for hit in resp.json()["hits"]:
    print(hit["title"], hit["points"], hit["url"])
```

---

## 项目用途建议

- **产品信号**：监控 `show_hn` 中出现的 AI 工具/创业产品
- **技术讨论**：搜索特定技术关键词的 `ask_hn` 帖，了解开发者痛点
- **情感分析**：结合评论 (`kids`) 分析社区对某产品/技术的态度
- **招聘趋势**：抓取 `jobstories` 分析技能需求热点

---

## 参考链接

- [HN Firebase API 官方 GitHub](https://github.com/HackerNews/API)
- [Algolia Search API 文档](https://hn.algolia.com/api)
- [完整使用指南（Cotera）](https://cotera.co/articles/hacker-news-api-guide)
