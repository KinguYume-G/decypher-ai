# FRED API（Federal Reserve Economic Data）

**官方文档**: https://fred.stlouisfed.org/docs/api/fred/  
**API Key 申请**: https://fred.stlouisfed.org/docs/api/api_key.html  
**模块用途**: 股市 / 宏观经济（美联储经济数据，支持投资决策和市场分析）

---

## 概览

FRED 是美联储圣路易斯分行维护的经济数据库，包含超过 800,000 个经济时序数据系列，涵盖 GDP、通胀（CPI）、利率、就业、科技行业就业、风险投资等指标。免费，权威。

> ℹ️ **2025 年 11 月**：FRED 推出 API v2，采用 Bearer Token 认证（向后兼容 v1 的 URL 参数方式）。

---

## 认证（Authentication）

### 获取 API Key
1. 注册 FRED 账户：https://fred.stlouisfed.org/
2. 登录后前往：https://fred.stlouisfed.org/docs/api/api_key.html
3. 申请免费 API Key（32 位小写字母数字字符串）

### 使用方式（v1 方式，仍可用）
URL 参数中加入：
```
?api_key=YOUR_API_KEY&file_type=json
```

### 使用方式（v2 方式，推荐）
请求头：
```http
Authorization: Bearer YOUR_API_KEY
```

---

## 速率限制

无明确公开速率限制，合理使用即可。

---

## Base URLs

| 版本 | Base URL |
|-|-|
| v1 | `https://api.stlouisfed.org/fred/` |
| v2 | `https://api.stlouisfed.org/fred/` （同，认证方式不同） |

---

## 核心 Endpoints

所有请求加 `&file_type=json` 返回 JSON 格式。

### 获取数据序列观测值（核心端点）
```
GET /series/observations?series_id={ID}&observation_start={date}&observation_end={date}
```

示例：获取 CPI 数据
```
GET https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&file_type=json&api_key=YOUR_KEY
```

### 获取序列元数据
```
GET /series?series_id={ID}
```

### 搜索数据序列
```
GET /series/search?search_text={keyword}&limit=20
```

示例：搜索 AI/科技相关序列
```
GET https://api.stlouisfed.org/fred/series/search?search_text=information+technology+employment&file_type=json&api_key=YOUR_KEY
```

### 获取分类下的序列
```
GET /category/series?category_id={ID}&limit=100
```

### 获取最近更新的序列
```
GET /series/updates?filter_value={category}
```

---

## 常用数据序列 ID

### 宏观经济

| Series ID | 说明 | 频率 |
|-|-|-|
| `GDPC1` | 实际 GDP（季度调整） | 季度 |
| `CPIAUCSL` | CPI（通货膨胀） | 月度 |
| `FEDFUNDS` | 联邦基金利率 | 月度 |
| `UNRATE` | 失业率 | 月度 |
| `DFF` | 联邦基金有效利率（日度） | 日度 |
| `T10Y2Y` | 10 年-2 年国债收益率利差 | 日度 |

### 科技 / AI 相关

| Series ID | 说明 | 频率 |
|-|-|-|
| `CES5000000001` | 信息业就业人数 | 月度 |
| `QUSFLEIS` | 科技创业公司数量 | 季度 |
| `NETEXP` | 净出口（含科技产品） | 季度 |
| `DSPIC96` | 实际个人可支配收入 | 月度 |

### 金融市场

| Series ID | 说明 | 频率 |
|-|-|-|
| `SP500` | S&P 500 指数 | 日度 |
| `NASDAQCOM` | NASDAQ 综合指数 | 日度 |
| `VIXCLS` | VIX 恐慌指数 | 日度 |
| `DGS10` | 10 年期美债收益率 | 日度 |
| `DCOILWTICO` | WTI 原油价格 | 日度 |

---

## 响应结构

```json
{
  "realtime_start": "2024-05-30",
  "realtime_end": "2024-05-30",
  "observation_start": "1776-07-04",
  "observation_end": "9999-12-31",
  "units": "Percent",
  "output_type": 1,
  "observations": [
    {"date": "2024-01-01", "value": "5.33"},
    {"date": "2024-02-01", "value": "5.33"},
    {"date": "2024-03-01", "value": "5.33"}
  ]
}
```

