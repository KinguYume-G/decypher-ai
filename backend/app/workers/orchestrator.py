import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.models.task import Task, TaskStatus
from app.services.analysis_service import analysis_service
from app.workers.collector import collect
from app.workers.processor import process

logger = logging.getLogger(__name__)


async def run_analysis_task(task_id: int) -> None:
    """
    Full pipeline: collect → process → analyse → store.
    Called by APScheduler (periodic) or the /tasks/{id}/run endpoint (manual).
    """
    async with SessionLocal() as db:
        task = await _load_task(db, task_id)
        if task is None:
            return

        await _set_status(db, task, TaskStatus.running)

        try:
            raw_signals = await collect(task)
            signals_text = process(raw_signals)

            if not signals_text:
                logger.warning(f"Task {task_id}: no signals after processing, marking completed")
                await _finish(db, task, TaskStatus.completed)
                return

            opportunities = await analysis_service.analyze_signals(
                signals_text, task.keywords
            )
            await _store_opportunities(db, task, opportunities)
            await _finish(db, task, TaskStatus.completed)
            logger.info(
                f"Task {task_id}: pipeline complete — {len(opportunities)} opportunities stored"
            )

        except Exception as e:
            logger.error(f"Task {task_id}: pipeline failed — {e}")
            await _set_status(db, task, TaskStatus.failed)


async def _load_task(db: AsyncSession, task_id: int) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task is None:
        logger.error(f"Orchestrator: task {task_id} not found")
    return task


async def _set_status(db: AsyncSession, task: Task, status: TaskStatus) -> None:
    task.status = status
    await db.commit()


async def _finish(db: AsyncSession, task: Task, status: TaskStatus) -> None:
    task.status = status
    task.last_run_at = datetime.now(timezone.utc)
    task.run_count += 1
    await db.commit()


async def _store_opportunities(
    db: AsyncSession, task: Task, opportunities: list[dict]
) -> None:
    for opp in opportunities:
        scores = opp.get("scores", {})
        vals = [
            scores.get("trend", 0),
            scores.get("novelty", 0),
            scores.get("competition", 0),
            scores.get("feasibility", 0),
            scores.get("commercial", 0),
        ]
        score_total = round(sum(vals) / len(vals), 2) if vals else 0.0

        db.add(
            Opportunity(
                task_id=task.id,
                title=opp.get("title", "")[:300],
                what_to_build=opp.get("what_to_build", ""),
                why_it_matters=opp.get("why_it_matters", ""),
                how_to_execute=opp.get("how_to_execute", ""),
                score_trend=scores.get("trend", 0),
                score_novelty=scores.get("novelty", 0),
                score_competition=scores.get("competition", 0),
                score_feasibility=scores.get("feasibility", 0),
                score_commercial=scores.get("commercial", 0),
                score_total=score_total,
                keywords_matched=opp.get("keywords_matched", []),
                source_signals=[],
            )
        )
    await db.commit()
