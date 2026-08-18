# APScheduler AsyncIOScheduler with Redis JobStore; exposes helpers to add, remove, and pause task jobs.
# APScheduler 异步调度器，使用 Redis 持久化 Job；暴露任务 Job 的增删暂停辅助函数。
from urllib.parse import urlparse

from apscheduler.jobstores.redis import RedisJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings

_parsed = urlparse(settings.redis_url)
_jobstore = RedisJobStore(
    host=_parsed.hostname or "localhost",
    port=_parsed.port or 6379,
    db=int(_parsed.path.lstrip("/") or 0),
)

scheduler = AsyncIOScheduler(
    jobstores={"default": _jobstore},
    job_defaults={"coalesce": True, "max_instances": 1, "misfire_grace_time": 60},
)


def add_task_job(task_id: int, interval_seconds: int) -> None:
    scheduler.add_job(
        _run_task_placeholder,
        trigger=IntervalTrigger(seconds=interval_seconds),
        id=f"task_{task_id}",
        args=[task_id],
        replace_existing=True,
    )


def remove_task_job(task_id: int) -> None:
    job_id = f"task_{task_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)


def pause_task_job(task_id: int) -> None:
    job = scheduler.get_job(f"task_{task_id}")
    if job:
        job.pause()


def resume_task_job(task_id: int) -> None:
    job = scheduler.get_job(f"task_{task_id}")
    if job:
        job.resume()


async def _run_task_placeholder(task_id: int) -> None:
    from sqlalchemy import select

    from app.database import SessionLocal
    from app.models.analysis_run import AnalysisRun, RunStatus

    async with SessionLocal() as db:
        active = await db.execute(
            select(AnalysisRun.id).where(
                AnalysisRun.task_id == task_id,
                AnalysisRun.status.in_([
                    RunStatus.queued, RunStatus.collecting, RunStatus.processing, RunStatus.analyzing,
                ]),
            )
        )
        if active.scalar_one_or_none() is None:
            db.add(AnalysisRun(task_id=task_id, trigger="scheduled", status=RunStatus.queued))
            await db.commit()
