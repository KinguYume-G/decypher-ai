# Shared pytest fixtures: in-memory SQLite DB, unauthenticated AsyncClient, and pre-logged-in auth_client.
# 共享 pytest 夹具：内存 SQLite 测试库、未认证 AsyncClient 及已登录的 auth_client。
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401 — 注册所有 ORM 模型到 Base.metadata
from app.database import Base, get_db

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_session():
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session):
    from main import app

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_client(client):
    await client.post("/api/v1/auth/register", json={
        "email": "test@decypher.ai",
        "username": "testuser",
        "password": "password123",
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "test@decypher.ai",
        "password": "password123",
    })
    token = res.json()["data"]["access_token"]
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client
