# Reddit API

**官方文档**: https://www.reddit.com/dev/api/  
**OAuth2 文档**: https://github.com/reddit-archive/reddit/wiki/OAuth2  
**模块用途**: 商业市场 / 技术趋势（社区真实讨论、产品反馈、技术热点）

---

## 概览

Reddit API 提供对帖子、评论、子版块、用户等数据的访问。对于 AI 项目，r/MachineLearning、r/artificial、r/LocalLLaMA、r/ChatGPT 等社区是追踪技术讨论和产品情感的重要来源。

---

## 认证（Authentication）

Reddit API **需要 OAuth 2.0 认证**，无认证访问极为受限（10 req/min）。

### 注册应用
1. 登录 Reddit → https://www.reddit.com/prefs/apps
2. 点击 "create another app..."
3. 选择应用类型：
   - **script**：个人/服务器端脚本（最简单，推荐）
   - **web app**：Web 应用（需要用户授权）
   - **installed app**：桌面/移动应用
4. 获得 `client_id` 和 `client_secret`

### 获取 Access Token（Script 应用）

```python
import requests

CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
USERNAME = "your_reddit_username"
PASSWORD = "your_reddit_password"
USER_AGENT = "MyApp/1.0 by u/your_username"

auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
data = {
    "grant_type": "password",
    "username": USERNAME,
    "password": PASSWORD
}
headers = {"User-Agent": USER_AGENT}

resp = requests.post(
    "https://www.reddit.com/api/v1/access_token",
    auth=auth, data=data, headers=headers
)
token = resp.json()["access_token"]
```

Token 有效期 **1 小时**，到期后需重新获取。

### 无用户上下文（client_credentials，只读公开数据，更简单）
```python
resp = requests.post(
    "https://www.reddit.com/api/v1/access_token",
    auth=requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET),
    data={"grant_type": "client_credentials"},
    headers={"User-Agent": USER_AGENT}
)
token = resp.json()["access_token"]
```

---

## 速率限制

| 认证方式 | 限制 |
|-|-|
| 无认证 | 10 req/min |
| OAuth 认证 | ~100 req/min（60 QPM 官方，实际约 100） |

响应头包含限速信息：
- `X-Ratelimit-Used`：已用请求数
- `X-Ratelimit-Remaining`：剩余请求数
- `X-Ratelimit-Reset`：重置时间（秒）

---

## Base URL

```
https://oauth.reddit.com/
```

所有认证请求发往此地址，并在请求头中携带 token：
```http
Authorization: bearer YOUR_ACCESS_TOKEN
User-Agent: YourApp/1.0 by u/username
```

---

## 核心 Endpoints

### 获取子版块帖子
```
GET /r/{subreddit}/{listing}
```

`listing` 可选值：
| 值 | 说明 |
|-|-|
| `hot` | 热门帖子 |
| `new` | 最新帖子 |
| `top` | 最高票帖子（需配合 `t` 参数） |
| `rising` | 上升中的帖子 |

示例：
```
GET /r/MachineLearning/hot?limit=25
GET /r/LocalLLaMA/new?limit=50
GET /r/artificial/top?t=week&limit=100
```

`t` 参数（top/controversial）：`hour`、`day`、`week`、`month`、`year`、`all`

### 搜索帖子
```
GET /r/{subreddit}/search?q={query}&sort={sort}&t={time}&restrict_sr=true
```

全站搜索：
```
GET /search?q={query}&sort=relevance&type=link
```

### 获取帖子评论
```
GET /r/{subreddit}/comments/{post_id}?limit=100&depth=2
```

### 获取多个子版块信息
```
GET /r/{sub1}+{sub2}+{sub3}/hot?limit=50
```

### 搜索子版块
```
GET /subreddits/search?q={query}&limit=10
```

---

## Python 快速上手

### 使用 PRAW 库（推荐）
```bash
pip install praw
```

```python
import praw

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="MyApp/1.0 by u/your_username",
    # 只读不需要 username/password
)

# 获取 r/MachineLearning 热门帖子
subreddit = reddit.subreddit("MachineLearning")
for post in subreddit.hot(limit=20):
    print(f"[{post.score}] {post.title}")
    print(f"  Comments: {post.num_comments} | {post.url}")
```

