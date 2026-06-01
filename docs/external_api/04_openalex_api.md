# OpenAlex API

**官方文档**: https://docs.openalex.org  
**API 参考**: https://developers.openalex.org/api-reference/introduction  
**模块用途**: 学术研究（补充论文引用、作者、机构数据）

---

## 概览

OpenAlex 是一个开放的学术知识图谱，覆盖超过 2.5 亿篇学术论文及其引用关系、作者、机构、期刊信息。是 Microsoft Academic Graph 的开源替代品。

> ⚠️ **重要变化**：从 **2026 年 2 月 13 日**起，使用 OpenAlex API 需要 API Key。

---

## 认证（Authentication）

### 获取 API Key
前往 [https://openalex.org/](https://openalex.org/) 注册账户，获取免费 API Key。

### 使用方式
在请求 URL 中添加 `api_key` 参数：
```
https://api.openalex.org/works?filter=...&api_key=YOUR_KEY
```

或在请求头中：
```http
Authorization: Bearer YOUR_API_KEY
```

### 邮箱 Polite Pool（推荐）
即使不用 API Key，也强烈建议添加邮箱参数，进入更快的"polite pool"：
```
https://api.openalex.org/works?mailto=your@email.com
```

---

## 速率限制

| 请求类型 | 消耗 Credits |
|-|-|
| Singleton 请求（`/works/W123`） | 0 credits（免费） |
| List 请求（`/works?filter=...`） | 1 credit |

免费版每日有 credit 限额，Premium 用户获得更高配额。

---

## 核心 Entity 类型

| Entity | 说明 | Endpoint |
|-|-|-|
| Works | 学术论文、书籍、数据集 | `/works` |
| Authors | 作者信息 | `/authors` |
| Sources | 期刊、会议、仓库 | `/sources` |
| Institutions | 大学、研究机构 | `/institutions` |
| Topics | 研究主题（机器学习分配） | `/topics` |
| Concepts | 研究概念（已被 Topics 取代） | `/concepts` |
| Funders | 资助机构 | `/funders` |
| Publishers | 出版商 | `/publishers` |

---

## API Endpoints

**Base URL**: `https://api.openalex.org`

### 获取论文列表
```
GET /works?filter={filter}&mailto={email}
```

### 获取单篇论文
```
GET /works/{openalex_id}
GET /works/doi:{doi}
```

### 获取作者信息
```
GET /authors/{openalex_id}
GET /authors/orcid:{orcid}
```

### 获取机构信息
```
GET /institutions/{openalex_id}
GET /institutions/ror:{ror_id}
```

---

## 过滤器（Filters）

### 常用 Works 过滤器

| 过滤器 | 示例 |
|-|-|
| `publication_year` | `publication_year:2024` |
| `concepts.id` | `concepts.id:C41008148`（计算机科学） |
| `topics.id` | `topics.id:T10109` |
| `institutions.id` | `institutions.id:I4210129448`（OpenAI） |
| `is_oa` | `is_oa:true`（开放获取） |
| `cited_by_count` | `cited_by_count:>100` |
| `type` | `type:article` |
| `from_publication_date` | `from_publication_date:2024-01-01` |

### 多条件组合（逗号 = AND）
```
/works?filter=publication_year:2024,concepts.id:C154945302,cited_by_count:>50
```

---

## 示例请求

### 获取 2024 年以来 AI 领域高引用论文
```
GET https://api.openalex.org/works?filter=concepts.id:C154945302,from_publication_date:2024-01-01,cited_by_count:>20&sort=cited_by_count:desc&per-page=50&mailto=your@email.com
```
（`C154945302` = Artificial Intelligence）

### 搜索全文
```
GET https://api.openalex.org/works?search=large+language+model+agent&sort=cited_by_count:desc
```

### 获取某机构的最新论文
```
GET https://api.openalex.org/works?filter=institutions.id:I4210129448,publication_year:2024&sort=publication_date:desc
```

### 统计每年论文数（Group By）
```
GET https://api.openalex.org/works?filter=concepts.id:C154945302&group_by=publication_year
```

---

## 响应结构

```json
{
  "meta": {
    "count": 12345,
    "page": 1,
    "per_page": 25
  },
  "results": [
    {
      "id": "https://openalex.org/W2741809807",
      "doi": "https://doi.org/10.48550/arXiv.1706.03762",
      "title": "Attention Is All You Need",
      "publication_year": 2017,
      "cited_by_count": 95000,
      "authorships": [...],
      "topics": [...],
      "open_access": {...},
      "primary_location": {...}
    }
  ]
}
```

---

## 分页

```
GET /works?filter=...&page=2&per-page=100
```

- 默认每页 25 条，最大 200 条
- 最多访问 10,000 条结果
- 超过 10,000 条请使用 [Snapshot](https://docs.openalex.org/download-all-data/openalex-snapshot)

---

## Python 快速上手

### 方法一：直接请求
```python
import requests

params = {
    "filter": "concepts.id:C154945302,from_publication_date:2024-01-01",
    "sort": "cited_by_count:desc",
    "per-page": 50,
    "mailto": "your@email.com",
    "api_key": "YOUR_API_KEY"
}

resp = requests.get("https://api.openalex.org/works", params=params)
data = resp.json()

for work in data["results"]:
    print(work["title"], work["cited_by_count"], work["publication_year"])
```

### 方法二：使用 pyalex 库
```bash
pip install pyalex
```

```python
from pyalex import Works, Authors
import pyalex

pyalex.config.email = "your@email.com"
pyalex.config.api_key = "YOUR_API_KEY"

# 搜索最新 AI 论文
results = (
    Works()
    .filter(concepts={"id": "C154945102"})
    .filter(from_publication_date="2024-01-01")
    .sort("cited_by_count:desc")
    .paginate(per_page=50)
)

for work in results:
    print(work["title"])
```

---

## 常用 Concept IDs（AI 领域）

| Concept | ID |
|-|-|
| Artificial Intelligence | C154945302 |
| Machine Learning | C119857082 |
| Deep Learning | C108827166 |
| Natural Language Processing | C204321447 |
| Computer Vision | C31972630 |
| Reinforcement Learning | C154945102 |

可以在 [https://openalex.org/concepts](https://openalex.org/concepts) 搜索更多。

---

## 项目用途建议

- **引用网络**：分析热门论文的引用关系，找出 AI 领域奠基性论文
- **机构排名**：统计各机构 AI 论文产出量和影响力
- **作者追踪**：追踪顶级 AI 研究者的最新发表
- **与 arXiv 互补**：arXiv 提供全文内容，OpenAlex 提供结构化元数据（引用数、关系图）

---

## 参考链接

- [OpenAlex 官方文档](https://docs.openalex.org)
- [API 参考](https://developers.openalex.org/api-reference/introduction)
- [速率限制和认证](https://docs.openalex.org/how-to-use-the-api/rate-limits-and-authentication)
- [pyalex Python 库](https://github.com/J535D165/pyalex)
- [API Key 申请通知](https://groups.google.com/g/openalex-users/c/rI1GIAySpVQ)
