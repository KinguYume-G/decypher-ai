# SEC EDGAR API

**官方文档**: https://www.sec.gov/edgar/sec-api-documentation  
**EDGAR 主站**: https://www.sec.gov/edgar/search/  
**模块用途**: 股市 / 公司研究（官方财报，最安全）

---

## 概览

SEC EDGAR (Electronic Data Gathering, Analysis, and Retrieval) API 提供对美国上市公司所有官方申报文件的免费访问，包括 10-K（年报）、10-Q（季报）、8-K（重大事项报告）等。数据权威、免费、无需注册。

---

## 认证

**完全免费，无需 API Key，无需注册。**

唯一要求：在请求头中设置 `User-Agent`，标明身份（SEC 要求）：
```http
User-Agent: YourName your@email.com
```

---

## 速率限制

- 每秒最多 **10 次请求**（per IP）
- 无每日总限制
- 建议请求间隔 ≥ 0.1 秒

---

## Base URLs

| 用途 | Base URL |
|-|-|
| 公司申报数据 | `https://data.sec.gov/` |
| EDGAR 全文搜索 | `https://efts.sec.gov/LATEST/search-index?` |
| 文件原始内容 | `https://www.sec.gov/Archives/edgar/data/` |

---

## 核心概念：CIK

**CIK（Central Index Key）** 是 SEC 给每家公司分配的唯一数字 ID，使用 API 前需要先找到目标公司的 CIK。

### 查找 CIK 的方法

**方法一：下载公司列表**
```
GET https://www.sec.gov/files/company_tickers.json
```

返回格式：
```json
{
  "0": {"cik_str": 320193, "ticker": "AAPL", "title": "Apple Inc."},
  "1": {"cik_str": 789019, "ticker": "MSFT", "title": "MICROSOFT CORP"},
  ...
}
```

**方法二：按名称搜索**
```
GET https://www.sec.gov/cgi-bin/browse-edgar?company={name}&action=getcompany&output=atom
```

**CIK 填充零到 10 位**（API 调用时需要）：
- Apple: `0000320193`

---

## 核心 Endpoints

### 1. 获取公司申报历史（Submissions）

```
GET https://data.sec.gov/submissions/CIK{10位CIK}.json
```

示例（Apple）：
```
GET https://data.sec.gov/submissions/CIK0000320193.json
```

返回内容：公司基本信息 + 最近申报文件列表（表单类型、日期、文件链接）

### 2. 获取公司财务数据（XBRL Company Facts）

```
GET https://data.sec.gov/api/xbrl/companyfacts/CIK{10位CIK}.json
```

返回该公司所有 XBRL 标注的财务数据，涵盖收入、利润、资产等指标的历史数据。

### 3. 获取特定财务概念

```
GET https://data.sec.gov/api/xbrl/companyconcept/CIK{10位CIK}/{taxonomy}/{concept}.json
```

示例：获取 Apple 历年净收入
```
GET https://data.sec.gov/api/xbrl/companyconcept/CIK0000320193/us-gaap/NetIncomeLoss.json
```

### 4. 跨公司数据比较（Frames）

```
GET https://data.sec.gov/api/xbrl/frames/{taxonomy}/{concept}/{unit}/CY{year}.json
```

示例：获取所有公司 2023 年净收入
```
GET https://data.sec.gov/api/xbrl/frames/us-gaap/NetIncomeLoss/USD/CY2023.json
```

### 5. EDGAR 全文搜索

```
GET https://efts.sec.gov/LATEST/search-index?q={keywords}&dateRange=custom&startdt={date}&enddt={date}&forms={form_type}
```

示例：搜索提到 "artificial intelligence" 的 10-K 文件
```
GET https://efts.sec.gov/LATEST/search-index?q=%22artificial+intelligence%22&forms=10-K&dateRange=custom&startdt=2024-01-01&enddt=2024-12-31
```

---

## 常用表单类型

