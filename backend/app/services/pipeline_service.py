async def run_pipeline(task_id: int, run_id: int | None = None) -> None:
    # single place to add rate limiting, quota checks, pre/post hooks later
    from app.workers.orchestrator import run_analysis_task

    await run_analysis_task(task_id, run_id=run_id)
