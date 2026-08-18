# Tasks routes: CRUD for scheduled data-collection tasks + POST /{id}/run to manually trigger the analysis pipeline.
# 任务路由：定时采集任务的增删改查，以及 POST /{id}/run 手动触发分析 Pipeline。
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.scheduler import add_task_job, pause_task_job, remove_task_job, resume_task_job
from app.models.analysis_run import AnalysisRun, RunStatus
from app.models.item import Item
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas import AnalysisRunOut, APIResponse, ItemOut, TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=APIResponse[TaskOut], status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        user_id=current_user.id,
        name=payload.name,
        category=payload.category,
        keywords=payload.keywords,
        sources=payload.sources,
        interval_seconds=payload.interval_seconds,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    add_task_job(task.id, task.interval_seconds)

    return APIResponse(success=True, data=TaskOut.model_validate(task))


@router.get("", response_model=APIResponse[list[TaskOut]])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.user_id == current_user.id))
    tasks = result.scalars().all()
    return APIResponse(success=True, data=[TaskOut.model_validate(t) for t in tasks])


@router.get("/{task_id}", response_model=APIResponse[TaskOut])
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await _get_user_task(task_id, current_user.id, db)
    return APIResponse(success=True, data=TaskOut.model_validate(task))


@router.patch("/{task_id}", response_model=APIResponse[TaskOut])
async def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await _get_user_task(task_id, current_user.id, db)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(task, field, value)

    if payload.interval_seconds is not None:
        add_task_job(task.id, payload.interval_seconds)
    if payload.is_active is False:
        task.status = TaskStatus.paused
        pause_task_job(task.id)
    elif payload.is_active is True:
        if task.status == TaskStatus.paused:
            task.status = TaskStatus.pending
        resume_task_job(task.id)

    await db.commit()
    await db.refresh(task)
    return APIResponse(success=True, data=TaskOut.model_validate(task))


@router.delete("/{task_id}", response_model=APIResponse[None])
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await _get_user_task(task_id, current_user.id, db)
    remove_task_job(task.id)
    await db.delete(task)
    await db.commit()
    return APIResponse(success=True)


@router.post("/{task_id}/run", response_model=APIResponse[dict])
async def run_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = await _get_user_task(task_id, current_user.id, db)
    active = await db.execute(
        select(AnalysisRun).where(
            AnalysisRun.task_id == task.id,
            AnalysisRun.status.in_([
                RunStatus.queued, RunStatus.collecting, RunStatus.processing, RunStatus.analyzing,
            ]),
        )
    )
    if active.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="任务已有一次运行正在进行")

    run = AnalysisRun(task_id=task.id, trigger="manual", status=RunStatus.queued)
    db.add(run)
    await db.commit()
    await db.refresh(run)
    return APIResponse(
        success=True,
        data={"message": f"任务 '{task.name}' 已触发执行并加入队列", "run_id": run.id},
    )


@router.get("/{task_id}/runs", response_model=APIResponse[list[AnalysisRunOut]])
async def list_task_runs(
    task_id: int,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_user_task(task_id, current_user.id, db)
    result = await db.execute(
        select(AnalysisRun)
        .where(AnalysisRun.task_id == task_id)
        .order_by(desc(AnalysisRun.created_at))
        .limit(min(max(limit, 1), 100))
    )
    return APIResponse(
        success=True,
        data=[AnalysisRunOut.model_validate(run) for run in result.scalars().all()],
    )


@router.get("/{task_id}/items", response_model=APIResponse[list[ItemOut]])
async def list_task_items(
    task_id: int,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_user_task(task_id, current_user.id, db)
    result = await db.execute(
        select(Item)
        .where(Item.task_id == task_id)
        .order_by(desc(Item.collected_at))
        .limit(min(max(limit, 1), 100))
    )
    return APIResponse(
        success=True,
        data=[ItemOut.model_validate(item) for item in result.scalars().all()],
    )


async def _get_user_task(task_id: int, user_id: int, db: AsyncSession) -> Task:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")
    return task