| 表单 | 说明 |
|-|-|
| `10-K` | 年度报告（最全面） |
| `10-Q` | 季度报告 |
| `8-K` | 重大事项即时报告（收购、CEO 变动等） |
| `DEF 14A` | 股东大会委托书（含高管薪酬） |
| `S-1` | IPO 注册申报 |
| `13F` | 机构持仓报告（对冲基金持仓） |
| `4` | 内部人员交易报告 |

---

## 常用 XBRL 财务概念

| 概念 | 说明 |
|-|-|
| `Revenues` | 营业收入 |
| `NetIncomeLoss` | 净利润/亏损 |
| `Assets` | 总资产 |
| `Liabilities` | 总负债 |
| `CashAndCashEquivalentsAtCarryingValue` | 现金及等价物 |
| `ResearchAndDevelopmentExpense` | 研发支出 |
| `OperatingIncomeLoss` | 营业利润 |
| `EarningsPerShareBasic` | 基本每股收益 |

---

## Python 快速上手

```python
import requests
import time

HEADERS = {"User-Agent": "Your Name your@email.com"}

def get_cik(ticker: str) -> str:
    """通过股票代码获取 CIK"""
    resp = requests.get(
        "https://www.sec.gov/files/company_tickers.json",
        headers=HEADERS
    )
    tickers = resp.json()
    for item in tickers.values():
        if item["ticker"].upper() == ticker.upper():
            return str(item["cik_str"]).zfill(10)
    return None

def get_submissions(cik: str) -> dict:
    """获取公司申报历史"""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    resp = requests.get(url, headers=HEADERS)
    time.sleep(0.1)
    return resp.json()

def get_financial_concept(cik: str, concept: str) -> dict:
    """获取特定财务指标历史数据"""
    url = f"https://data.sec.gov/api/xbrl/companyconcept/CIK{cik}/us-gaap/{concept}.json"
    resp = requests.get(url, headers=HEADERS)
    time.sleep(0.1)
    return resp.json()

# 示例：获取 Nvidia 的研发支出历史
cik = get_cik("NVDA")
print(f"NVDA CIK: {cik}")

rd_data = get_financial_concept(cik, "ResearchAndDevelopmentExpense")
# 找到年度数据
annual = rd_data["units"]["USD"]
for entry in annual:
    if entry.get("form") in ["10-K", "10-K/A"] and entry.get("fp") == "FY":
        print(f"{entry['end']}: ${entry['val']:,.0f}")
```

### 获取最新 8-K 文件（重大事项）
```python
def get_recent_filings(cik: str, form_type: str = "8-K", count: int = 10):
    data = get_submissions(cik)
    filings = data["filings"]["recent"]
    results = []
    
    for i, form in enumerate(filings["form"]):
        if form == form_type:
            results.append({
                "date": filings["filingDate"][i],
                "accession": filings["accessionNumber"][i],
                "document": filings["primaryDocument"][i],
            })
            if len(results) >= count:
                break
    return results

# 示例：获取 OpenAI 母公司 Microsoft 最近的 8-K
cik = get_cik("MSFT")
filings = get_recent_filings(cik, "8-K", 5)
for f in filings:
    print(f["date"], f["accession"])
```

---

## 项目用途建议

- **AI 公司财务分析**：追踪 NVDA、MSFT、GOOGL、META 等 AI 重仓公司的营收、研发支出增长
- **投资信号**：监控 8-K 文件（并购、新业务公告）和 S-1（AI 公司 IPO）
- **竞争情报**：对比多家 AI 公司研发支出（`ResearchAndDevelopmentExpense`）
- **机构持仓**：通过 13F 表单分析头部基金对 AI 股票的配置变化

---

## 参考链接

- [SEC EDGAR API 官方文档](https://www.sec.gov/edgar/sec-api-documentation)
- [SEC EDGAR API 完整指南 2026](https://tldrfiling.com/blog/sec-edgar-api-guide/)
- [免费端点指南](https://tldrfiling.com/blog/free-sec-edgar-api-guide/)
- [sec-edgar-api Python 库](https://sec-edgar-api.readthedocs.io/)
- [EDGAR 全文搜索](https://efts.sec.gov/LATEST/search-index)
