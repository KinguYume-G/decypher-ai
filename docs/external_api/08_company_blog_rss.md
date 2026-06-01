# 公司官方 Blog / RSS

**模块用途**: 商业市场 / 竞争情报（公司产品发布和动态）

---

## 概览

RSS（Really Simple Syndication）是各大科技公司和 AI 实验室发布内容的标准格式。通过抓取 RSS Feed，可以实时获取产品发布、技术更新、公司动态等信息，无需爬虫，延迟极低。

**优势**：
- 无需 API Key，免费
- 结构化数据（XML），易于解析
- 几乎所有主流公司博客都支持
- 实时更新，延迟低

---

## 认证

**通常无需认证**，直接 HTTP GET 即可。部分付费内容会限制 RSS 全文。

---

## 主要 AI 公司 RSS Feed

### AI 研究机构

| 公司/机构 | RSS URL |
|-|-|
| OpenAI Blog | `https://openai.com/blog/rss.xml` |
| Anthropic Blog | `https://www.anthropic.com/rss.xml` |
| Google DeepMind | `https://deepmind.google/blog/rss.xml` |
| Google AI Blog | `https://blog.research.google/feeds/posts/default` |
| Meta AI | `https://ai.meta.com/blog/rss/` |
| Microsoft Research | `https://www.microsoft.com/en-us/research/feed/` |
| Hugging Face Blog | `https://huggingface.co/blog/feed.xml` |
| Mistral AI | `https://mistral.ai/feed` |
| Cohere Blog | `https://cohere.com/blog/rss` |

### 大型科技公司

| 公司 | RSS URL |
|-|-|
| AWS Blog | `https://aws.amazon.com/blogs/aws/feed/` |
| AWS Machine Learning | `https://aws.amazon.com/blogs/machine-learning/feed/` |
| Google Cloud Blog | `https://cloud.google.com/feeds/gcp-news-rss.xml` |
| Azure Blog | `https://azure.microsoft.com/en-us/blog/feed/` |
| NVIDIA Blog | `https://blogs.nvidia.com/feed/` |
| Apple ML Research | `https://machinelearning.apple.com/rss.xml` |

### 科技媒体与新闻

| 来源 | RSS URL |
|-|-|
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` |
| TechCrunch 全站 | `https://techcrunch.com/feed/` |
| The Verge | `https://www.theverge.com/rss/index.xml` |
| Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` |
| Wired AI | `https://www.wired.com/feed/tag/artificial-intelligence/rss` |
| MIT Technology Review | `https://www.technologyreview.com/feed/` |
| VentureBeat AI | `https://venturebeat.com/category/ai/feed/` |

### 创投 / 创业

| 来源 | RSS URL |
|-|-|
| Y Combinator Blog | `https://www.ycombinator.com/blog/rss` |
| a16z Blog | `https://a16z.com/feed/` |
| Sequoia Capital | `https://www.sequoiacap.com/feed/` |

---

## RSS Feed 结构

标准 RSS 2.0 格式：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>OpenAI Blog</title>
    <link>https://openai.com/blog</link>
    <description>Latest from OpenAI</description>
    <item>
      <title>GPT-5 Technical Report</title>
      <link>https://openai.com/blog/gpt-5</link>
      <description>Summary of the post...</description>
      <pubDate>Mon, 01 Jan 2025 12:00:00 GMT</pubDate>
      <guid>https://openai.com/blog/gpt-5</guid>
    </item>
  </channel>
</rss>
```

关键字段：`title`、`link`、`description`（摘要）、`pubDate`、`guid`

---

## Python 快速上手

### 方法一：feedparser 库（推荐）

```bash
pip install feedparser
```

```python
import feedparser
from datetime import datetime

def fetch_rss(url: str, max_items: int = 20) -> list:
    feed = feedparser.parse(url)
    items = []
    for entry in feed.entries[:max_items]:
        items.append({
            "title": entry.get("title", ""),
            "link": entry.get("link", ""),
            "summary": entry.get("summary", "")[:300],
            "published": entry.get("published", ""),
            "source": feed.feed.get("title", url)
        })
    return items

# 示例：抓取多个 AI 公司博客
feeds = {
    "OpenAI": "https://openai.com/blog/rss.xml",
    "Anthropic": "https://www.anthropic.com/rss.xml",
    "Hugging Face": "https://huggingface.co/blog/feed.xml",
    "Google DeepMind": "https://deepmind.google/blog/rss.xml",
}

