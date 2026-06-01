# Product Hunt API

**官方文档**: https://api.producthunt.com/v2/docs  
**GraphQL Explorer**: https://ph-graph-api-explorer.herokuapp.com  
**模块用途**: 创业机会（新 AI 产品和创业项目）

---

## 概览

Product Hunt API v2 基于 **GraphQL**，提供对 Product Hunt 平台上产品、话题、帖子、用户、评论等数据的访问。适合追踪新发布的 AI 产品和创业项目。

> ⚠️ **商业限制**：API 不得用于商业目的，商业使用需联系 hello@producthunt.com。

---

## API 端点

```
POST https://api.producthunt.com/v2/api/graphql
```

---

## 认证（Authentication）

### 获取 API 凭证
1. 前往 https://www.producthunt.com/v2/oauth/applications
2. 创建新应用，获得 `client_id` 和 `client_secret`

### 获取 Access Token（Client Credentials Flow）

```bash
curl -X POST https://api.producthunt.com/v2/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "grant_type": "client_credentials"
  }'
```

返回：
```json
{
  "access_token": "abc123...",
  "token_type": "bearer",
  "expires_in": 86400,
  "scope": "public"
}
```

### 使用 Token
在所有请求头中添加：
```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### OAuth Scopes
| Scope | 说明 |
|-|-|
| `public` | 读取公开数据（大多数场景） |
| `private` | 读取私有数据 |
| `write` | 写操作（投票、评论等） |

---

## GraphQL 查询

GraphQL 与 REST 不同，所有查询通过 POST 请求发送到单一端点，查询体在 `query` 字段中。

### 获取今日热门产品

```graphql
query {
  posts(order: VOTES, first: 20) {
    edges {
      node {
        id
        name
        tagline
        description
        votesCount
        commentsCount
        website
        url
        createdAt
        topics {
          edges {
            node {
              name
              slug
            }
          }
        }
        thumbnail {
          url
        }
      }
    }
  }
}
```

### 按日期获取产品（日期范围）

```graphql
query {
  posts(
    order: VOTES
    first: 50
    postedBefore: "2024-12-31T23:59:59Z"
    postedAfter: "2024-12-01T00:00:00Z"
  ) {
    edges {
      node {
        name
        tagline
        votesCount
        createdAt
        topics { edges { node { name } } }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 按话题筛选（如 AI）

```graphql
query {
  topic(slug: "artificial-intelligence") {
    id
    name
    followersCount
    posts(first: 30, order: VOTES) {
      edges {
        node {
          name
          tagline
          votesCount
          createdAt
          url
        }
      }
    }
  }
}
```

### 搜索产品

```graphql
query {
  search(query: "AI agent", first: 20) {
    edges {
      node {
        ... on Post {
          name
          tagline
          votesCount
          createdAt
        }
      }
    }
  }
}
```

### 获取评论（了解用户反馈）

```graphql
query {
  post(id: "12345") {
    name
    comments(first: 20, order: VOTES) {
      edges {
        node {
          body
          votesCount
          createdAt
          user {
            name
            username
          }
        }
      }
    }
  }
}
```

---

## 分页

Product Hunt API 使用 **Cursor-based 分页**：

```graphql
query {
  posts(first: 20, after: "CURSOR_FROM_PREVIOUS_RESPONSE") {
    edges { node { name } }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## Python 快速上手

```python
import requests

ACCESS_TOKEN = "YOUR_ACCESS_TOKEN"

def ph_query(query: str, variables: dict = None):
    resp = requests.post(
        "https://api.producthunt.com/v2/api/graphql",
        headers={
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json"
        },
        json={"query": query, "variables": variables or {}}
    )
    return resp.json()

# 获取今日热门 AI 产品
GET_AI_POSTS = """
query($cursor: String) {
  topic(slug: "artificial-intelligence") {
    posts(first: 30, order: VOTES, after: $cursor) {
      edges {
        node {
          name
          tagline
          votesCount
          createdAt
          url
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}
"""

result = ph_query(GET_AI_POSTS)
posts = result["data"]["topic"]["posts"]["edges"]

for post in posts:
    p = post["node"]
    print(f"[{p['votesCount']}👍] {p['name']}: {p['tagline']}")
```

---

## 重要话题 Slugs（AI 相关）

| Slug | 说明 |
|-|-|
| `artificial-intelligence` | 人工智能 |
| `machine-learning` | 机器学习 |
| `developer-tools` | 开发者工具 |
| `productivity` | 生产力工具 |
| `chatbot` | 聊天机器人 |
| `open-source` | 开源项目 |
| `saas` | SaaS 产品 |

可以在 https://www.producthunt.com/topics 浏览所有话题。

---

## 项目用途建议

- **新产品监控**：每日抓取 AI 相关新发布产品，追踪市场动态
- **创业信号**：高票产品往往是早期创业公司的验证信号
- **竞品分析**：搜索特定领域产品，了解竞争格局
- **话题趋势**：统计 AI 细分话题（RAG、Agent、Voice AI 等）的产品数量增长

---

## 注意事项

- Token 默认有效期为 24 小时，需定期刷新
- `posts` 排序选项：`VOTES`（投票数）、`NEWEST`（最新）
- 无明确文档的速率限制，建议适度请求

---

## 参考链接

- [Product Hunt API 官方文档](https://api.producthunt.com/v2/docs)
- [GitHub 官方 SDK](https://github.com/producthunt/producthunt-api)
- [Postman 文档](https://www.postman.com/api-evangelist/product-hunt/documentation/vgxer9c/product-hunt)
- [API Essential Guide](https://rollout.com/integration-guides/product-hunt/api-essentials)
