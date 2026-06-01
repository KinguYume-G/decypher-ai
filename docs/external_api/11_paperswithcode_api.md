# Papers with Code API

**官方文档**: https://paperswithcode.com/api/v1/docs/  
**Python 客户端文档**: https://paperswithcode-client.readthedocs.io/  
**模块用途**: 学术研究（AI 论文 + 代码实现直接关联，追踪技术落地）

---

## 概览

Papers with Code 是专注于机器学习领域的平台，将学术论文与其 GitHub 代码实现直接关联，并追踪各任务（Task）的 State-of-the-Art（SOTA）基准排行榜。这是追踪 AI 技术从论文到实现落地的最直接数据源。

**核心优势**：
- 论文 + 代码实现一对多关联
- SOTA 排行榜数据（各任务最优模型）
- 覆盖数千个 ML 任务（Task）和数据集（Dataset）

---

## 认证

**读取操作无需认证**，直接 GET 请求即可。  
写操作（提交论文/代码链接）需要 API Token。

---

## 速率限制

无明确公开限制，建议合理控制请求频率（每秒不超过 5 次）。

---

## Base URL

```
https://paperswithcode.com/api/v1/
```

---

## 核心 Endpoints

### 搜索论文
```
GET /papers/?q={keyword}&ordering={order}
```

| `ordering` 值 | 说明 |
|-|-|
| `-github_stars` | GitHub Star 数降序 ⭐ |
| `-arxiv_id` | 最新发布 |
| `-published` | 发布日期降序 |
| `-mentions` | 提及次数降序 |

示例：搜索 RAG 相关论文（按 Star 排序）
```
GET https://paperswithcode.com/api/v1/papers/?q=retrieval+augmented+generation&ordering=-github_stars&items_per_page=20
```

### 获取论文详情
```
GET /papers/{paper_id}/
```

### 获取论文的代码实现列表
```
GET /papers/{paper_id}/repositories/
```

### 获取任务列表（Task）
```
GET /tasks/?q={keyword}
```

示例：搜索 "text generation" 任务
```
GET https://paperswithcode.com/api/v1/tasks/?q=text+generation
```

### 获取任务的 SOTA 排行榜
```
GET /tasks/{task_id}/results/
```

### 获取数据集列表
```
GET /datasets/?q={keyword}
```

### 获取数据集上的 SOTA 结果
```
GET /datasets/{dataset_id}/results/
```

### 获取方法（Method）列表
```
GET /methods/?q={keyword}&area={area}
```

### 获取所有 Area（研究领域）
```
GET /areas/
```

---

## 响应结构

### 论文对象
```json
{
  "id": "attention-is-all-you-need",
  "arxiv_id": "1706.03762",
  "url_abs": "https://arxiv.org/abs/1706.03762",
  "url_pdf": "https://arxiv.org/pdf/1706.03762",
  "title": "Attention Is All You Need",
  "abstract": "...",
  "authors": ["Ashish Vaswani", "..."],
  "published": "2017-06-12",
  "github_stars": 95000,
  "proceeding": "NeurIPS 2017"
}
```

### 代码仓库对象
```json
{
  "url": "https://github.com/tensorflow/tensor2tensor",
  "is_official": true,
  "stars": 14000,
  "framework": "TensorFlow",
  "mentioned_in_paper": true
}
```

---

## 分页

所有列表接口返回：
```json
{
  "count": 1234,
  "next": "https://paperswithcode.com/api/v1/papers/?page=2&...",
  "previous": null,
  "results": [...]
}
```

使用 `page` 参数翻页：`?page=2&items_per_page=50`

---

## Python 快速上手

### 方法一：直接请求
```python
import requests
import time

BASE = "https://paperswithcode.com/api/v1"

def search_papers(query: str, ordering="-github_stars", n=50) -> list:
    all_results = []
    page = 1
    while len(all_results) < n:
        resp = requests.get(f"{BASE}/papers/", params={
            "q": query,
            "ordering": ordering,
            "items_per_page": min(50, n - len(all_results)),
            "page": page
        })
        data = resp.json()
        all_results.extend(data["results"])
        if not data["next"]:
            break
        page += 1
        time.sleep(0.5)
    return all_results

# 获取最热门 AI Agent 论文
papers = search_papers("LLM agent", ordering="-github_stars", n=20)
for p in papers:
    print(f"⭐{p['github_stars']:,} | {p['title']} ({p['published'][:4]})")
    print(f"  arXiv: {p['arxiv_id']}")
```

### 获取论文代码实现
```python
def get_repos(paper_id: str) -> list:
    resp = requests.get(f"{BASE}/papers/{paper_id}/repositories/")
    return resp.json()["results"]

repos = get_repos("attention-is-all-you-need")
for repo in repos:
    official = "✅ Official" if repo["is_official"] else "Community"
    print(f"{official} | ⭐{repo['stars']:,} | {repo['url']}")
    print(f"  Framework: {repo.get('framework', 'N/A')}")
```

### 方法二：使用官方 Python 客户端
```bash
pip install paperswithcode-client
```

```python
from paperswithcode import PapersWithCodeClient

client = PapersWithCodeClient()  # 读取不需要 token

# 搜索论文
papers = client.paper_list(q="multimodal large language model")
for paper in papers.results:
    print(paper.title, paper.github_stars)

# 获取论文代码实现
paper = client.paper_get("attention-is-all-you-need")
repos = client.paper_repository_list("attention-is-all-you-need")
for repo in repos.results:
    print(repo.url, repo.stars)

# 获取 SOTA 任务列表
tasks = client.task_list(q="machine translation")
for task in tasks.results:
    print(task.id, task.name)
```

---

## 实用数据：主要研究领域（Area）

| Area | 说明 |
|-|-|
| `natural-language-processing` | NLP |
| `computer-vision` | 计算机视觉 |
| `reinforcement-learning` | 强化学习 |
| `speech` | 语音 |
| `graphs` | 图神经网络 |
| `reasoning` | 推理 |
| `generative-models` | 生成模型 |

---

## 项目用途建议

- **技术落地追踪**：通过 `github_stars` 衡量论文的工程影响力
- **SOTA 排行榜**：抓取特定任务（如 "Text Summarization"）的最优模型演进
- **框架分布**：分析 AI 代码实现中 PyTorch vs TensorFlow 的占比变化
- **新兴方向**：结合 arXiv，找到既有论文又有高质量代码的 AI 新方向
- **官方实现识别**：通过 `is_official` 字段区分官方实现和社区复现

---

## 参考链接

- [Papers with Code API 文档](https://paperswithcode.com/api/v1/docs/)
- [Python 客户端文档](https://paperswithcode-client.readthedocs.io/)
- [Python 客户端 GitHub](https://github.com/paperswithcode/paperswithcode-client)
