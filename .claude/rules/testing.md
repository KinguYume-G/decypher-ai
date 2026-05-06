# Testing Rules — Decypher AI

> 测试不是开发后的步骤，是开发过程的一部分。每个模块完成后立即写测试。

---

## 原则

- **先写测试，再标记完成**：功能没有测试证明可运行，不算完成
- **测 行为，不测实现**：测「调用注册接口返回 token」，不测「password_hash 函数被调用了一次」
- **每个接口最少测两个场景**：成功路径（Happy Path）+ 最主要的失败路径

---

## 后端测试（pytest）

### 工具栈
```
pytest                  # 测试框架
pytest-asyncio          # 异步测试支持
pytest-cov              # 覆盖率
httpx.AsyncClient       # 测试 FastAPI 接口（不用 requests）
factory_boy             # 生成测试数据（不手写 fixture）
```

### 目录结构
```
backend/tests/
├── conftest.py              # 共享 fixture（DB、client、测试用户）
├── test_auth.py             # 认证接口测试
├── test_tasks.py            # 任务接口测试
├── test_opportunities.py    # 机会接口测试
├── test_ai_service.py       # AI 服务单元测试
└── test_data_service.py     # 数据采集单元测试
```

### conftest.py 标准模板
```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database import Base, get_db
from main import app

# 使用内存 SQLite 做测试（不影响真实数据库）
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="function")
async def db_session():
    """每个测试函数独立的数据库 session，测试后自动回滚"""
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    SessionLocal = async_sessionmaker(engine, class_=AsyncSession)
    async with SessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session):
    """测试用 HTTP 客户端，注入测试数据库"""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_client(client):
    """已登录的测试客户端（自动注册 + 登录，附带 token）"""
    await client.post("/api/v1/auth/register", json={
        "email": "test@decypher.ai",
        "username": "testuser",
        "password": "password123"
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "test@decypher.ai",
        "password": "password123"
    })
    token = res.json()["data"]["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
```

### 接口测试模板（以 tasks 为例）
```python
import pytest

class TestCreateTask:
    """POST /api/v1/tasks"""

    async def test_create_task_success(self, auth_client):
        """✅ 正常创建任务"""
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "AI Agent 追踪",
            "keywords": ["ai agent", "llm"],
            "sources": ["github", "hackernews"],
            "interval_seconds": 3600,
        })
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["name"] == "AI Agent 追踪"
        assert data["status"] == "pending"
        assert data["run_count"] == 0

    async def test_create_task_empty_keywords(self, auth_client):
        """❌ 关键词为空，应返回 422"""
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "空关键词任务",
            "keywords": [],  # 违反验证规则
            "sources": ["github"],
        })
        assert res.status_code == 422

    async def test_create_task_unauthenticated(self, client):
        """❌ 未认证，应返回 401"""
        res = await client.post("/api/v1/tasks", json={
            "name": "测试",
            "keywords": ["test"],
        })
        assert res.status_code == 401

    async def test_create_task_invalid_source(self, auth_client):
        """❌ 不支持的数据源，应返回 422"""
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "测试",
            "keywords": ["test"],
            "sources": ["twitter"],  # 不在允许列表
        })
        assert res.status_code == 422
```

### 覆盖率要求
```
核心业务逻辑（services/）：≥ 80%
API 路由（api/v1/）：      ≥ 75%
工具函数（core/）：        ≥ 70%
整体项目：                 ≥ 70%
```

### 运行命令
```bash
# 跑全部测试
pytest tests/ -v

# 跑全部 + 覆盖率报告
pytest tests/ -v --cov=app --cov-report=term-missing

# 只跑某个文件
pytest tests/test_tasks.py -v

# 遇到第一个失败立即停止（开发时用这个）
pytest tests/ -x

# 只跑带某个标记的测试
pytest tests/ -m "not slow"
```

---

## AI 服务测试（Mock 外部 API）

```python
from unittest.mock import AsyncMock, patch

class TestAIService:

    @patch("app.services.ai_service.AsyncOpenAI")
    async def test_analyze_signals_returns_opportunities(self, mock_openai):
        """AI 分析返回正确的机会结构"""
        # 模拟 OpenAI 返回
        mock_openai.return_value.chat.completions.create = AsyncMock(
            return_value=MockCompletion(content=json.dumps({
                "opportunities": [{
                    "title": "测试机会",
                    "what_to_build": "测试产品",
                    "why_it_matters": "测试原因",
                    "how_to_execute": "测试执行",
                    "scores": {
                        "trend": 8.0, "novelty": 7.0,
                        "competition": 3.0, "feasibility": 8.0,
                        "commercial": 7.5
                    }
                }],
                "market_summary": "测试总结"
            }))
        )
        result = await ai_service.analyze_signals("test signals", ["ai agent"])
        assert len(result["opportunities"]) == 1
        assert result["opportunities"][0]["title"] == "测试机会"

    @patch("app.services.data_service.httpx.AsyncClient")
    async def test_github_api_timeout_returns_empty(self, mock_client):
        """GitHub API 超时时返回空列表，不抛出异常"""
        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            side_effect=httpx.TimeoutException("timeout")
        )
        result = await github_service.search_issues(["ai agent"])
        assert result == []  # 超时不崩溃，返回空列表
```

---

## 前端测试（Vitest + Testing Library）

### 工具栈
```
vitest                          # 测试框架（Vite 原生）
@testing-library/react          # 组件测试
@testing-library/user-event     # 模拟用户交互
msw (Mock Service Worker)       # Mock API 请求
```

### 测什么
```typescript
// ✅ 测组件行为（用户能看到什么、能点什么）
// ✅ 测 Zustand store 的状态变化
// ✅ 测 API 请求函数的参数和返回值处理

// ❌ 不测组件内部实现（比如某个函数被调用了几次）
// ❌ 不测 CSS 样式
```

### 组件测试模板
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { mockTask } from "../mocks/data";

describe("TaskCard", () => {
  it("displays task name and status", () => {
    render(<TaskCard task={mockTask} onRun={vi.fn()} />);
    expect(screen.getByText("AI Agent 追踪")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("calls onRun with correct task id when run button clicked", async () => {
    const onRun = vi.fn();
    render(<TaskCard task={mockTask} onRun={onRun} />);
    await userEvent.click(screen.getByRole("button", { name: /立即运行/ }));
    expect(onRun).toHaveBeenCalledWith(mockTask.id);
  });

  it("disables run button when task is running", () => {
    render(<TaskCard task={{ ...mockTask, status: "running" }} onRun={vi.fn()} />);
    expect(screen.getByRole("button", { name: /立即运行/ })).toBeDisabled();
  });
});
```

---

## 测试数据规范

```python
# ✅ 用 factory_boy 生成，不手写重复数据
import factory
from app.models.user import User

class UserFactory(factory.Factory):
    class Meta:
        model = User
    email = factory.Sequence(lambda n: f"user{n}@test.com")
    username = factory.Sequence(lambda n: f"user{n}")
    hashed_password = "hashed_password_placeholder"

# 使用
user = UserFactory()
user_with_custom_email = UserFactory(email="custom@test.com")
```

---

## 不需要测试的内容

- Pydantic Schema 的字段定义（Pydantic 自己有测试）
- SQLAlchemy 模型的字段定义（ORM 自己保证）
- 第三方库的行为（只测你自己的代码）
- 简单的 getter / setter（ROI 太低）
