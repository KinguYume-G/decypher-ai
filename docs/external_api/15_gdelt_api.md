# GDELT API

**官方网站**: https://www.gdeltproject.org/  
**DOC 2.0 API 介绍**: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/  
**模块用途**: 商业市场 / 竞争情报（全球新闻全文搜索，情感分析，事件追踪）

---

## 概览

GDELT（Global Database of Events, Language, and Tone）是全球最大的开放新闻事件数据库之一，每 15 分钟更新一次，覆盖全球 100 多种语言的新闻媒体。提供全文搜索、情感分析、时间线、地理分布等多种分析维度。

**三个主要 API**：
| API | 用途 |
|-|-|
| DOC 2.0 API | 全文搜索新闻文章，生成时间线/词云/情感分析 |
| GEO 2.0 API | 地理维度新闻分析 |
| TV 2.0 API | 美国电视新闻分析（CNN、Fox、MSNBC 等） |

---

## 认证

**无需认证，无需 API Key，完全免费。**

---

## 速率限制

无明确速率限制，但建议不要频繁高并发请求。

---

## DOC 2.0 API

**Base URL**:
```
https://api.gdeltproject.org/api/v2/doc/doc
```

### 核心参数

| 参数 | 说明 | 示例 |
|-|-|-|
| `query` | 搜索关键词（支持引号精确搜索） | `"artificial intelligence"` |
| `mode` | 返回模式（见下表） | `ArtList` |
| `maxrecords` | 返回文章数（ArtList 模式，最大 250） | `50` |
| `startdatetime` | 起始时间（格式：YYYYMMDDHHmmss） | `20240101000000` |
| `enddatetime` | 截止时间 | `20241231235959` |
| `timespan` | 相对时间跨度 | `1month`、`2weeks`、`24h` |
| `sourcelang` | 新闻语言 | `english`、`chinese` |
| `sourcecountry` | 新闻来源国 | `US`、`CN`、`GB` |
| `domain` | 限定特定域名 | `techcrunch.com` |
| `format` | 返回格式 | `json`（默认）、`csv`、`html` |

### Mode 说明

| mode | 返回内容 |
|-|-|
| `ArtList` | 文章列表（标题、URL、时间、情感分数） |
| `TimelineVol` | 关键词提及量时间线 |
| `TimelineVolRaw` | 原始文章数量时间线 |
| `TimelineTone` | 情感倾向时间线（正面/负面） |
| `TimelineLang` | 多语言提及量时间线 |
| `TimelineSourceCountry` | 按国家分布时间线 |
| `WordCloudImageTags` | 词云（图像标签） |
| `WordCloudEnglishTags` | 词云（英文标签） |

---

## 示例请求

### 获取最近 AI 相关新闻列表
```
GET https://api.gdeltproject.org/api/v2/doc/doc?query=artificial+intelligence+startup&mode=ArtList&maxrecords=50&sourcelang=english&format=json&timespan=1week
```

### 获取关键词提及量时间线
```
GET https://api.gdeltproject.org/api/v2/doc/doc?query="large+language+model"&mode=TimelineVol&startdatetime=20240101000000&enddatetime=20241231235959&timezoom=yes&format=json
```

### 精确短语搜索
```
GET https://api.gdeltproject.org/api/v2/doc/doc?query=%22AI+agent%22&mode=ArtList&maxrecords=100&format=json&timespan=48h
```

### 按来源国过滤
```
GET https://api.gdeltproject.org/api/v2/doc/doc?query=OpenAI&mode=TimelineSourceCountry&timespan=1month&format=json
```

---

## 响应结构（ArtList 模式）

```json
{
  "articles": [
    {
      "url": "https://techcrunch.com/...",
      "url_mobile": "",
      "title": "OpenAI announces new model",
      "seendate": "20240515T120000Z",
      "socialimage": "https://...",
      "domain": "techcrunch.com",
      "language": "English",
      "sourcecountry": "United States"
    }
  ]
}
```

