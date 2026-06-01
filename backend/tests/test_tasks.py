# Tests for task CRUD endpoints and POST /{id}/run (manual pipeline trigger).
# 测试任务 CRUD 端点及 POST /{id}/run（手动触发 Pipeline）。
from unittest.mock import patch

import pytest


@pytest.fixture(autouse=True)
def mock_scheduler():
    with patch("app.api.v1.tasks.add_task_job"), \
         patch("app.api.v1.tasks.remove_task_job"), \
         patch("app.workers.orchestrator.run_analysis_task"):
        yield


class TestCreateTask:
    async def test_create_task_success(self, auth_client):
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "AI Agent 追踪",
            "keywords": ["ai agent", "llm"],
            "sources": ["github", "hackernews"],
            "interval_seconds": 3600,
        })
        assert res.status_code == 201
        data = res.json()["data"]
        assert data["name"] == "AI Agent 追踪"
        assert data["status"] == "pending"
        assert data["run_count"] == 0

    async def test_create_task_empty_keywords(self, auth_client):
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "空关键词",
            "keywords": [],
            "sources": ["github"],
        })
        assert res.status_code == 422

    async def test_create_task_invalid_source(self, auth_client):
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "测试",
            "keywords": ["test"],
            "sources": ["twitter"],
        })
        assert res.status_code == 422

    async def test_create_task_interval_too_short(self, auth_client):
        res = await auth_client.post("/api/v1/tasks", json={
            "name": "测试",
            "keywords": ["test"],
            "sources": ["github"],
            "interval_seconds": 60,
        })
        assert res.status_code == 422

    async def test_create_task_unauthenticated(self, client):
        res = await client.post("/api/v1/tasks", json={
            "name": "测试",
            "keywords": ["test"],
            "sources": ["github"],
        })
        assert res.status_code == 401


class TestListTasks:
    async def test_list_tasks_empty(self, auth_client):
        res = await auth_client.get("/api/v1/tasks")
        assert res.status_code == 200
        assert res.json()["data"] == []

    async def test_list_tasks_returns_own_tasks_only(self, auth_client, client):
        await auth_client.post("/api/v1/tasks", json={
            "name": "我的任务", "keywords": ["test"], "sources": ["github"],
        })
        res = await auth_client.get("/api/v1/tasks")
        assert len(res.json()["data"]) == 1

    async def test_list_tasks_unauthenticated(self, client):
        res = await client.get("/api/v1/tasks")
        assert res.status_code == 401


class TestGetTask:
    async def test_get_task_success(self, auth_client):
        create = await auth_client.post("/api/v1/tasks", json={
            "name": "详情测试", "keywords": ["k"], "sources": ["hackernews"],
        })
        task_id = create.json()["data"]["id"]
        res = await auth_client.get(f"/api/v1/tasks/{task_id}")
        assert res.status_code == 200
        assert res.json()["data"]["id"] == task_id

    async def test_get_task_not_found(self, auth_client):
        res = await auth_client.get("/api/v1/tasks/99999")
        assert res.status_code == 404


class TestUpdateTask:
    async def test_update_task_name(self, auth_client):
        create = await auth_client.post("/api/v1/tasks", json={
            "name": "旧名字", "keywords": ["k"], "sources": ["github"],
        })
        task_id = create.json()["data"]["id"]
        res = await auth_client.patch(f"/api/v1/tasks/{task_id}", json={"name": "新名字"})
        assert res.status_code == 200
        assert res.json()["data"]["name"] == "新名字"

    async def test_update_task_not_found(self, auth_client):
        res = await auth_client.patch("/api/v1/tasks/99999", json={"name": "x"})
        assert res.status_code == 404


class TestDeleteTask:
    async def test_delete_task_success(self, auth_client):
        create = await auth_client.post("/api/v1/tasks", json={
            "name": "待删除", "keywords": ["k"], "sources": ["github"],
        })
        task_id = create.json()["data"]["id"]
        res = await auth_client.delete(f"/api/v1/tasks/{task_id}")
        assert res.status_code == 200
        res = await auth_client.get(f"/api/v1/tasks/{task_id}")
        assert res.status_code == 404

    async def test_delete_task_not_found(self, auth_client):
        res = await auth_client.delete("/api/v1/tasks/99999")
        assert res.status_code == 404


class TestRunTask:
    async def test_run_task_success(self, auth_client):
        create = await auth_client.post("/api/v1/tasks", json={
            "name": "手动触发", "keywords": ["k"], "sources": ["github"],
        })
        task_id = create.json()["data"]["id"]
        res = await auth_client.post(f"/api/v1/tasks/{task_id}/run")
        assert res.status_code == 200
        assert "已触发执行" in res.json()["data"]["message"]
