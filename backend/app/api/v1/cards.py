from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.models.user_favorite import UserFavorite
from app.schemas import APIResponse, OpportunityOut

router = APIRouter(prefix="/cards", tags=["cards"])

VALID_CATEGORIES = {"market", "research", "startup", "stocks", "jobs"}


async def _favorited_ids(db: AsyncSession, user_id: int) -> set[int]:
    """一次查询拿到用户所有收藏 ID，避免 N+1 懒加载崩溃。"""
    result = await db.execute(
        select(UserFavorite.opportunity_id).where(UserFavorite.user_id == user_id)
    )
    return set(result.scalars().all())


def _build_out(opp: Opportunity, fav_ids: set[int]) -> OpportunityOut:
    out = OpportunityOut.model_validate(opp)
    out.is_favorited = opp.id in fav_ids
    return out


@router.get("", response_model=APIResponse[list[OpportunityOut]])
async def list_cards(
    category: str | None = None,
    limit: int = Query(default=6, ge=1, le=50),
    favorited: bool | None = None,   # True → only saved cards; None/False → all
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if category is not None and category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid category: {category}",
        )

    fav_ids = await _favorited_ids(db, current_user.id)

    query = (
        select(Opportunity)
        .join(Task, Task.id == Opportunity.task_id)
        .where(Task.user_id == current_user.id)
        .order_by(desc(Opportunity.score_total), desc(Opportunity.created_at))
        .limit(limit)
    )
    if category is not None:
        query = query.where(Opportunity.category == category)
    if favorited is True:
        # Only return cards that the user has explicitly saved
        query = query.where(Opportunity.id.in_(fav_ids))

    result = await db.execute(query)
    cards = result.scalars().all()
    return APIResponse(
        success=True,
        data=[_build_out(c, fav_ids) for c in cards],
    )


@router.post("/{card_id}/favorite", response_model=APIResponse[dict])
async def toggle_favorite(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """收藏/取消收藏，幂等操作。返回当前收藏状态。"""
    result = await db.execute(
        select(Opportunity)
        .join(Task, Task.id == Opportunity.task_id)
        .where(Opportunity.id == card_id, Task.user_id == current_user.id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="卡片不存在")

    existing = await db.execute(
        select(UserFavorite).where(
            UserFavorite.user_id == current_user.id,
            UserFavorite.opportunity_id == card_id,
        )
    )
    fav = existing.scalar_one_or_none()

    if fav:
        await db.execute(
            delete(UserFavorite).where(
                UserFavorite.user_id == current_user.id,
                UserFavorite.opportunity_id == card_id,
            )
        )
        await db.commit()
        return APIResponse(success=True, data={"is_favorited": False})
    else:
        db.add(UserFavorite(user_id=current_user.id, opportunity_id=card_id))
        await db.commit()
        return APIResponse(success=True, data={"is_favorited": True})
