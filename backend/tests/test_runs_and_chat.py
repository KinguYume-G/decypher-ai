from unittest.mock import AsyncMock, patch

from app.models.analysis_run import AnalysisRun, RunStatus
from app.models.item import Item


async def _create_task(auth_client):
    response = await auth_client.post("/api/v1/tasks", json={
        "name": "Durable run test",
        "keywords": ["agent"],
        "sources": ["github"],
        "interval_seconds": 3600,
    })
    assert response.status_code == 201
    return response.json()["data"]


async def test_run_is_created_and_exposed(auth_client):
    task = await _create_task(auth_client)
    with patch("app.workers.orchestrator.run_analysis_task", new=AsyncMock()):
        response = await auth_client.post(f"/api/v1/tasks/{task['id']}/run")

    assert response.status_code == 200
    assert response.json()["data"]["run_id"] > 0

    runs = await auth_client.get(f"/api/v1/tasks/{task['id']}/runs")
    assert runs.status_code == 200
    assert runs.json()["data"][0]["status"] == "queued"


async def test_concurrent_run_is_rejected(auth_client, db_session):
    task = await _create_task(auth_client)
    db_session.add(AnalysisRun(task_id=task["id"], status=RunStatus.collecting))
    await db_session.commit()

    response = await auth_client.post(f"/api/v1/tasks/{task['id']}/run")
    assert response.status_code == 409


async def test_items_are_scoped_to_task_owner(auth_client, db_session):
    task = await _create_task(auth_client)
    run = AnalysisRun(task_id=task["id"], status=RunStatus.completed)
    db_session.add(run)
    await db_session.flush()
    db_session.add(Item(
        task_id=task["id"],
        run_id=run.id,
        source="github",
        url="https://github.com/example/project",
        title="Example project",
        content="Evidence",
        content_hash=Item.hash_content("Example project", "Evidence"),
    ))
    await db_session.commit()

    response = await auth_client.get(f"/api/v1/tasks/{task['id']}/items")
    assert response.status_code == 200
    assert response.json()["data"][0]["title"] == "Example project"


async def test_chat_persists_conversation(auth_client):
    with patch("app.api.v1.chat.chat_service.reply", new=AsyncMock(return_value="Grounded answer")):
        response = await auth_client.post("/api/v1/chat/message", json={"message": "What matters?"})

    assert response.status_code == 200
    conversation_id = response.json()["data"]["conversation_id"]
    assert conversation_id > 0

    history = await auth_client.get("/api/v1/chat/conversations")
    assert history.status_code == 200
    conversation = history.json()["data"][0]
    assert conversation["id"] == conversation_id
    assert [message["role"] for message in conversation["messages"]] == ["user", "assistant"]
