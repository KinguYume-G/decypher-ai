"""Durable database-backed worker for queued analysis runs."""

import asyncio
import logging

from sqlalchemy import select

from app.database import SessionLocal
from app.models.analysis_run import AnalysisRun, RunStatus
from app.workers.orchestrator import run_analysis_task

logger = logging.getLogger(__name__)


async def claim_next_run() -> tuple[int, int] | None:
    """Atomically claim one queued run; SKIP LOCKED permits multiple workers."""
    async with SessionLocal() as db:
        async with db.begin():
            result = await db.execute(
                select(AnalysisRun)
                .where(AnalysisRun.status == RunStatus.queued)
                .order_by(AnalysisRun.created_at)
                .with_for_update(skip_locked=True)
                .limit(1)
            )
            run = result.scalar_one_or_none()
            if run is None:
                return None
            run.status = RunStatus.collecting
            await db.flush()
            return run.task_id, run.id


async def worker_loop(poll_interval: float = 1.0) -> None:
    logger.info("Analysis worker started")
    while True:
        claimed = await claim_next_run()
        if claimed is None:
            await asyncio.sleep(poll_interval)
            continue
        task_id, run_id = claimed
        try:
            await run_analysis_task(task_id, run_id=run_id)
        except Exception:
            logger.exception("Unhandled worker failure for run %s", run_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    try:
        asyncio.run(worker_loop())
    except KeyboardInterrupt:
        logger.info("Analysis worker stopped")
