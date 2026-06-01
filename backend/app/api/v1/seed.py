# Seed route: POST /seed creates 5 demo tasks (one per category) and triggers them; skips if tasks already exist.
# 演示数据路由：POST /seed 为每个分类创建示例任务并触发执行；数据库已有任务时自动跳过。
"""
一键初始化演示数据：为 5 个模块各创建一个默认任务并立即触发。
仅在数据库为空时执行（有任务就跳过）。
"""
import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.scheduler import scheduler
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas import APIResponse
from app.workers.orchestrator import run_analysis_task

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/seed", tags=["seed"])

# 每个模块的默认配置：关键词 + 数据源
_DEFAULTS = [
    {
        "name": "AI Startup Signals",
        "category": "startup",
        "keywords": ["ai agent", "llm ops", "developer tools", "saas"],
        "sources": ["github", "hackernews", "devto"],
        "interval_seconds": 3600,
    },
    {
        "name": "Global Market Trends",
        "category": "market",
        "keywords": ["artificial intelligence", "machine learning", "product launch"],
        "sources": ["github", "hackernews", "devto"],
        "interval_seconds": 3600,
    },
    {
        "name": "Academic Research Digest",
        "category": "research",
        "keywords": ["large language models", "neural networks", "computer vision"],
        "sources": ["arxiv", "openalex", "paperswithcode", "github", "hackernews"],
        "interval_seconds": 43200,
    },
    {
        "name": "Corporate News & Filings",
        "category": "stocks",
        "keywords": ["artificial intelligence", "cloud infrastructure", "semiconductor"],
        "sources": ["sec", "hackernews"],
        "interval_seconds": 86400,
    },
    {
        "name": "Tech Career Signals",
        "category": "jobs",
        "keywords": ["python", "machine learning engineer", "llm", "rust"],
        "sources": ["stackexchange", "remoteok", "devto"],
        "interval_seconds": 43200,
    },
]


@router.post("", response_model=APIResponse[dict])
async def seed_demo_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    为当前用户创建 5 个默认任务（每个模块一个）并立即触发第一次采集。
    如果用户已有任务，直接返回，不重复创建。
    """
    existing = await db.execute(select(Task).where(Task.user_id == current_user.id).limit(1))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have tasks. Delete them first if you want to re-seed.",
        )

    created_ids: list[int] = []
    for cfg in _DEFAULTS:
        task = Task(
            user_id=current_user.id,
            name=cfg["name"],
            category=cfg["category"],
            keywords=cfg["keywords"],
            sources=cfg["sources"],
            interval_seconds=cfg["interval_seconds"],
            status=TaskStatus.pending,
            is_active=True,
        )
        db.add(task)
        await db.flush()  # 获取 id
        created_ids.append(task.id)

    await db.commit()
    logger.info(f"Seed: created {len(created_ids)} tasks for user {current_user.id}")

    # 顺序触发（本地 Ollama 无法处理并发推理）
    async def _run_sequential():
        for tid in created_ids:
            try:
                await run_analysis_task(tid)
            except Exception as e:
                logger.error(f"Seed: task {tid} failed: {e}")

    asyncio.create_task(_run_sequential())

    return APIResponse(
        success=True,
        data={
            "tasks_created": len(created_ids),
            "task_ids": created_ids,
            "message": "5 tasks created and crawls triggered. Cards will appear on your Dashboard in 30-60 seconds.",
        },
    )
