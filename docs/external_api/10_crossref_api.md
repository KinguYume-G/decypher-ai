# Crossref API

**官方文档**: https://www.crossref.org/documentation/retrieve-metadata/rest-api/  
**Swagger UI**: https://api.crossref.org/  
**模块用途**: 学术研究（DOI 元数据、引用计数、期刊/机构覆盖面最广）

---

## 概览

Crossref 是学术出版的 DOI 注册机构，覆盖超过 1.5 亿条学术记录，包括期刊文章、会议论文、书籍、数据集等。与 OpenAlex 和 Semantic Scholar 互补，Crossref 的优势是 **DOI 元数据最权威**，出版商直接在此注册。

---

## 认证

**无需 API Key，完全免费。**

强烈建议在每个请求中加上 `mailto` 参数，进入更快的"礼貌池"（Polite Pool），获得更高优先级和更稳定的响应：

```
?mailto=your@email.com
```

---

## 速率限制

- 无明确速率上限，但礼貌池用户享有更高优先级
- 建议请求间隔 ≥ 1 秒，避免被降速

---

## Base URL

```
https://api.crossref.org/
```

---

## 核心 Endpoints

### 搜索论文（Works）
```
GET /works?query={keyword}&mailto={email}
```

示例：搜索 AI 相关论文
```
GET https://api.crossref.org/works?query=large+language+model&rows=20&mailto=your@email.com
```

### 按 DOI 获取单篇论文
```
GET /works/{DOI}
```

示例：
```
GET https://api.crossref.org/works/10.48550/arXiv.1706.03762
```

### 获取期刊信息
```
GET /journals/{ISSN}
```

### 搜索期刊
```
GET /journals?query={journal_name}
```

### 获取机构信息（Funder）
```
GET /funders/{funder_id}
```

### 获取出版商信息（Member）
```
GET /members/{member_id}
```

---

## 过滤器（filter 参数）

过滤器用逗号分隔，格式为 `filter=key:value,key:value`：

| 过滤器 | 示例 | 说明 |
|-|-|-|
| `from-pub-date` | `from-pub-date:2024-01-01` | 发布日期起始 |
| `until-pub-date` | `until-pub-date:2024-12-31` | 发布日期截止 |
| `type` | `type:journal-article` | 文献类型 |
| `has-references` | `has-references:true` | 有参考文献 |
| `has-abstract` | `has-abstract:true` | 有摘要 |
| `is-referenced-by-count` | `is-referenced-by-count:100` | 引用数（暂不支持范围） |
| `member` | `member:78` | 特定出版商（CrossRef member ID） |
| `container-title` | `container-title:Nature` | 期刊名 |

示例：获取 2024 年以来的 AI 期刊文章
```
GET https://api.crossref.org/works?query=artificial+intelligence&filter=from-pub-date:2024-01-01,type:journal-article&rows=50&sort=published&order=desc&mailto=your@email.com
```

---

## 排序（sort & order）

```
?sort=published&order=desc
?sort=is-referenced-by-count&order=desc
?sort=relevance&order=desc
```

| sort 值 | 说明 |
|-|-|
| `published` | 发布日期 |
| `is-referenced-by-count` | 被引用次数 |
| `relevance` | 相关度（需配合 query） |
| `deposited` | 元数据存入日期 |

---

## 分页

**方法一：offset 分页**（最多 10,000 条）
```
?rows=100&offset=200
```

**方法二：cursor 分页**（推荐，无上限）
```
?rows=100&cursor=*           # 第一页
?rows=100&cursor=NEXT_CURSOR # 后续页
```

响应中的 `next-cursor` 字段包含下一页 cursor，有效期 5 分钟。

---

## 响应结构

```json
{
  "status": "ok",
  "message-type": "work-list",
  "message": {
    "total-results": 12345,
    "next-cursor": "AoE=...",
    "items": [
      {
        "DOI": "10.48550/arxiv.2303.08774",
        "title": ["GPT-4 Technical Report"],
        "published": {"date-parts": [[2023, 3, 15]]},
        "is-referenced-by-count": 8900,
        "type": "journal-article",
        "container-title": ["arXiv"],
        "author": [{"given": "OpenAI", "family": ""}],
        "abstract": "...",
        "URL": "http://dx.doi.org/10.48550/arxiv.2303.08774"
      }
    ]
  }
}
```

---

## Python 快速上手

### 基本搜索
```python
import requests
import time

EMAIL = "your@email.com"
BASE = "https://api.crossref.org"

def search_works(query: str, rows: int = 50, filters: str = "") -> dict:
    params = {
        "query": query,
        "rows": rows,
        "sort": "is-referenced-by-count",
        "order": "desc",
        "mailto": EMAIL
    }
    if filters:
        params["filter"] = filters
    
    resp = requests.get(f"{BASE}/works", params=params)
    time.sleep(1)
    return resp.json()["message"]

result = search_works(
    "transformer neural network",
    filters="from-pub-date:2023-01-01,type:journal-article"
)

print(f"Total results: {result['total-results']}")
for item in result["items"][:10]:
    title = item.get("title", ["N/A"])[0]
    citations = item.get("is-referenced-by-count", 0)
    year = item.get("published", {}).get("date-parts", [[None]])[0][0]
    print(f"[{year}] {title} - {citations} citations")
```

### cursor 分页遍历大量结果
```python
def get_all_works(query: str, max_items: int = 1000):
    all_items = []
    cursor = "*"
    
    while len(all_items) < max_items:
        resp = requests.get(f"{BASE}/works", params={
            "query": query,
            "rows": 100,
            "cursor": cursor,
            "mailto": EMAIL
        })
        data = resp.json()["message"]
        items = data["items"]
        
        if not items:
            break
        
        all_items.extend(items)
        cursor = data.get("next-cursor")
        if not cursor:
            break
        
        time.sleep(1)
    
    return all_items[:max_items]
```

### 按 DOI 获取论文
```python
def get_by_doi(doi: str) -> dict:
    resp = requests.get(f"{BASE}/works/{doi}", params={"mailto": EMAIL})
    return resp.json()["message"]

paper = get_by_doi("10.48550/arXiv.1706.03762")
print(paper["title"], paper["is-referenced-by-count"])
```

---

## 文献类型（type 值）

| type | 说明 |
|-|-|
| `journal-article` | 期刊文章 |
| `conference-paper` | 会议论文 |
| `book-chapter` | 书章节 |
| `dataset` | 数据集 |
| `posted-content` | 预印本（含 arXiv） |
| `report` | 技术报告 |

---

## 项目用途建议

- **DOI 解析**：将其他来源的 DOI 批量解析为完整元数据
- **引用趋势**：追踪特定论文或领域的引用数增长
- **期刊分析**：分析某期刊的 AI 相关论文发表量
- **与 OpenAlex 互补**：Crossref 的 DOI 覆盖更全，OpenAlex 的引用关系更丰富

---

## 参考链接

- [Crossref REST API 官方文档](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [REST API Filters 完整列表](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/)
- [Swagger UI（可在线测试）](https://api.crossref.org/)
- [GitHub 文档仓库](https://github.com/CrossRef/rest-api-doc)
