# API Research Index

项目数据源文档汇总，共 18 个 API。

## 原始 8 个 API

| # | 文件 | API | 模块 | 认证 | 免费 |
|-|-|-|-|-|-|
| 1 | [01_github_rest_api.md](./01_github_rest_api.md) | GitHub REST API | 创业机会 / 技术趋势 | PAT Token | ✅ |
| 2 | [02_hackernews_api.md](./02_hackernews_api.md) | Hacker News API | 商业市场 / 创业机会 | 无需 | ✅ |
| 3 | [03_arxiv_api.md](./03_arxiv_api.md) | arXiv API | 学术研究 | 无需 | ✅ |
| 4 | [04_openalex_api.md](./04_openalex_api.md) | OpenAlex API | 学术研究 | API Key（2026.2 起必须） | ✅ |
| 5 | [05_stackexchange_api.md](./05_stackexchange_api.md) | Stack Exchange API | 求职热点 | API Key（可选，推荐） | ✅ |
| 6 | [06_producthunt_api.md](./06_producthunt_api.md) | Product Hunt API | 创业机会 | OAuth 2.0 Bearer Token | ✅ |
| 7 | [07_sec_edgar_api.md](./07_sec_edgar_api.md) | SEC EDGAR API | 股市 / 公司研究 | 无需（需 User-Agent 头） | ✅ |
| 8 | [08_company_blog_rss.md](./08_company_blog_rss.md) | 公司官方 Blog / RSS | 商业市场 / 竞争情报 | 无需 | ✅ |

## 新增 10 个 API

| # | 文件 | API | 模块 | 认证 | 免费 |
|-|-|-|-|-|-|
| 9 | [09_semantic_scholar_api.md](./09_semantic_scholar_api.md) | Semantic Scholar API | 学术研究 | API Key（可选，推荐） | ✅ |
| 10 | [10_crossref_api.md](./10_crossref_api.md) | Crossref API | 学术研究 | 无需（mailto 推荐） | ✅ |
| 11 | [11_paperswithcode_api.md](./11_paperswithcode_api.md) | Papers with Code API | 学术研究 / 技术落地 | 无需（读取） | ✅ |
| 12 | [12_npm_registry_api.md](./12_npm_registry_api.md) | npm Registry API | 技术趋势（JS 生态） | 无需 | ✅ |
| 13 | [13_pypistats_api.md](./13_pypistats_api.md) | PyPI Stats API | 技术趋势（Python 生态） | 无需 | ✅ |
| 14 | [14_libraries_io_api.md](./14_libraries_io_api.md) | Libraries.io API | 技术趋势（跨语言） | API Key（必须） | ✅ |
| 15 | [15_gdelt_api.md](./15_gdelt_api.md) | GDELT API | 商业市场 / 竞争情报 | 无需 | ✅ |
| 16 | [16_reddit_api.md](./16_reddit_api.md) | Reddit API | 社区讨论 / 产品反馈 | OAuth 2.0 | ✅ |
| 17 | [17_fred_api.md](./17_fred_api.md) | FRED API | 宏观经济 / 股市 | API Key（必须） | ✅ |
| 18 | [18_uspto_patent_api.md](./18_uspto_patent_api.md) | USPTO Patent API | 技术创新 / 竞争情报 | API Key / 无需（PatentsView） | ✅ |

---

## 完整速率限制对比

| API | 速率限制 | 数据格式 | 最适合 |
|-|-|-|-|
| GitHub | 5,000 req/hr（认证） | JSON | 仓库趋势、Star 数 |
| Hacker News | 无限制 | JSON | 产品讨论、创业信号 |
| arXiv | 1 req/3s | Atom XML | AI 论文搜索 |
| OpenAlex | Credit-based | JSON | 引用数、机构排名 |
| Stack Exchange | 10,000 req/day | JSON | 技能热度 |
| Product Hunt | 未公开 | GraphQL JSON | 新产品发现 |
| SEC EDGAR | 10 req/s | JSON | 财报、研发支出 |
| RSS Feeds | 无限制 | XML | 公司动态 |
| Semantic Scholar | 10 req/s（认证） | JSON | AI 论文引用网络 |
| Crossref | 无限制（polite pool） | JSON | DOI 元数据、引用数 |
| Papers with Code | 无限制（合理） | JSON | 论文+代码关联、SOTA |
| npm Registry | 无限制 | JSON | JS 包下载趋势 |
| PyPI Stats | IP 限速 | JSON | Python 包下载趋势 |
| Libraries.io | 60 req/min | JSON | 跨语言包依赖分析 |
| GDELT | 无限制 | JSON | 全球新闻舆情 |
| Reddit | ~100 req/min（OAuth） | JSON | 社区讨论、情感分析 |
| FRED | 无限制 | JSON | 宏观经济数据 |
| USPTO/PatentsView | 合理使用 | JSON | AI 专利趋势 |

---

## 需要提前准备的 Credentials

| API | 需要申请 | 链接 |
|-|-|-|
| GitHub | Personal Access Token | https://github.com/settings/tokens |
| OpenAlex | API Key（2026 起必须） | https://openalex.org |
| Stack Exchange | API Key（推荐） | https://stackapps.com/apps/oauth/register |
| Product Hunt | OAuth App | https://www.producthunt.com/v2/oauth/applications |
| Semantic Scholar | API Key（推荐） | https://www.semanticscholar.org/product/api |
| Libraries.io | API Key（必须） | https://libraries.io/ |
| Reddit | OAuth App | https://www.reddit.com/prefs/apps |
| FRED | API Key（必须） | https://fred.stlouisfed.org/docs/api/api_key.html |
| USPTO ODP | API Key | https://developer.uspto.gov/ |
