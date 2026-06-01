# arXiv API

**官方文档**: https://info.arxiv.org/help/api/index.html  
**模块用途**: 学术研究（AI 论文趋势核心来源）

---

## 概览

arXiv API 提供对 arXiv 上所有预印本论文的搜索和访问功能。无需注册，无需 API Key，返回格式为 Atom 1.0 (XML)。

---

## 认证

**无需认证，无需 API Key。** 直接 HTTP GET 即可。

---

## 速率限制

- 每 **3 秒**最多 1 次请求（官方 Terms of Use 要求）
- 建议在循环请求中加入 `time.sleep(3)`

---

## API Endpoint

**Base URL**:
```
https://export.arxiv.org/api/query
```

---

## 查询参数

| 参数 | 说明 | 示例 |
|-|-|-|
| `search_query` | 搜索关键词，支持字段前缀 | `ti:transformer` |
| `id_list` | 指定论文 ID（逗号分隔） | `1706.03762,2303.08774` |
| `start` | 结果起始偏移量（分页） | `0` |
| `max_results` | 返回结果数（最大 2000，建议 ≤100） | `50` |
| `sortBy` | 排序方式 | `relevance` / `lastUpdatedDate` / `submittedDate` |
| `sortOrder` | 排序方向 | `descending` / `ascending` |

---

## 搜索字段前缀

| 前缀 | 搜索范围 |
|-|-|
| `ti:` | 标题 (title) |
| `au:` | 作者 (author) |
| `abs:` | 摘要 (abstract) |
| `cat:` | 分类 (category) |
| `all:` | 所有字段 |
| `id:` | arXiv ID |

### 布尔运算符
- `AND`、`OR`、`ANDNOT`（必须大写）

---

## 示例请求

### 搜索 LLM 相关最新论文
```
GET https://export.arxiv.org/api/query?search_query=ti:large+language+model&sortBy=submittedDate&sortOrder=descending&max_results=20
```

### 获取指定论文
```
GET https://export.arxiv.org/api/query?id_list=1706.03762
```
（`1706.03762` 是 "Attention Is All You Need"）

### 搜索 cs.AI 分类下最新论文
```
GET https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=50
```

### 组合搜索
```
GET https://export.arxiv.org/api/query?search_query=ti:agent+AND+abs:LLM+AND+cat:cs.AI&max_results=30
```

---

## 主要分类（Categories）

| 分类 | 说明 |
|-|-|
| `cs.AI` | 人工智能 |
| `cs.LG` | 机器学习 |
| `cs.CL` | 计算语言学（NLP） |
| `cs.CV` | 计算机视觉 |
| `cs.RO` | 机器人学 |
| `cs.NE` | 神经网络与进化计算 |
| `stat.ML` | 统计机器学习 |

---

## 响应解析（Atom XML）

返回的 XML 中每篇论文是一个 `<entry>` 节点，关键字段：

| 字段 | 说明 |
|-|-|
| `<id>` | 论文 URL，包含 arXiv ID |
| `<title>` | 标题 |
| `<summary>` | 摘要 |
| `<author><name>` | 作者名 |
| `<published>` | 首次提交日期 |
| `<updated>` | 最后更新日期 |
| `<category term="">` | 分类 |
| `<link href="">` | PDF / HTML 链接 |

---

## Python 快速上手

### 方法一：直接请求 + XML 解析
```python
import requests
import xml.etree.ElementTree as ET
import time

url = "https://export.arxiv.org/api/query"
params = {
    "search_query": "ti:large language model AND cat:cs.CL",
    "sortBy": "submittedDate",
    "sortOrder": "descending",
    "max_results": 20
}

resp = requests.get(url, params=params)
root = ET.fromstring(resp.text)

ns = {"atom": "http://www.w3.org/2005/Atom"}
for entry in root.findall("atom:entry", ns):
    title = entry.find("atom:title", ns).text.strip()
    published = entry.find("atom:published", ns).text
    arxiv_id = entry.find("atom:id", ns).text.split("/abs/")[-1]
    print(f"[{published[:10]}] {arxiv_id}: {title}")

time.sleep(3)  # 遵守速率限制
```

### 方法二：使用官方 Python 库
```bash
pip install arxiv
```

```python
import arxiv

client = arxiv.Client()
search = arxiv.Search(
    query="large language model agent",
    max_results=20,
    sort_by=arxiv.SortCriterion.SubmittedDate,
    sort_order=arxiv.SortOrder.Descending
)

for result in client.results(search):
    print(result.title)
    print(result.entry_id)
    print(result.published)
    print(result.summary[:200])
    print("---")
```

---

## 项目用途建议

- **AI 论文趋势**：按周/月统计 `cs.AI`、`cs.LG`、`cs.CL` 论文数量变化
- **关键词热度**：统计特定术语（如 "RAG"、"agent"、"multimodal"）在摘要/标题中的出现频率
- **作者/机构追踪**：追踪顶级研究机构（OpenAI、DeepMind 等）的论文产出
- **引用网络**：配合 OpenAlex API 构建论文引用关系图

---

## 注意事项

- `max_results` 建议不超过 100，分批请求时每次间隔 3 秒
- 大批量数据建议使用 [arXiv Bulk Data Access（S3）](https://info.arxiv.org/help/bulk_data_s3.html)
- arXiv ID 格式：`YYMM.NNNNN`（如 `2401.12345`）

---

## 参考链接

- [arXiv API 用户手册](https://info.arxiv.org/help/api/user-manual.html)
- [arXiv API 基础](https://info.arxiv.org/help/api/basics.html)
- [arxiv.py Python 库](https://github.com/lukasschwab/arxiv.py)
- [arXiv 分类列表](https://arxiv.org/category_taxonomy)
