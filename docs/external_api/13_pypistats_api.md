# PyPI Stats API

**官方文档**: https://pypistats.org/api/  
**备用文档**: https://pypistats.dev/api  
**模块用途**: 技术趋势（Python 包下载量，直接反映 AI 库如 torch、transformers 的采用速度）

---

## 概览

PyPI Stats 提供 Python 包的下载统计数据，每日更新，免费无需认证。是追踪 AI/ML Python 生态库增长趋势的核心数据源。

**数据特点**：
- 时序数据保留最近 **180 天**
- 每日更新一次
- 支持按 Python 版本、操作系统、安装来源细分

---

## 认证

**无需 API Key，完全免费。** 直接 HTTP GET，但有 IP 限速。

---

## 速率限制

IP 级别限速，具体数值未公开。建议请求间隔 ≥ 1 秒。

---

## Base URL

```
https://pypistats.org/api/
```

---

## Endpoints

### 1. 近期下载量（Recent）
```
GET /packages/{package}/recent
```

返回最近 1 天、7 天、30 天的聚合下载量。

示例：
```
GET https://pypistats.org/api/packages/torch/recent
```

返回：
```json
{
  "data": {
    "last_day": 1823456,
    "last_week": 12034567,
    "last_month": 48234901
  },
  "package": "torch",
  "type": "recent_downloads"
}
```

### 2. 总体下载量时序（Overall）
```
GET /packages/{package}/overall?mirrors={true|false}
```

- `mirrors=true`：包含镜像站下载（默认）
- `mirrors=false`：仅计算真实用户下载（更准确）

返回每日下载量数组（最近 180 天）。

### 3. 按 Python 版本细分
```
GET /packages/{package}/python_major
GET /packages/{package}/python_minor
```

了解用户在用 Python 3.10 还是 3.12 等。

### 4. 按操作系统细分
```
GET /packages/{package}/system
```

返回 Windows、Linux、macOS 的下载量分布。

---

## 响应结构（Overall）

```json
{
  "data": [
    {
      "category": "without_mirrors",
      "date": "2024-05-01",
      "downloads": 1823456
    },
    {
      "category": "without_mirrors",
      "date": "2024-05-02",
      "downloads": 1789234
    }
  ],
  "package": "torch",
  "type": "overall_downloads"
}
```

---

## Python 快速上手

### 基本用法
```python
import requests
import time

BASE = "https://pypistats.org/api"

def get_recent(package: str) -> dict:
    resp = requests.get(f"{BASE}/packages/{package}/recent")
    time.sleep(1)
    return resp.json()["data"]

def get_daily_downloads(package: str, mirrors: bool = False) -> list:
    """获取最近 180 天每日下载量"""
    resp = requests.get(
        f"{BASE}/packages/{package}/overall",
        params={"mirrors": str(mirrors).lower()}
    )
    time.sleep(1)
    data = resp.json()["data"]
    # 过滤掉 with_mirrors，只保留 without_mirrors
    return [d for d in data if d["category"] == "without_mirrors"]

# 对比主要 AI 库
ai_libs = ["torch", "transformers", "openai", "anthropic", "langchain", "llama-index"]

print("=== 近 30 天下载量 ===")
results = []
for lib in ai_libs:
    recent = get_recent(lib)
    results.append((lib, recent["last_month"]))

results.sort(key=lambda x: x[1], reverse=True)
for lib, count in results:
    print(f"{lib:20s}: {count:>15,}")
```

### 使用 pypistats 命令行工具
```bash
pip install pypistats

# 命令行直接查询
pypistats recent torch
pypistats overall transformers --mirrors false

# 输出 JSON
pypistats recent openai --format json

# 输出 Markdown 表格
pypistats python_minor torch --format markdown
```

### 获取时序数据并绘图
```python
import requests
import time
from collections import defaultdict

def compare_growth(packages: list) -> dict:
    """比较多个包的每日下载量趋势"""
    trends = {}
    for pkg in packages:
        resp = requests.get(
            f"https://pypistats.org/api/packages/{pkg}/overall",
            params={"mirrors": "false"}
        )
        daily = resp.json()["data"]
        trends[pkg] = {
            d["date"]: d["downloads"]
            for d in daily
            if d["category"] == "without_mirrors"
        }
        time.sleep(1)
    return trends

trends = compare_growth(["torch", "tensorflow", "jax"])

# 找共同日期
common_dates = sorted(
    set(trends["torch"]) & set(trends["tensorflow"]) & set(trends["jax"])
)

print(f"{'Date':<12} {'torch':>12} {'tensorflow':>12} {'jax':>10}")
for d in common_dates[-14:]:  # 最近 14 天
    print(f"{d:<12} {trends['torch'].get(d,0):>12,} {trends['tensorflow'].get(d,0):>12,} {trends['jax'].get(d,0):>10,}")
```

### 按 Python 版本分析
```python
def get_python_version_breakdown(package: str) -> dict:
    resp = requests.get(
        f"https://pypistats.org/api/packages/{package}/python_minor"
    )
    time.sleep(1)
    data = resp.json()["data"]
    
    # 聚合各版本总下载量
    version_totals = defaultdict(int)
    for entry in data:
        version_totals[entry["category"]] += entry["downloads"]
    
    return dict(sorted(version_totals.items(), key=lambda x: x[1], reverse=True))

breakdown = get_python_version_breakdown("torch")
for version, count in list(breakdown.items())[:10]:
    print(f"Python {version}: {count:,}")
```

---

## 关键 AI/ML Python 包列表

| 包名 | 说明 |
|-|-|
| `torch` | PyTorch |
| `tensorflow` | TensorFlow |
| `transformers` | Hugging Face Transformers |
| `openai` | OpenAI Python SDK |
| `anthropic` | Anthropic Python SDK |
| `langchain` | LangChain |
| `llama-index` | LlamaIndex（RAG 框架） |
| `sentence-transformers` | 句向量 |
| `chromadb` | 向量数据库 |
| `faiss-cpu` | Meta FAISS |
| `accelerate` | 分布式训练 |
| `peft` | 参数高效微调 |
| `trl` | RLHF 训练 |
| `datasets` | Hugging Face Datasets |
| `diffusers` | 扩散模型 |
| `jax` | JAX（Google） |

---

## 注意事项

- 数据仅保留 **180 天**，需要自行存档历史数据
- 每日更新，通常延迟 24-48 小时
- 下载量包含 CI/CD 自动安装，绝对数值偏大，但趋势对比可靠
- 与 npm 的 `without_mirrors` 类似，建议使用 `mirrors=false` 获取更真实数据

---

## 参考链接

- [PyPI Stats API 官方文档](https://pypistats.org/api/)
- [pypistats Python 库 GitHub](https://github.com/hugovk/pypistats)
- [PyPI 官方统计页面](https://pypi.org/stats/)
- [pepy.tech（另一个下载统计工具）](https://pepy.tech/)
