from app.workers.orchestrator import run_analysis_task

async def run_pipeline(task_id: int) -> None:
    # single place to add rate limiting, quota checks, pre/post hooks later
    await run_analysis_task(task_id)