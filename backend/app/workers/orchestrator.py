# Pipeline layer 3: calls collector → processor → analysis_service, writes Opportunities to DB, updates Task status.
# Pipeline 第三层：调用 collector → processor → analysis_service，将 Opportunity 写入数据库并更新 Task 状态。
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import SessionLocal
from app.models.analysis_run import AnalysisRun, RunStatus
from app.models.item import Item
from app.models.opportunity import Opportunity
from app.models.task import Task, TaskStatus
from app.services.analysis_service import analysis_service
from app.workers.collector import collect
from app.workers.processor import process

logger = logging.getLogger(__name__)


async def run_analysis_task(task_id: int, run_id: int | None = None) -> None:
    """
    Full pipeline: collect → process → analyse → store.
    Called by APScheduler (periodic) or the /tasks/{id}/run endpoint (manual).
    """
    async with SessionLocal() as db:
        task = await _load_task(db, task_id)
        if task is None:
            return

        run = await _load_or_create_run(db, task_id, run_id)

        await _set_status(db, task, TaskStatus.running)

        try:
            await _set_run_status(db, run, RunStatus.collecting, started=True)
            raw_signals = await collect(task)
            run.collected_count = len(raw_signals)
            persisted_count = await _persist_items(db, task, run, raw_signals)

            await _set_run_status(db, run, RunStatus.processing)
            signals_text = process(raw_signals)
            run.processed_count = persisted_count
            await db.commit()

            if not signals_text:
                logger.warning(f"Task {task_id}: no signals after processing, marking completed")
                await _finish_run(db, run, RunStatus.completed)
                await _finish(db, task, TaskStatus.completed)
                return

            # 提取原始信号 URL 列表，存入 source_signals
            signal_urls = [s.url for s in raw_signals if s.url][:20]

            await _set_run_status(db, run, RunStatus.analyzing)
            opportunities = await analysis_service.analyze_signals(
                signals_text, task.keywords, category=task.category
            )
            await _store_opportunities(db, task, opportunities, signal_urls)
            run.opportunity_count = len(opportunities)
            await _finish_run(db, run, RunStatus.completed)
            await _finish(db, task, TaskStatus.completed)
            logger.info(
                f"Task {task_id}: pipeline complete — {len(opportunities)} opportunities stored"
            )

        except Exception as e:
            logger.error(f"Task {task_id}: pipeline failed — {e}")
            await db.rollback()
            run = await db.get(AnalysisRun, run.id)
            if run is not None:
                run.error_code = type(e).__name__
                run.error_message = str(e)[:2000]
                await _finish_run(db, run, RunStatus.failed)
            await _set_status(db, task, TaskStatus.failed)


async def _load_or_create_run(
    db: AsyncSession, task_id: int, run_id: int | None
) -> AnalysisRun:
    run = await db.get(AnalysisRun, run_id) if run_id is not None else None
    if run is None:
        run = AnalysisRun(task_id=task_id, trigger="scheduled", status=RunStatus.queued)
        db.add(run)
        await db.commit()
        await db.refresh(run)
    return run


async def _set_run_status(
    db: AsyncSession,
    run: AnalysisRun,
    status: RunStatus,
    *,
    started: bool = False,
) -> None:
    run.status = status
    if started and run.started_at is None:
        run.started_at = datetime.now(timezone.utc)
    run.ai_provider = settings.ai_provider
    run.ai_model = settings.active_ai_model
    await db.commit()


async def _finish_run(db: AsyncSession, run: AnalysisRun, status: RunStatus) -> None:
    run.status = status
    run.finished_at = datetime.now(timezone.utc)
    await db.commit()


async def _persist_items(db: AsyncSession, task: Task, run: AnalysisRun, signals: list) -> int:
    urls = {signal.url for signal in signals if signal.url}
    existing: set[tuple[str, str]] = set()
    if urls:
        result = await db.execute(
            select(Item.source, Item.url).where(Item.task_id == task.id, Item.url.in_(urls))
        )
        existing = set(result.all())

    added = 0
    seen = set(existing)
    for signal in signals:
        key = (signal.source, signal.url)
        if not signal.url or key in seen:
            continue
        seen.add(key)
        db.add(Item(
            task_id=task.id,
            run_id=run.id,
            source=signal.source,
            external_id=None,
            url=signal.url,
            title=signal.title[:500],
            content=signal.body,
            score=signal.score,
            content_hash=Item.hash_content(signal.title, signal.body),
        ))
        added += 1
    await db.commit()
    return added


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
    db: AsyncSession,
    task: Task,
    opportunities: list[dict],
    raw_signal_urls: list[str],
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
                category=task.category,
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
                source_signals=raw_signal_urls,
            )
        )
    await db.commit()
