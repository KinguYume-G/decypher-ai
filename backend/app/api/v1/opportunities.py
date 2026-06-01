from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.models.user_favorite import UserFavorite
from app.schemas import APIResponse, OpportunityOut

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


async def _favorited_ids(db: AsyncSession, user_id: int) -> set[int]:
    """一次查询拿到用户所有收藏的 opportunity_id，避免 N+1 懒加载。"""
    result = await db.execute(
        select(UserFavorite.opportunity_id).where(UserFavorite.user_id == user_id)
    )
    return set(result.scalars().all())


def _build_out(opp: Opportunity, fav_ids: set[int]) -> OpportunityOut:
    out = OpportunityOut.model_validate(opp)
    out.is_favorited = opp.id in fav_ids
    return out


@router.get("", response_model=APIResponse[list[OpportunityOut]])
async def list_opportunities(
    task_id: int | None = None,
    category: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Opportunity)
        .join(Task, Task.id == Opportunity.task_id)
        .where(Task.user_id == current_user.id)
        .order_by(desc(Opportunity.created_at))
        .limit(limit)
    )
    if task_id is not None:
        query = query.where(Opportunity.task_id == task_id)
    if category is not None:
        query = query.where(Opportunity.category == category)

    result = await db.execute(query)
    opportunities = result.scalars().all()
    fav_ids = await _favorited_ids(db, current_user.id)
    return APIResponse(
        success=True,
        data=[_build_out(o, fav_ids) for o in opportunities],
    )


@router.get("/{opportunity_id}", response_model=APIResponse[OpportunityOut])
async def get_opportunity(
    opportunity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Opportunity)
        .join(Task, Task.id == Opportunity.task_id)
        .where(Opportunity.id == opportunity_id, Task.user_id == current_user.id)
    )
    opportunity = result.scalar_one_or_none()
    if opportunity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="机会不存在")

    fav_ids = await _favorited_ids(db, current_user.id)
    return APIResponse(success=True, data=_build_out(opportunity, fav_ids))
