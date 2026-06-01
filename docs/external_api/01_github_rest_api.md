# GitHub REST API

**官方文档**: https://docs.github.com/en/rest  
**模块用途**: 创业机会 / 技术趋势（AI 技术项目趋势分析）

---

## 概览

GitHub REST API 提供对 GitHub 平台上几乎所有资源的程序化访问，包括仓库、用户、议题、提交、Star 记录等。非常适合追踪 AI/技术项目的流行度趋势。

---

## 认证（Authentication）

### 无认证（Unauthenticated）
- 每小时 **60 请求**
- 只读，公开资源

### Personal Access Token（PAT）
推荐方式。在请求头中添加：

```http
Authorization: Bearer YOUR_TOKEN
```

**获取方式**：  
GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens

### GitHub App Token
适合高频、生产级应用，速率限制最高。

---

## 速率限制（Rate Limits）

| 认证方式 | 限制 |
|-|-|
| 未认证 | 60 请求/小时 |
| PAT / OAuth | 5,000 请求/小时 |
| GitHub Actions (`GITHUB_TOKEN`) | 1,000 请求/小时/仓库 |
| GitHub Enterprise Cloud | 15,000 请求/小时/仓库 |

**并发限制**：最多 100 个并发请求（REST + GraphQL 共享）  
**检查剩余额度**：
```
GET https://api.github.com/rate_limit
```

响应头中也会包含：
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`（Unix 时间戳）

---

## 核心 Endpoints

### 搜索仓库（趋势分析核心）
```
GET https://api.github.com/search/repositories?q={query}&sort=stars&order=desc
```

示例：搜索近期热门 AI 仓库
```
GET https://api.github.com/search/repositories?q=topic:llm+created:>2024-01-01&sort=stars&order=desc&per_page=30
```

### 获取仓库信息
```
GET https://api.github.com/repos/{owner}/{repo}
```

### 获取仓库 Star 历史（需第三方库）
官方 API 只提供当前 Star 数，历史变化需通过 [star-history.com](https://star-history.com) 或 `stargazers` 列表自行遍历。

### 获取 Trending 话题（Topic）
```
GET https://api.github.com/search/topics?q={keyword}
```

### 获取最新 Commit
```
GET https://api.github.com/repos/{owner}/{repo}/commits
```

### 搜索代码
```
GET https://api.github.com/search/code?q={query}+language:python
```

### 搜索用户
```
GET https://api.github.com/search/users?q={query}+type:org
```

---

## 实用查询示例（项目用）

**1. 获取最近创建的 AI 相关热门仓库**
```
GET https://api.github.com/search/repositories
  ?q=artificial+intelligence+created:>2024-06-01
  &sort=stars
  &order=desc
  &per_page=50
```

**2. 获取某仓库 Issues（了解用户痛点）**
```
GET https://api.github.com/repos/openai/openai-python/issues?state=open&per_page=20
```

**3. 按语言筛选**
```
GET https://api.github.com/search/repositories?q=topic:ai+language:python&sort=updated
```

---

## Python 快速上手

```python
import requests

headers = {
    "Authorization": "Bearer YOUR_GITHUB_TOKEN",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

url = "https://api.github.com/search/repositories"
params = {
    "q": "topic:llm created:>2024-01-01",
    "sort": "stars",
    "order": "desc",
    "per_page": 30
}

response = requests.get(url, headers=headers, params=params)
data = response.json()

for repo in data["items"]:
    print(repo["full_name"], repo["stargazers_count"])
```

---

## 注意事项

- 搜索 API 最多返回 **1000 条结果**（10 页 × 100 条），超出需换 query 分批
- 时间戳格式：`YYYY-MM-DD`
- 分页：使用 `page` 和 `per_page` 参数，或使用响应头 `Link` 里的 `next` URL
- 字段筛选：使用 `?per_page=100&page=2` 等参数
- 推荐使用官方 SDK：[PyGitHub](https://github.com/PyGithub/PyGithub)

---

## 参考链接

- [GitHub REST API 官方文档](https://docs.github.com/en/rest)
- [认证文档](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api)
- [速率限制文档](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [搜索语法](https://docs.github.com/en/search-github/searching-on-github)
