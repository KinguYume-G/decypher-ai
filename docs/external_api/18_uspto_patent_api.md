# USPTO Patent API

**官方文档**: https://developer.uspto.gov/  
**Open Data Portal**: https://data.uspto.gov/apis/getting-started  
**API 目录**: https://developer.uspto.gov/api-catalog  
**模块用途**: 股市 / 公司研究（AI 专利趋势，技术创新信号）

---

## 概览

USPTO（美国专利商标局）Open Data Portal（ODP）提供对美国专利和商标申请数据的免费访问，包括专利申请书、审查历史、PTAB 决定等。通过分析专利数据，可以追踪 AI 技术的创新方向和各公司的技术布局。

> ℹ️ **2026 年更新**：新版 Open Data Portal 已上线，旧版 Beta 已于 2026 年 5 月 29 日关闭。所有 API 现已迁移至 `data.uspto.gov`。

---

## 认证

**需要 API Key**，但免费注册即可获取。

**获取方式**：
1. 访问 https://developer.uspto.gov/
2. 注册账户，申请 API Key
3. 在请求头或 URL 参数中携带

```http
X-API-KEY: YOUR_API_KEY
```

或 URL 参数：
```
?apiKey=YOUR_API_KEY
```

---

## 速率限制

免费 API Key 有速率限制（具体数值见申请后的账户说明），合理使用不会超限。

---

## Base URL

```
https://data.uspto.gov/
```

---

## 核心 Endpoints

### Patent File Wrapper API

**搜索专利申请**
```
GET https://data.uspto.gov/apis/patent-file-wrapper/search
```

常用参数：
| 参数 | 说明 | 示例 |
|-|-|-|
| `q` | 全文搜索关键词 | `artificial intelligence` |
| `dateRangeData.startDate` | 申请起始日期 | `2024-01-01` |
| `dateRangeData.endDate` | 申请截止日期 | `2024-12-31` |
| `assigneeEntityName` | 申请人/公司名称 | `Google` |
| `status` | 专利状态 | `PATENTED CASE` |
| `start` | 分页起始（offset） | `0` |
| `rows` | 每页返回数 | `50` |

**获取专利文件**
```
GET https://data.uspto.gov/apis/patent-file-wrapper/documents
```

### Patent Full-Text Search API（全文搜索）

**Base URL**: `https://developer.uspto.gov/ibd-api/v1/`

**搜索已授权专利全文**
```
GET /patent/application?query={keyword}&dateRange=custom&dateRangeStart={date}&dateRangeEnd={date}&rows={n}&start={offset}
```

示例：搜索 AI 相关专利
```
GET https://developer.uspto.gov/ibd-api/v1/patent/application?query=%22artificial+intelligence%22+%22machine+learning%22&rows=50&start=0&dateRange=custom&dateRangeStart=20240101&dateRangeEnd=20241231
```

---

## 更简单的方式：PatentsView API

**PatentsView** 是 USPTO 的另一个开放 API，专为分析研究设计，比 ODP 更易用：

**Base URL**: `https://search.patentsview.org/api/v1/`

**无需 API Key，完全免费**

### PatentsView 搜索专利
```
POST https://search.patentsview.org/api/v1/patent/
Content-Type: application/json
```

请求体：
```json
{
  "q": {
    "_and": [
      {"_contains": {"patent_abstract": "artificial intelligence"}},
      {"_gte": {"patent_date": "2023-01-01"}}
    ]
  },
  "f": ["patent_id", "patent_title", "patent_abstract", "patent_date", "assignee_organization", "cpc_category"],
  "o": {"patent_date": "desc"},
  "s": [{"patent_date": "desc"}],
  "per_page": 25,
  "page": 1
}
```

### 常用可返回字段（`f` 参数）

| 字段 | 说明 |
|-|-|
| `patent_id` | 专利号 |
| `patent_title` | 专利标题 |
| `patent_abstract` | 摘要 |
| `patent_date` | 授权日期 |
| `patent_type` | 类型（utility/design/plant） |
| `assignee_organization` | 申请公司 |
| `assignee_country` | 申请国家 |
| `inventor_last_name` | 发明人姓名 |
| `cpc_category` | CPC 分类号 |
| `cited_patent_count` | 被引用次数 |

---

## Python 快速上手

