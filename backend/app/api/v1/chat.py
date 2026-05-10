from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.schemas import APIResponse, ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=APIResponse[ChatResponse])
async def chat_message(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opportunity = None
    if payload.opportunity_id is not None:
        result = await db.execute(
            select(Opportunity)
            .join(Task, Task.id == Opportunity.task_id)
            .where(Opportunity.id == payload.opportunity_id, Task.user_id == current_user.id)
        )
        opportunity = result.scalar_one_or_none()
        if opportunity is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="机会不存在")

    content = await chat_service.reply(
        message=payload.message,
        history=payload.conversation_history,
        opportunity=opportunity,
    )
    return APIResponse(success=True, data=ChatResponse(content=content))