### TimelineVol 响应
```json
{
  "timeline": [
    {"date": "2024-01-01T00:00:00Z", "value": 12.34},
    {"date": "2024-01-02T00:00:00Z", "value": 15.67}
  ]
}
```

---

## Python 快速上手

### 搜索新闻文章
```python
import requests
import time

BASE = "https://api.gdeltproject.org/api/v2/doc/doc"

def search_news(query: str, timespan: str = "1week", max_records: int = 50) -> list:
    resp = requests.get(BASE, params={
        "query": query,
        "mode": "ArtList",
        "maxrecords": max_records,
        "sourcelang": "english",
        "format": "json",
        "timespan": timespan
    })
    time.sleep(1)
    data = resp.json()
    return data.get("articles", [])

# 追踪 AI 创业公司新闻
articles = search_news('"AI startup" funding', timespan="1week", max_records=100)
for a in articles[:10]:
    print(f"[{a['seendate'][:8]}] {a['title']}")
    print(f"  {a['domain']} | {a['url'][:80]}")
```

### 获取关键词时间线（趋势分析）
```python
def get_timeline(query: str, start: str, end: str) -> list:
    """
    start/end 格式：'YYYYMMDDHHmmss'
    示例：'20240101000000'
    """
    resp = requests.get(BASE, params={
        "query": query,
        "mode": "TimelineVol",
        "startdatetime": start,
        "enddatetime": end,
        "timezoom": "yes",
        "format": "json"
    })
    time.sleep(1)
    return resp.json().get("timeline", [])

# 对比 "ChatGPT" vs "Claude" 的新闻提及量
chatgpt_timeline = get_timeline('"ChatGPT"', "20240101000000", "20241231235959")
claude_timeline = get_timeline('"Claude AI"', "20240101000000", "20241231235959")

print("Date         | ChatGPT | Claude")
for c, cl in zip(chatgpt_timeline[:10], claude_timeline[:10]):
    print(f"{c['date'][:10]}  | {c['value']:7.2f} | {cl['value']:6.2f}")
```

### 获取情感倾向时间线
```python
def get_sentiment_timeline(query: str, timespan: str = "1month") -> list:
    resp = requests.get(BASE, params={
        "query": query,
        "mode": "TimelineTone",
        "timespan": timespan,
        "format": "json"
    })
    time.sleep(1)
    return resp.json().get("timeline", [])

sentiment = get_sentiment_timeline("OpenAI")
for entry in sentiment[-7:]:
    tone = entry["value"]
    label = "😊 Positive" if tone > 0 else "😞 Negative"
    print(f"{entry['date'][:10]}: {tone:+.2f} {label}")
```

---

## 高级查询语法

```
# 同时包含两个词
query=OpenAI ChatGPT

# 精确短语
query="large language model"

# 排除词
query=AI -crypto

# 限定来源
query=AI domain:techcrunch.com

# 限定主题（GDELT 主题标签）
query=AI theme:TECHNOLOGY

# 情感过滤（正面 tone > 5）
query=AI&tone>5
```

---

## 注意事项

- `timespan` 最小单位为 **15 分钟**（`15min`）
- `ArtList` 模式最多返回 **250 篇文章**
- 时间线数据默认以 15 分钟为最小粒度，`timezoom=yes` 会自动按时间跨度调整粒度
- 仅覆盖 GDELT 监控的新闻媒体，不是全网

---

## 项目用途建议

- **AI 公司舆情监控**：追踪 OpenAI、Anthropic、Google AI 的新闻提及量和情感倾向
- **事件检测**：发现 AI 领域的突发新闻热点（产品发布、安全事故等）
- **竞争情报**：对比多个 AI 公司的媒体曝光度时间线
- **全球视角**：通过 `sourcecountry` 分析 AI 话题在不同国家的报道差异

---

## 参考链接

- [GDELT Project 主站](https://www.gdeltproject.org/)
- [DOC 2.0 API 发布公告](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/)
- [gdelt-doc-api Python 客户端](https://github.com/alex9smith/gdelt-doc-api)
- [GDELT Cloud 文档](https://docs.gdeltcloud.com/API_DOCUMENTATION_GUIDE)
