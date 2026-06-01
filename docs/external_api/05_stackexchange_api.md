# Stack Exchange API

**官方文档**: https://api.stackexchange.com/docs  
**Stack Apps（注册应用）**: https://stackapps.com/apps/oauth/register  
**模块用途**: 求职热点（技能热度和开发者问题趋势）

---

## 概览

Stack Exchange API v2.3 提供对 Stack Overflow 及其他 Stack Exchange 站点（Server Fault、Ask Ubuntu 等）数据的访问，包括问题、答案、标签、用户等。非常适合分析技术技能热度趋势。

---

## 认证（Authentication）

### 无认证（Unauthenticated）
- 每天每 IP **300 请求**
- 只读，访问公开数据

### API Key（推荐，无需 OAuth）
- 每天每 Key **10,000 请求**
- 在请求中加 `&key=YOUR_KEY` 即可

**获取方式**：
1. 访问 [https://stackapps.com/apps/oauth/register](https://stackapps.com/apps/oauth/register)
2. 注册应用（即使不用 OAuth 也要注册）
3. 获得 `key` 字符串

### OAuth 2.0（写操作需要）
用于投票、提问等写操作，大多数数据分析场景不需要。

---

## 速率限制

| 认证方式 | 限制 |
|-|-|
| 无认证 | 300 请求/天/IP |
| API Key | 10,000 请求/天/Key |

**配额检查**：每个响应的 `quota_remaining` 字段显示剩余额度。

**节流**：如果请求过于频繁，会收到 `backoff` 字段，必须等待指定秒数后再请求。

---

## Base URL

```
https://api.stackexchange.com/2.3/
```

所有请求必须包含 `site` 参数（如 `site=stackoverflow`）。

---

## 核心 Endpoints

### 获取问题列表
```
GET /questions?site=stackoverflow&order=desc&sort=votes
```

| `sort` 值 | 说明 |
|-|-|
| `activity` | 最近活跃 |
| `votes` | 投票数 |
| `creation` | 创建时间 |
| `hot` | 热度 |
| `week` | 本周热门 |
| `month` | 本月热门 |

### 按标签搜索问题
```
GET /questions?site=stackoverflow&tagged={tag}&sort=votes&order=desc
```

示例：搜索 LLM 相关问题
```
GET https://api.stackexchange.com/2.3/questions?site=stackoverflow&tagged=large-language-model&sort=votes&order=desc&pagesize=50&key=YOUR_KEY
```

### 搜索问题（全文）
```
GET /search?site=stackoverflow&intitle={keywords}&tagged={tag}
```

### 高级搜索
```
GET /search/advanced?site=stackoverflow&q={keywords}&tagged={tag}&answers=1&sort=votes
```

### 获取标签信息
```
GET /tags/{tag}/info?site=stackoverflow
```

### 获取热门标签（技能趋势）
```
GET /tags?site=stackoverflow&order=desc&sort=popular&pagesize=100
```

### 获取标签问题数统计（趋势核心）
```
GET /tags?site=stackoverflow&inname={keyword}&order=desc&sort=popular
```

---

## 过滤与分页

### 时间范围过滤
```
?fromdate=1700000000&todate=1730000000
```
（使用 Unix 时间戳）

### 分页
```
?page=2&pagesize=100
```
最大 `pagesize` 为 100。

### 字段过滤（减少响应体积）
```
?filter=default
```
可在文档中创建自定义 filter 只返回需要的字段。

---

## 响应结构

```json
{
  "items": [
    {
      "question_id": 11227809,
      "title": "Why is processing a sorted array faster than an unsorted array?",
      "tags": ["java", "c++", "performance", "cpu-architecture"],
      "view_count": 27000000,
      "answer_count": 27,
      "score": 27000,
      "creation_date": 1341690113,
      "link": "https://stackoverflow.com/questions/11227809/..."
    }
  ],
  "has_more": true,
  "quota_max": 10000,
  "quota_remaining": 9843
}
```

---

## Python 快速上手

### 获取 AI/ML 相关热门标签问题
```python
import requests
import time

API_KEY = "YOUR_KEY"
BASE_URL = "https://api.stackexchange.com/2.3"

def get_questions_by_tag(tag, pages=3):
    results = []
    for page in range(1, pages + 1):
        resp = requests.get(f"{BASE_URL}/questions", params={
            "site": "stackoverflow",
            "tagged": tag,
            "sort": "votes",
            "order": "desc",
            "pagesize": 100,
            "page": page,
            "key": API_KEY
        })
        data = resp.json()
        results.extend(data["items"])
        
        # 遵守 backoff
        if "backoff" in data:
            time.sleep(data["backoff"])
        
        if not data["has_more"]:
            break
    return results

questions = get_questions_by_tag("llm")
for q in questions[:10]:
    print(q["title"], q["score"], q["view_count"])
```

### 分析标签热度趋势
```python
import requests

tags_to_check = ["pytorch", "langchain", "openai-api", "llm", "transformers", "rag"]

for tag in tags_to_check:
    resp = requests.get(
        f"https://api.stackexchange.com/2.3/tags/{tag}/info",
        params={"site": "stackoverflow", "key": API_KEY}
    )
    info = resp.json()["items"]
    if info:
        t = info[0]
        print(f"{tag}: {t['count']} questions")
```

---

## 多站点支持

除了 `stackoverflow`，还可以查询：

| site 值 | 说明 |
|-|-|
| `stackoverflow` | 主站，最大量 |
| `datascience` | 数据科学 |
| `ai` | 人工智能 |
| `stats` | 统计学（Cross Validated） |
| `cstheory` | 计算机理论 |

---

## 项目用途建议

- **技能热度排行**：统计 AI 相关标签（`pytorch`, `langchain`, `openai-api`）的问题数量和增长趋势
- **问题类型分析**：分析高投票问题，了解开发者常见难点
- **新兴技术信号**：监控 `newest` 排序下新标签的出现速度
- **招聘技能映射**：结合求职分析，对比"开发者在学什么"与"招聘要求什么"

---

## 参考链接

- [Stack Exchange API 官方文档](https://api.stackexchange.com/docs)
- [Stack Apps 注册应用](https://stackapps.com/apps/oauth/register)
- [API Essential Guide](https://rollout.com/integration-guides/stack-exchange/api-essentials)
