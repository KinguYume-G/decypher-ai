# npm Registry API

**官方文档**: https://api-docs.npmjs.com/  
**下载统计文档**: https://github.com/npm/registry/blob/main/docs/download-counts.md  
**模块用途**: 技术趋势（JS/Node 生态包下载量，反映前端和 AI 工具链热度）

---

## 概览

npm Registry API 提供两类数据：
1. **包元数据**：版本、依赖、作者、关键词等（`registry.npmjs.org`）
2. **下载统计**：每日/每周/每月下载量时序数据（`api.npmjs.org`）

对于 AI 项目，可用于追踪 `openai`、`langchain`、`@anthropic-ai/sdk`、`transformers.js` 等 JS AI 包的增长趋势。

---

## 认证

**无需认证，完全免费。** 直接 HTTP GET。

---

## 速率限制

无明确公开限制，合理使用即可。

---

## Base URLs

| 用途 | Base URL |
|-|-|
| 包元数据 | `https://registry.npmjs.org/` |
| 下载统计 | `https://api.npmjs.org/` |
| 包搜索 | `https://registry.npmjs.org/-/v1/search` |

---

## 下载统计 Endpoints

### 单包下载量（Point — 聚合单一数值）
```
GET https://api.npmjs.org/downloads/point/{period}/{package}
```

`period` 支持：
- `last-day`：昨天
- `last-week`：过去 7 天
- `last-month`：过去 30 天
- `last-year`：过去 365 天
- 自定义范围：`2024-01-01:2024-12-31`

示例：
```
GET https://api.npmjs.org/downloads/point/last-month/openai
GET https://api.npmjs.org/downloads/point/2024-01-01:2024-12-31/langchain
```

返回：
```json
{
  "downloads": 4823901,
  "start": "2024-05-01",
  "end": "2024-05-31",
  "package": "openai"
}
```

### 单包下载量（Range — 每日时序数据）
```
GET https://api.npmjs.org/downloads/range/{period}/{package}
```

示例：
```
GET https://api.npmjs.org/downloads/range/last-month/openai
```

返回：
```json
{
  "downloads": [
    {"day": "2024-05-01", "downloads": 162345},
    {"day": "2024-05-02", "downloads": 158900},
    ...
  ],
  "package": "openai"
}
```

### 批量查询多个包（最多 128 个）
```
GET https://api.npmjs.org/downloads/point/last-month/{pkg1},{pkg2},{pkg3}
```

示例：
```
GET https://api.npmjs.org/downloads/point/last-month/openai,langchain,@anthropic-ai/sdk
```

返回一个以包名为 key 的对象：
```json
{
  "openai": {"downloads": 4823901, ...},
  "langchain": {"downloads": 1234567, ...}
}
```

> **注意**：Range 接口不支持批量查询，需要逐包请求

---

## 包元数据 Endpoints

### 获取包最新信息
```
GET https://registry.npmjs.org/{package}/latest
```

### 获取包全部版本信息
```
GET https://registry.npmjs.org/{package}
```

返回字段包括：所有版本列表、依赖、关键词、作者、GitHub 链接、发布时间等。

### 搜索包
```
GET https://registry.npmjs.org/-/v1/search?text={keyword}&size={n}
```

| 参数 | 说明 |
|-|-|
| `text` | 搜索关键词 |
| `size` | 返回数量（最大 250） |
| `from` | 偏移量（分页） |
| `quality` | 质量权重（0-1） |
| `popularity` | 流行度权重（0-1） |
| `maintenance` | 维护活跃度权重（0-1） |

示例：搜索 AI 相关包（按流行度排序）
```
GET https://registry.npmjs.org/-/v1/search?text=ai+llm&size=20&popularity=1.0
```

---

## Python 快速上手

```python
import requests
import time
from datetime import date, timedelta

def get_downloads_point(package: str, period: str = "last-month") -> int:
    resp = requests.get(
        f"https://api.npmjs.org/downloads/point/{period}/{package}"
    )
    data = resp.json()
    return data.get("downloads", 0)

def get_downloads_range(package: str, period: str = "last-month") -> list:
    resp = requests.get(
        f"https://api.npmjs.org/downloads/range/{period}/{package}"
    )
    return resp.json().get("downloads", [])

def get_bulk_downloads(packages: list, period: str = "last-month") -> dict:
    """批量获取多个包的下载量（最多 128 个）"""
    pkg_str = ",".join(packages[:128])
    resp = requests.get(
        f"https://api.npmjs.org/downloads/point/{period}/{pkg_str}"
    )
    data = resp.json()
    return {pkg: data.get(pkg, {}).get("downloads", 0) for pkg in packages}

# AI 相关 npm 包下载量对比
ai_packages = [
    "openai",
    "langchain",
    "@anthropic-ai/sdk",
    "@google/generative-ai",
    "transformers",
    "ollama",
    "ai"  # Vercel AI SDK
]

print("=== Last Month Downloads ===")
downloads = get_bulk_downloads(ai_packages)
sorted_pkgs = sorted(downloads.items(), key=lambda x: x[1], reverse=True)
for pkg, count in sorted_pkgs:
    print(f"{pkg:35s}: {count:>12,}")
```

### 获取时序趋势数据（绘图用）
```python
import requests

def compare_trends(packages: list, period: str = "last-month") -> dict:
    """获取多个包的每日下载量时序"""
    trends = {}
    for pkg in packages:
        data = get_downloads_range(pkg, period)
        trends[pkg] = {entry["day"]: entry["downloads"] for entry in data}
        time.sleep(0.2)
    return trends

trends = compare_trends(["openai", "langchain"], period="2024-01-01:2024-12-31")
# trends["openai"]["2024-06-15"] → 某天的下载量
```

### 获取包元数据
```python
def get_package_info(package: str) -> dict:
    resp = requests.get(f"https://registry.npmjs.org/{package}/latest")
    data = resp.json()
    return {
        "name": data.get("name"),
        "version": data.get("version"),
        "description": data.get("description"),
        "keywords": data.get("keywords", []),
        "repository": data.get("repository", {}).get("url"),
        "weekly_downloads": get_downloads_point(package, "last-week")
    }

info = get_package_info("openai")
print(info)
```

---

## 注意事项

- Range 接口最多返回 **365 天**的数据
- 批量查询（`pkg1,pkg2`）仅 Point 接口支持，Range 接口须逐包请求
- 数据每日更新一次，通常在 UTC 时间次日凌晨
- 下载量包含 CI/CD 自动安装，不代表真实用户数量，但趋势对比有效

---

## 项目用途建议

- **JS AI 生态趋势**：追踪 `openai`、`langchain`、`@anthropic-ai/sdk` 等包的月下载量增长
- **框架热度**：对比 `next`、`vite`、`astro` 等前端框架的流行度变化
- **新兴工具发现**：搜索 `llm`、`ai`、`agent` 关键词找新发布的 AI 包
- **依赖分析**：追踪某 AI 库的下游依赖包，了解生态扩展速度

---

## 参考链接

- [npm Registry API 官方文档](https://api-docs.npmjs.com/)
- [下载统计 API 文档（GitHub）](https://github.com/npm/registry/blob/main/docs/download-counts.md)
- [Registry API 完整文档（GitHub）](https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md)
