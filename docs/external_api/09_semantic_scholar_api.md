# Semantic Scholar API

**官方文档**: https://api.semanticscholar.org/api-docs/  
**产品页面**: https://www.semanticscholar.org/product/api  
**模块用途**: 学术研究（AI/CS 论文搜索、引用图谱、影响力评分）

---

## 概览

Semantic Scholar 由 Allen Institute for AI 维护，覆盖超过 2 亿篇论文，专注于 AI 辅助的语义搜索和引用分析。与 arXiv 互补：arXiv 提供全文和最新预印本，Semantic Scholar 提供结构化的影响力数据和引用网络。

**三个子 API**：
| API | 用途 |
|-|-|
| Academic Graph API | 搜索论文、获取元数据、引用网络、作者信息 |
| Recommendations API | 根据论文 ID 推荐相似论文 |
| Datasets API | 下载完整数据集（离线大规模研究） |

---

## 认证（Authentication）

### 无 Key（公开访问）
- 所有未认证请求共享 **1,000 requests/second** 的全局池
- 高峰期可能被进一步限速

### API Key（推荐）
- 获取地址：https://www.semanticscholar.org/product/api#api-key
- 在请求头中添加：
```http
x-api-key: YOUR_API_KEY
```
- 认证后速率限制：
  - `/paper/batch`、`/paper/search`、`/recommendations`：**1 req/s**
  - 其他所有端点：**10 req/s**

---

## 速率限制

| 场景 | 限制 |
|-|-|
| 未认证（全局共享） | 1,000 req/s（共享） |
| 认证 - 搜索/批量/推荐 | 1 req/s |
| 认证 - 其他端点 | 10 req/s |

---

## Base URL

```
https://api.semanticscholar.org/graph/v1/
```

---

## 核心 Endpoints

### 搜索论文
```
GET /paper/search?query={keyword}&fields={fields}&limit={n}
```

示例：搜索 LLM Agent 论文
```
GET https://api.semanticscholar.org/graph/v1/paper/search?query=LLM+agent&fields=title,year,citationCount,authors,externalIds&limit=20
```

### 获取论文详情
```
GET /paper/{paper_id}?fields={fields}
```

`paper_id` 支持多种格式：
- Semantic Scholar ID：`649def34f8be52c8b66281af98ae884c09aef38b`
- arXiv ID：`arXiv:2303.08774`
- DOI：`DOI:10.18653/v1/2020.acl-main.174`
- PMID：`PMID:33400058`

```
GET https://api.semanticscholar.org/graph/v1/paper/arXiv:2303.08774?fields=title,abstract,year,citationCount,references,authors
```

### 批量获取论文（最高效）
```
POST /paper/batch
Content-Type: application/json

{
  "ids": ["arXiv:2303.08774", "arXiv:1706.03762", "DOI:10.xxxxx"]
}
```

加 `?fields=title,year,citationCount` 参数指定返回字段。

### 获取论文引用（被谁引用）
```
GET /paper/{paper_id}/citations?fields=title,year,citationCount&limit=50
```

### 获取论文参考文献（引用了谁）
```
GET /paper/{paper_id}/references?fields=title,year,citationCount&limit=50
```

### 获取作者信息
```
GET /author/{author_id}?fields=name,hIndex,citationCount,paperCount
```

### 获取作者论文列表
```
GET /author/{author_id}/papers?fields=title,year,citationCount&limit=50
```

### 推荐相似论文
```
GET https://api.semanticscholar.org/recommendations/v1/papers/forpaper/{paper_id}?fields=title,year,citationCount&limit=10
```

---

## 可用字段（fields 参数）

### 论文字段

| 字段 | 说明 |
|-|-|
| `title` | 标题 |
| `abstract` | 摘要 |
| `year` | 发表年份 |
| `citationCount` | 被引用次数 |
| `influentialCitationCount` | 有影响力的引用数 |
| `authors` | 作者列表 |
| `externalIds` | DOI、arXiv ID 等 |
| `publicationTypes` | 论文类型（JournalArticle、Conference 等） |
| `fieldsOfStudy` | 研究领域 |
| `tldr` | AI 生成的一句话摘要 ⭐ |
| `references` | 参考文献 |
| `citations` | 引用列表 |
| `openAccessPdf` | 开放获取 PDF 链接 |

---

## Python 快速上手

### 方法一：直接请求
```python
import requests
import time

API_KEY = "YOUR_API_KEY"
BASE = "https://api.semanticscholar.org/graph/v1"
HEADERS = {"x-api-key": API_KEY}

def search_papers(query: str, limit: int = 20) -> list:
    resp = requests.get(
        f"{BASE}/paper/search",
        headers=HEADERS,
        params={
            "query": query,
            "fields": "title,year,citationCount,authors,externalIds,tldr",
            "limit": limit
        }
    )
    return resp.json().get("data", [])

papers = search_papers("retrieval augmented generation")
for p in papers:
    tldr = p.get("tldr", {})
    summary = tldr.get("text", "N/A") if tldr else "N/A"
    print(f"[{p['year']}] {p['title']} ({p['citationCount']} citations)")
    print(f"  TLDR: {summary[:100]}")
```

### 方法二：批量获取多篇论文详情
```python
arxiv_ids = [
    "arXiv:2303.08774",  # GPT-4
    "arXiv:2302.13971",  # LLaMA
    "arXiv:2307.09288",  # LLaMA 2
    "arXiv:2303.12528",  # HuggingGPT
]

resp = requests.post(
    f"{BASE}/paper/batch",
    headers=HEADERS,
    params={"fields": "title,year,citationCount,influentialCitationCount"},
    json={"ids": arxiv_ids}
)

for paper in resp.json():
    if paper:
        print(f"{paper['title']} ({paper['year']}) - {paper['citationCount']} citations")

time.sleep(1)  # 遵守速率限制
```

### 方法三：使用官方 Python 库
```bash
pip install semanticscholar
```

```python
from semanticscholar import SemanticScholar

sch = SemanticScholar(api_key="YOUR_API_KEY")

# 搜索
results = sch.search_paper("large language model agent", limit=10)
for paper in results:
    print(paper.title, paper.year, paper.citationCount)

# 获取论文详情（含 TLDR）
paper = sch.get_paper("arXiv:2303.08774")
print(paper.tldr)
```

---

## 项目用途建议

- **AI 论文趋势**：按年统计 "transformer"、"LLM"、"agent" 等关键词的论文数量增长
- **影响力排行**：用 `citationCount` + `influentialCitationCount` 找出奠基性论文
- **引用网络**：追踪某篇论文的引用树，了解技术传播路径
- **TLDR 摘要**：利用 AI 生成的 `tldr` 字段快速筛选论文
- **与 arXiv 联用**：先在 arXiv 找最新论文，再用 Semantic Scholar 查引用数

---

## 参考链接

- [Semantic Scholar API 官方文档](https://api.semanticscholar.org/api-docs/)
- [API Key 申请](https://www.semanticscholar.org/product/api#api-key)
- [官方 Python 库 semanticscholar](https://github.com/danielnsilva/semanticscholar)
- [完整开发者指南](https://agentsapis.com/semantic-scholar-api/)
