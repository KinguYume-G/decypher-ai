from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.scheduler import add_task_job, remove_task_job
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.schemas import APIResponse, TaskCreate, TaskOut, TaskUpdate

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
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.workers.orchestrator import run_analysis_task  # avoid circular import at module level

    task = await _get_user_task(task_id, current_user.id, db)
    background_tasks.add_task(run_analysis_task, task_id)
    return APIResponse(success=True, data={"message": f"任务 '{task.name}' 已触发执行，结果稍后可查看"})


async def _get_user_task(task_id: int, user_id: int, db: AsyncSession) -> Task:
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="任务不存在")
    return task