---

## Python 快速上手

### 基本用法
```python
import requests
import time

API_KEY = "YOUR_FRED_KEY"
BASE = "https://api.stlouisfed.org/fred"

def get_series(series_id: str, start: str = None, end: str = None, frequency: str = None) -> list:
    """
    start/end: 'YYYY-MM-DD' 格式
    frequency: 'd'(日), 'w'(周), 'm'(月), 'q'(季), 'a'(年)
    """
    params = {
        "series_id": series_id,
        "file_type": "json",
        "api_key": API_KEY
    }
    if start:
        params["observation_start"] = start
    if end:
        params["observation_end"] = end
    if frequency:
        params["frequency"] = frequency
    
    resp = requests.get(f"{BASE}/series/observations", params=params)
    time.sleep(0.5)
    return resp.json()["observations"]

# 获取最近 5 年 NASDAQ 指数
nasdaq = get_series("NASDAQCOM", start="2020-01-01")
for obs in nasdaq[-10:]:
    print(f"{obs['date']}: {obs['value']}")
```

### 使用 fredapi Python 库
```bash
pip install fredapi
```

```python
from fredapi import Fred

fred = Fred(api_key="YOUR_FRED_KEY")

# 直接获取 pandas Series
import pandas as pd

sp500 = fred.get_series("SP500", observation_start="2020-01-01")
fed_rate = fred.get_series("FEDFUNDS", observation_start="2020-01-01")
nasdaq = fred.get_series("NASDAQCOM", observation_start="2020-01-01")

print(sp500.tail())
print(f"\n当前联邦基金利率: {fed_rate.iloc[-1]:.2f}%")
print(f"NASDAQ 最新值: {nasdaq.iloc[-1]:,.0f}")
```

### 多序列批量获取
```python
from fredapi import Fred
import pandas as pd

fred = Fred(api_key="YOUR_FRED_KEY")

# AI 投资相关宏观指标组合
indicators = {
    "SP500": "S&P 500",
    "NASDAQCOM": "NASDAQ",
    "FEDFUNDS": "Fed Funds Rate",
    "CPIAUCSL": "CPI",
    "UNRATE": "Unemployment",
    "VIXCLS": "VIX"
}

df = pd.DataFrame()
for series_id, name in indicators.items():
    series = fred.get_series(series_id, observation_start="2022-01-01")
    df[name] = series

# 月度重采样（统一频率）
df_monthly = df.resample("M").last()
print(df_monthly.tail(6))
```

### 搜索特定主题的数据序列
```python
def search_series(keyword: str, limit: int = 20) -> list:
    resp = requests.get(f"{BASE}/series/search", params={
        "search_text": keyword,
        "limit": limit,
        "file_type": "json",
        "api_key": API_KEY,
        "order_by": "popularity",
        "sort_order": "desc"
    })
    return resp.json()["seriess"]

# 找科技就业相关序列
results = search_series("technology employment", limit=10)
for s in results:
    print(f"{s['id']:20s} | {s['title'][:50]} | {s['frequency_short']} | Popularity: {s['popularity']}")
```

---

## 项目用途建议

- **宏观背景**：结合利率（FEDFUNDS）、CPI、GDP 分析 AI 投资的宏观环境
- **市场指数**：追踪 NASDAQ、S&P 500 与 AI 股票的关联
- **科技就业**：用信息业就业数据（`CES5000000001`）验证 AI 对就业的影响
- **风险指标**：VIX 恐慌指数 + 利差（T10Y2Y）监测市场风险情绪
- **历史回测**：FRED 数据历史最长可到 1776 年，适合长期趋势研究

---

## 参考链接

- [FRED API 官方文档](https://fred.stlouisfed.org/docs/api/fred/)
- [API Key 申请](https://fred.stlouisfed.org/docs/api/api_key.html)
- [fredapi Python 库](https://github.com/mortada/fredapi)
- [FRED 序列搜索](https://fred.stlouisfed.org/tags/series)