all_posts = []
for company, url in feeds.items():
    try:
        posts = fetch_rss(url, max_items=5)
        all_posts.extend(posts)
        print(f"✓ {company}: {len(posts)} posts")
    except Exception as e:
        print(f"✗ {company}: {e}")

# 按发布时间排序
all_posts.sort(key=lambda x: x["published"], reverse=True)

for post in all_posts[:10]:
    print(f"[{post['source']}] {post['title']}")
    print(f"  {post['link']}")
    print()
```

### 方法二：requests + xml.etree 解析

```python
import requests
import xml.etree.ElementTree as ET

def parse_rss(url: str) -> list:
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers, timeout=10)
    root = ET.fromstring(resp.content)
    
    channel = root.find("channel")
    items = []
    for item in channel.findall("item"):
        items.append({
            "title": item.findtext("title", ""),
            "link": item.findtext("link", ""),
            "description": item.findtext("description", "")[:200],
            "pubDate": item.findtext("pubDate", "")
        })
    return items
```

### 方法三：并发抓取多个 Feed

```python
import feedparser
import concurrent.futures
import time

FEEDS = {
    "OpenAI": "https://openai.com/blog/rss.xml",
    "Anthropic": "https://www.anthropic.com/rss.xml",
    "AWS ML": "https://aws.amazon.com/blogs/machine-learning/feed/",
    "Hugging Face": "https://huggingface.co/blog/feed.xml",
    "NVIDIA": "https://blogs.nvidia.com/feed/",
    "TechCrunch AI": "https://techcrunch.com/category/artificial-intelligence/feed/",
    "VentureBeat AI": "https://venturebeat.com/category/ai/feed/",
}

def fetch_one(name_url):
    name, url = name_url
    try:
        feed = feedparser.parse(url)
        return [{
            "source": name,
            "title": e.get("title", ""),
            "link": e.get("link", ""),
            "published": e.get("published", ""),
            "summary": e.get("summary", "")[:200],
        } for e in feed.entries[:10]]
    except:
        return []

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(fetch_one, FEEDS.items()))

all_items = [item for sublist in results for item in sublist]
print(f"Total items fetched: {len(all_items)}")
```

---

## 动态生成 RSS 的工具

如果目标网站没有 RSS，可以用以下服务生成：

| 工具 | 说明 |
|-|-|
| [RSS.app](https://rss.app) | 从任意网页生成 RSS，有 API |
| [FetchRSS](https://fetchrss.com) | 从无 RSS 的网站生成 |
| [RSSHub](https://rsshub.app) | 开源，支持数百个平台 |
| [Inoreader](https://inoreader.com) | 可将爬取结果导出为 RSS |

### RSSHub 支持的 AI 相关平台

```
# GitHub Trending（今日热门仓库）
https://rsshub.app/github/trending/daily/python

# Hacker News 热门
https://rsshub.app/hackernews

# Product Hunt 今日热门
https://rsshub.app/producthunt/today

# arXiv 最新论文
https://rsshub.app/arxiv/search/cs.AI
```

---

## 内容处理建议

### 去重
RSS 条目使用 `guid` 或 `link` 作为唯一 ID，存入数据库前先查重：
```python
seen_links = set()
unique_posts = []
for post in all_items:
    if post["link"] not in seen_links:
        seen_links.add(post["link"])
        unique_posts.append(post)
```

### 全文提取
RSS 摘要有时不包含全文，需要进一步抓取：
```python
from newspaper import Article  # pip install newspaper3k

def get_full_text(url: str) -> str:
    article = Article(url)
    article.download()
    article.parse()
    return article.text
```

---

## 项目用途建议

- **产品发布监控**：订阅 OpenAI、Anthropic、Google 等博客，第一时间获取新模型/产品发布
- **竞争情报**：对比各 AI 公司的发布节奏和产品方向
- **内容聚合**：将多个来源统一到一个数据库，支持关键词过滤和分类
- **定期更新**：结合定时任务（每小时/每天）自动抓取更新内容

---

## 参考链接

- [feedparser 文档](https://feedparser.readthedocs.io/)
- [RSSHub 开源项目](https://github.com/DIYgod/RSSHub)
- [RSS.app API 文档](https://rss.app/docs/api/feeds)
- [2026 最佳科技 RSS Feed 列表](https://daige.st/en/blog/best-tech-rss-feeds-2026)
