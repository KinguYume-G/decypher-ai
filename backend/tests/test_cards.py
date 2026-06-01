from unittest.mock import patch

import pytest


@pytest.fixture(autouse=True)
def mock_scheduler():
    with patch("app.api.v1.tasks.add_task_job"), patch("app.api.v1.tasks.remove_task_job"):
        yield


async def _create_task(auth_client, category: str = "startup"):
    res = await auth_client.post("/api/v1/tasks", json={
        "name": f"{category} 测试任务",
        "keywords": ["ai agent"],
        "sources": ["github"],
        "interval_seconds": 3600,
        "category": category,
    })
    assert res.status_code == 201
    return res.json()["data"]


async def _seed_opportunity(db_session, task_id: int, category: str = "startup"):
    """直接往 DB 插一条 opportunity，绕过 AI pipeline。"""
    from datetime import datetime, timezone
    from app.models.opportunity import Opportunity

    opp = Opportunity(
        task_id=task_id,
        category=category,
        title=f"Test Opportunity [{category}]",
        what_to_build="Build X",
        why_it_matters="Because Y",
        how_to_execute="Do Z",
        score_trend=8.0,
        score_novelty=7.0,
        score_competition=3.0,
        score_feasibility=8.0,
        score_commercial=7.5,
        score_total=6.7,
        keywords_matched=["ai agent"],
        source_signals=["https://github.com/example/repo"],
    )
    db_session.add(opp)
    await db_session.commit()
    await db_session.refresh(opp)
    return opp


class TestListCards:
    async def test_list_cards_no_filter(self, auth_client, db_session):
        """无 category 过滤时返回全部卡片。"""
        task = await _create_task(auth_client, "startup")
        await _seed_opportunity(db_session, task["id"], "startup")

        res = await auth_client.get("/api/v1/cards")
        assert res.status_code == 200
        data = res.json()["data"]
        assert len(data) >= 1

    async def test_list_cards_category_filter(self, auth_client, db_session):
        """category=research 只返回 research 分类的卡片。"""
        task_s = await _create_task(auth_client, "startup")
        task_r = await _create_task(auth_client, "research")
        await _seed_opportunity(db_session, task_s["id"], "startup")
        await _seed_opportunity(db_session, task_r["id"], "research")

        res = await auth_client.get("/api/v1/cards?category=research")
        assert res.status_code == 200
        data = res.json()["data"]
        assert all(c["category"] == "research" for c in data)

    async def test_list_cards_invalid_category(self, auth_client):
        """无效 category 返回 422。"""
        res = await auth_client.get("/api/v1/cards?category=invalid_module")
        assert res.status_code == 422

    async def test_list_cards_unauthenticated(self, client):
        """未认证返回 401。"""
        res = await client.get("/api/v1/cards")
        assert res.status_code == 401

    async def test_list_cards_is_favorited_false_by_default(self, auth_client, db_session):
        """新卡片 is_favorited 默认为 False。"""
        task = await _create_task(auth_client, "startup")
        await _seed_opportunity(db_session, task["id"], "startup")

        res = await auth_client.get("/api/v1/cards")
        data = res.json()["data"]
        assert all(c["is_favorited"] is False for c in data)


class TestToggleFavorite:
    async def test_favorite_then_unfavorite(self, auth_client, db_session):
        """收藏后再次调用取消收藏，状态幂等反转。"""
        task = await _create_task(auth_client, "startup")
        opp = await _seed_opportunity(db_session, task["id"], "startup")

        # 第一次：收藏
        res = await auth_client.post(f"/api/v1/cards/{opp.id}/favorite")
        assert res.status_code == 200
        assert res.json()["data"]["is_favorited"] is True

        # 第二次：取消
        res = await auth_client.post(f"/api/v1/cards/{opp.id}/favorite")
        assert res.status_code == 200
        assert res.json()["data"]["is_favorited"] is False

    async def test_favorite_reflects_in_list(self, auth_client, db_session):
        """收藏后 GET /cards 返回的 is_favorited 应为 True。"""
        task = await _create_task(auth_client, "startup")
        opp = await _seed_opportunity(db_session, task["id"], "startup")

        await auth_client.post(f"/api/v1/cards/{opp.id}/favorite")

        res = await auth_client.get("/api/v1/cards")
        data = res.json()["data"]
        target = next((c for c in data if c["id"] == opp.id), None)
        assert target is not None
        assert target["is_favorited"] is True

    async def test_favorite_nonexistent_card(self, auth_client):
        """不存在的卡片 ID 返回 404。"""
        res = await auth_client.post("/api/v1/cards/99999/favorite")
        assert res.status_code == 404

    async def test_favorite_unauthenticated(self, auth_client, db_session):
        """未认证调用收藏返回 401。"""
        from httpx import AsyncClient, ASGITransport
        from main import app

        task = await _create_task(auth_client, "startup")
        opp = await _seed_opportunity(db_session, task["id"], "startup")
        # 用全新的、无 token 的客户端发请求
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as anon:
            res = await anon.post(f"/api/v1/cards/{opp.id}/favorite")
        assert res.status_code == 401
