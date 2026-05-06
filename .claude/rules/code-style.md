# Code Style — Decypher AI

> 适用范围：所有代码文件。每次生成或修改代码前必须遵守。

---

## Python / 后端（FastAPI）

### 命名规范
```python
# 变量、函数、方法 → snake_case
user_id = 1
async def get_current_user(): ...

# 类 → PascalCase
class OpportunityService: ...

# 常量 → UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3
DEFAULT_PAGE_SIZE = 20

# 私有方法 → 单下划线前缀
async def _parse_github_response(): ...

# 文件名 → snake_case
# user_service.py / analysis_worker.py
```

### Type Hints（必须，无例外）
```python
# ✅ 正确
async def create_task(
    user_id: int,
    keywords: list[str],
    db: AsyncSession,
) -> Task:

# ❌ 禁止
async def create_task(user_id, keywords, db):
```

### 异步规范
```python
# ✅ 所有 DB 操作必须 async
async with AsyncSession() as db:
    result = await db.execute(select(User).where(User.id == user_id))

# ✅ 并发任务用 asyncio.gather
results = await asyncio.gather(
    github_service.search_issues(keywords),
    hn_service.search(keywords),
)

# ❌ 禁止在 async 函数里用同步阻塞调用
import time
time.sleep(1)  # 会阻塞整个事件循环
```

### API 响应格式（统一，不得改变）
```python
# 所有接口返回此格式
return APIResponse(
    success=True,
    data=TaskOut.model_validate(task),
)

# 错误时
raise HTTPException(status_code=404, detail="任务不存在")
```

### 注释规范
```python
# ✅ 注释语言：中文
# ✅ 解释「为什么」，不解释「是什么」

# ✅ 好注释：解释业务逻辑
# GitHub API 未认证限制 60次/小时，必须带 Token，否则采集会被限流
headers = {"Authorization": f"token {settings.GITHUB_TOKEN}"}

# ❌ 坏注释：重复代码本身
# 设置 headers
headers = {"Authorization": f"token {settings.GITHUB_TOKEN}"}

# ✅ 函数级别注释（复杂函数才写）
async def run_analysis_task(task_id: int) -> None:
    """
    执行一次完整分析：数据采集 → 清洗 → AI 分析 → 存储结果
    由 APScheduler 定时调用，或用户手动触发
    """
```

### 导入顺序
```python
# 1. 标准库
import json
import asyncio
from datetime import datetime

# 2. 第三方库
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

# 3. 本项目
from app.config import settings
from app.models.task import Task
from app.schemas import TaskOut
```

### 禁止事项
```python
# ❌ 禁止裸 except
try:
    ...
except:  # 禁止
    pass

# ✅ 捕获具体异常
try:
    ...
except httpx.TimeoutException as e:
    logger.error(f"GitHub API 超时: {e}")
    return []

# ❌ 禁止 print 调试（用 logger）
print("debug info")  # 禁止

# ✅ 用 logging
logger = logging.getLogger(__name__)
logger.info("任务执行完成")

# ❌ 禁止在 main.py 写业务逻辑
# ❌ 禁止硬编码任何 API Key 或密码
```

---

## TypeScript / 前端（Next.js）

### 命名规范
```typescript
// 变量、函数 → camelCase
const taskId = 1;
const fetchTasks = async () => {};

// 组件 → PascalCase
const OpportunityCard = () => {};

// 类型、接口 → PascalCase
interface TaskCardProps { ... }
type DataSource = "github" | "hackernews";

// 常量 → UPPER_SNAKE_CASE
const MAX_KEYWORDS = 10;

// 文件名：组件文件 → PascalCase.tsx，其他 → kebab-case.ts
// OpportunityCard.tsx / api-client.ts
```

### TypeScript 规范
```typescript
// ✅ 必须有类型，禁止 any
const handleTask = (task: Task): void => {};

// ❌ 禁止
const handleTask = (task: any) => {};

// ✅ 用 interface 定义组件 Props
interface TaskCardProps {
  task: Task;
  onRun: (id: number) => Promise<void>;
  isLoading?: boolean;
}

// ✅ 可选链和空值合并
const name = user?.username ?? "未知用户";
```

### 组件规范
```typescript
// ✅ 函数组件 + 明确 Props 类型
const TaskCard = ({ task, onRun }: TaskCardProps) => {
  return <div>...</div>;
};

export default TaskCard;

// ✅ 客户端组件必须标注
"use client";

// ✅ 异步数据获取用 Zustand store，不直接在组件 useEffect 里 fetch
const { tasks, fetchTasks } = useTaskStore();
useEffect(() => { fetchTasks(); }, []);
```

### 样式规范
```typescript
// ✅ 只用 Tailwind class
<div className="bg-dark-600 border border-dark-400 rounded-xl p-4">

// ❌ 禁止内联 style
<div style={{ backgroundColor: '#1a1a27' }}>

// ❌ 禁止写 CSS Modules / styled-components

// ✅ 动态 class 用 clsx/cn
import { cn } from "@/lib/utils";
<div className={cn("base-class", isActive && "active-class")}>
```

### API 调用规范
```typescript
// ✅ 所有请求通过 src/lib/api.ts，禁止组件里直接 fetch
import { taskAPI } from "@/lib/api";
const task = await taskAPI.create(payload);

// ❌ 禁止
const res = await fetch("/api/v1/tasks", { method: "POST", ... });

// ✅ 错误处理
try {
  await taskAPI.create(payload);
  toast.success("创建成功");
} catch (err) {
  const msg = (err as AxiosError<APIResponse>)?.response?.data?.error ?? "操作失败";
  toast.error(msg);
}
```

### 禁止事项
```typescript
// ❌ 禁止 any
// ❌ 禁止直接 fetch（用 api.ts）
// ❌ 禁止内联 style
// ❌ 禁止在组件里写业务逻辑（抽到 store 或 service）
// ❌ 禁止 console.log 遗留在提交代码里
```

---

## 通用规范

### 文件长度
- 单个文件超过 **300 行**：考虑拆分
- 单个函数超过 **50 行**：考虑拆分
- 这不是硬性规定，但超过时需要有充分理由

### 环境变量
```
后端：DECYPHER_ 前缀（如 DECYPHER_DATABASE_URL）
前端公开：NEXT_PUBLIC_ 前缀（如 NEXT_PUBLIC_API_URL）
前端服务端：DECYPHER_ 前缀

❌ 任何 key/secret/password 禁止硬编码
```

### Git 提交前检查
```bash
# 后端
black .                    # 格式化
flake8 .                   # 检查
pytest tests/ -x           # 跑测试，第一个失败就停

# 前端
npm run type-check          # TypeScript 检查
npm run lint                # ESLint
```
