# Libraries.io API

**官方文档**: https://libraries.io/api  
**模块用途**: 技术趋势（跨语言开源包依赖关系、维护状态、版本趋势）

---

## 概览

Libraries.io 聚合了 30+ 个包管理器（npm、PyPI、RubyGems、Maven 等）的数据，提供包的元数据、依赖关系、维护健康度评分，以及哪些项目依赖了某个包（反向依赖）。是分析开源生态依赖关系的最佳单一来源。

---

## 认证

**需要 API Key**，但免费注册即可获取。

**获取方式**：
1. 注册账户：https://libraries.io/
2. 前往账户设置 → API Key

**使用方式**：在所有请求的 URL 参数中加入：
```
?api_key=YOUR_API_KEY
```

---

## 速率限制

- **60 请求/分钟**（基于 API Key）
- 超出返回 `429 Too Many Requests`

---

## Base URL

```
https://libraries.io/api/
```

---

## 核心 Endpoints

### 获取包信息
```
GET /{platform}/{package}?api_key={key}
```

`platform` 值：`npm`、`pypi`、`rubygems`、`maven`、`cargo`、`go`、`nuget` 等

示例：
```
GET https://libraries.io/api/pypi/torch?api_key=YOUR_KEY
GET https://libraries.io/api/npm/openai?api_key=YOUR_KEY
```

返回字段包括：当前版本、Stars、Forks、依赖数、被依赖项目数、最后发布时间、维护健康度等。

### 获取包的所有版本
```
GET /{platform}/{package}/versions?api_key={key}
```

### 获取包的依赖（它依赖了什么）
```
GET /{platform}/{package}/{version}/dependencies?api_key={key}
```

### 获取包的反向依赖（谁在用它）
```
GET /{platform}/{package}/dependents?api_key={key}
```

### 搜索包
```
GET /search?q={keyword}&platforms={platform}&api_key={key}
```

| 参数 | 说明 |
|-|-|
| `q` | 搜索关键词 |
| `platforms` | 限定平台（可多选，逗号分隔） |
| `languages` | 编程语言过滤 |
| `keywords` | 关键词标签过滤 |
| `sort` | 排序：`rank`、`stars`、`dependents_count`、`latest_release_published_at` |

示例：搜索热门 AI Python 包
```
GET https://libraries.io/api/search?q=llm&platforms=pypi&sort=rank&per_page=30&api_key=YOUR_KEY
```

### 获取支持的平台列表
```
GET /platforms?api_key={key}
```

### 获取 GitHub 仓库信息（需绑定仓库）
```
GET /github/{owner}/{repo}?api_key={key}
```

---

## 响应结构

### 包信息对象
```json
{
  "name": "torch",
  "platform": "PyPI",
  "description": "Tensors and Dynamic neural networks in Python...",
  "homepage": "https://pytorch.org/",
  "latest_version": "2.3.0",
  "normalized_licenses": ["BSD"],
  "rank": 2,
  "stars": 78000,
  "forks": 21000,
  "dependents_count": 45321,
  "dependent_repos_count": 198432,
  "latest_stable_release_published_at": "2024-04-24T00:00:00.000Z",
  "last_synced_at": "2024-05-30T12:00:00.000Z",
  "status": null
}
```

---

## 分页

```
?page=1&per_page=30
```

默认每页 30 条，最大 100 条。

---

## Python 快速上手

### 获取包信息对比
```python
import requests
import time

API_KEY = "YOUR_LIBRARIES_IO_KEY"
BASE = "https://libraries.io/api"

def get_package(platform: str, package: str) -> dict:
    resp = requests.get(
        f"{BASE}/{platform}/{package}",
        params={"api_key": API_KEY}
    )
    time.sleep(1.1)  # 遵守 60 req/min 限制
    return resp.json()

# 对比 AI 框架
ai_packages = [
    ("pypi", "torch"),
    ("pypi", "tensorflow"),
    ("pypi", "jax"),
    ("pypi", "transformers"),
    ("npm", "openai"),
    ("npm", "langchain"),
]

print(f"{'Package':<25} {'Platform':<8} {'Dependents':>12} {'Stars':>8} {'Rank':>6}")
for platform, pkg in ai_packages:
    data = get_package(platform, pkg)
    print(f"{pkg:<25} {platform:<8} {data.get('dependents_count',0):>12,} {data.get('stars',0):>8,} {data.get('rank','N/A'):>6}")
```

### 搜索 AI 相关包
```python
def search_packages(query: str, platform: str = "pypi", sort: str = "dependents_count") -> list:
    resp = requests.get(
        f"{BASE}/search",
        params={
            "q": query,
            "platforms": platform,
            "sort": sort,
            "per_page": 30,
            "api_key": API_KEY
        }
    )
    time.sleep(1.1)
    return resp.json()

results = search_packages("llm agent", platform="pypi", sort="rank")
for pkg in results[:10]:
    print(f"[{pkg['platform']}] {pkg['name']} - ⭐{pkg['stars']:,} - {pkg['dependents_count']:,} dependents")
    print(f"  {pkg['description'][:80]}")
```

### 获取某包的反向依赖（谁在用它）
```python
def get_dependents(platform: str, package: str, pages: int = 3) -> list:
    all_deps = []
    for page in range(1, pages + 1):
        resp = requests.get(
            f"{BASE}/{platform}/{package}/dependents",
            params={"api_key": API_KEY, "page": page, "per_page": 100}
        )
        data = resp.json()
        all_deps.extend(data)
        if len(data) < 100:
            break
        time.sleep(1.1)
    return all_deps

# 谁在依赖 openai Python SDK？
deps = get_dependents("pypi", "openai", pages=2)
print(f"Top dependents of openai:")
for dep in sorted(deps, key=lambda x: x.get("stars", 0), reverse=True)[:10]:
    print(f"  ⭐{dep.get('stars',0):,} {dep['name']}")
```

---

## 支持的平台（Package Managers）

| platform 值 | 说明 |
|-|-|
| `pypi` | Python |
| `npm` | JavaScript |
| `maven` | Java |
| `cargo` | Rust |
| `rubygems` | Ruby |
| `go` | Go |
| `nuget` | .NET |
| `packagist` | PHP |
| `cocoapods` | iOS |
| `hex` | Elixir/Erlang |

---

## 项目用途建议

- **生态健康度**：评估某 AI 包的维护状态（最后发布时间、版本频率）
- **依赖图谱**：了解 AI 工具链的上下游依赖关系
- **采用率**：`dependents_count` 直接反映该包被多少个其他包依赖
- **跨语言对比**：同时追踪 PyPI（Python）和 npm（JS）的 AI 生态

---

## 参考链接

- [Libraries.io API 官方文档](https://libraries.io/api)
- [Libraries.io 主站](https://libraries.io/)