### 使用 PatentsView API（推荐，无需 Key）
```python
import requests
import time

def search_patents(keyword: str, start_date: str, end_date: str, page: int = 1, per_page: int = 25) -> dict:
    """
    start_date/end_date: 'YYYY-MM-DD' 格式
    """
    payload = {
        "q": {
            "_and": [
                {"_text_any": {"patent_abstract": keyword}},
                {"_gte": {"patent_date": start_date}},
                {"_lte": {"patent_date": end_date}}
            ]
        },
        "f": [
            "patent_id", "patent_title", "patent_date",
            "assignee_organization", "cpc_category", "cited_patent_count"
        ],
        "s": [{"patent_date": "desc"}],
        "per_page": per_page,
        "page": page
    }
    
    resp = requests.post(
        "https://search.patentsview.org/api/v1/patent/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    time.sleep(0.5)
    return resp.json()

# 搜索 2024 年 AI 专利
result = search_patents(
    keyword="large language model",
    start_date="2024-01-01",
    end_date="2024-12-31",
    per_page=20
)

print(f"Total patents found: {result.get('total_patent_count', 0)}")
for patent in result.get("patents", []):
    assignee = patent.get("assignee_organization", [{}])
    org = assignee[0].get("assignee_organization", "Unknown") if assignee else "Unknown"
    print(f"[{patent['patent_date']}] {patent['patent_title'][:70]}")
    print(f"  Assignee: {org} | Cited: {patent.get('cited_patent_count', 0)}")
```

### 分析各公司 AI 专利数量
```python
import requests
from collections import Counter

def get_ai_patents_by_company(keyword: str, year: int) -> list:
    """获取某年某关键词的所有专利，统计公司分布"""
    all_patents = []
    page = 1
    
    while True:
        result = search_patents(
            keyword=keyword,
            start_date=f"{year}-01-01",
            end_date=f"{year}-12-31",
            page=page,
            per_page=100
        )
        patents = result.get("patents", [])
        if not patents:
            break
        all_patents.extend(patents)
        
        if len(all_patents) >= result.get("total_patent_count", 0):
            break
        page += 1
    
    return all_patents

patents = get_ai_patents_by_company("neural network", 2023)

# 统计各公司专利数
company_counts = Counter()
for patent in patents:
    assignees = patent.get("assignee_organization", [])
    for assignee in assignees:
        org = assignee.get("assignee_organization")
        if org:
            company_counts[org] += 1

print(f"\n=== 2023 Neural Network Patents by Company ===")
for company, count in company_counts.most_common(15):
    print(f"{company:40s}: {count:>5} patents")
```

### 追踪 AI 专利年度趋势
```python
def get_annual_patent_count(keyword: str, years: range) -> dict:
    counts = {}
    for year in years:
        result = search_patents(keyword, f"{year}-01-01", f"{year}-12-31", per_page=1)
        counts[year] = result.get("total_patent_count", 0)
        print(f"{year}: {counts[year]:,} patents")
        time.sleep(1)
    return counts

# AI 专利 5 年增长趋势
trend = get_annual_patent_count("artificial intelligence", range(2019, 2025))
```

---

## CPC 分类号（AI 相关）

| 分类号 | 说明 |
|-|-|
| `G06N` | 计算机系统（机器学习/神经网络） |
| `G06N 3/00` | 神经网络 |
| `G06N 20/00` | 机器学习 |
| `G06F 40/00` | 自然语言处理 |
| `G06V` | 图像/视频识别 |
| `G10L` | 语音处理 |

---

## 项目用途建议

- **技术创新追踪**：统计 AI 细分领域（LLM、CV、Robotics）专利数量年度增长
- **公司技术布局**：对比 Google、Microsoft、Meta、Amazon 的 AI 专利领域分布
- **新兴技术信号**：首次出现大量专利往往预示技术即将商业化
- **竞争情报**：结合 SEC EDGAR 财报分析，了解公司研发→专利→产品的全链路

---

## 参考链接

- [USPTO Open Data Portal](https://developer.uspto.gov/)
- [PatentsView API 文档](https://search.patentsview.org/docs/)
- [Patent File Wrapper API](https://data.uspto.gov/apis/patent-file-wrapper/search)
- [Getting Started Guide](https://data.uspto.gov/apis/getting-started)