### 监控多个 AI 子版块
```python
import praw
import time

AI_SUBREDDITS = [
    "MachineLearning",
    "artificial",
    "LocalLLaMA",
    "ChatGPT",
    "singularity",
    "StableDiffusion"
]

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    user_agent="AITrendTracker/1.0"
)

def get_top_posts(subreddits: list, time_filter="week", limit=10) -> list:
    all_posts = []
    for sr in subreddits:
        try:
            sub = reddit.subreddit(sr)
            for post in sub.top(time_filter=time_filter, limit=limit):
                all_posts.append({
                    "subreddit": sr,
                    "title": post.title,
                    "score": post.score,
                    "comments": post.num_comments,
                    "url": post.url,
                    "created": post.created_utc,
                    "id": post.id
                })
            time.sleep(0.5)
        except Exception as e:
            print(f"Error fetching r/{sr}: {e}")
    return sorted(all_posts, key=lambda x: x["score"], reverse=True)

top_posts = get_top_posts(AI_SUBREDDITS, time_filter="week", limit=5)
for post in top_posts[:20]:
    print(f"[r/{post['subreddit']}] [{post['score']}] {post['title']}")
```

### 搜索关键词
```python
def search_reddit(query: str, subreddit: str = "all", sort: str = "relevance", time_filter: str = "month", limit: int = 50) -> list:
    sub = reddit.subreddit(subreddit)
    results = []
    for post in sub.search(query, sort=sort, time_filter=time_filter, limit=limit):
        results.append({
            "title": post.title,
            "score": post.score,
            "num_comments": post.num_comments,
            "selftext": post.selftext[:300],
            "url": post.url,
            "subreddit": str(post.subreddit)
        })
    return results

# 搜索 RAG 相关讨论
posts = search_reddit("RAG retrieval augmented generation", subreddit="MachineLearning+LocalLLaMA", time_filter="month")
for p in posts[:10]:
    print(f"[{p['score']}👍] {p['title']}")
```

### 获取帖子评论（情感分析素材）
```python
def get_top_comments(post_id: str, subreddit: str, limit: int = 20) -> list:
    submission = reddit.submission(id=post_id)
    submission.comments.replace_more(limit=0)
    comments = []
    for comment in submission.comments.list()[:limit]:
        comments.append({
            "body": comment.body[:500],
            "score": comment.score,
            "author": str(comment.author)
        })
    return sorted(comments, key=lambda x: x["score"], reverse=True)
```

---

## 重要 AI 相关子版块

| 子版块 | 说明 |
|-|-|
| r/MachineLearning | 学术/研究向，质量最高 |
| r/artificial | AI 新闻和讨论 |
| r/LocalLLaMA | 本地 LLM 运行讨论 |
| r/ChatGPT | ChatGPT 用户社区 |
| r/OpenAI | OpenAI 相关 |
| r/singularity | AI 技术奇点讨论 |
| r/StableDiffusion | AI 图像生成 |
| r/learnmachinelearning | ML 学习社区 |
| r/datascience | 数据科学 |
| r/LanguageTechnology | NLP 技术 |

---

## 注意事项

- `User-Agent` 头 **必须** 填写，否则会被封禁。格式：`AppName/version by u/username`
- Token 每小时过期，生产环境需要自动刷新
- 获取评论树时，`replace_more()` 会额外消耗 API 配额
- Reddit 不允许抓取用于训练 AI 模型（请查阅最新服务条款）

---

## 参考链接

- [Reddit API 官方文档](https://www.reddit.com/dev/api/)
- [OAuth2 文档](https://github.com/reddit-archive/reddit/wiki/OAuth2)
- [PRAW Python 库](https://praw.readthedocs.io/)
- [Reddit 开发者设置](https://www.reddit.com/prefs/apps)
- [速率限制完整指南 2026](https://painonsocial.com/blog/reddit-api-rate-limits-guide)
