# Chat routes: POST /chat/stream pushes LLM tokens to the frontend as SSE; message can reference a task for context.
# 对话路由：POST /chat/stream 以 SSE 流式推送 LLM 响应；消息可关联任务以注入上下文。
import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.schemas import APIResponse, ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


async def _load_opportunity(
    opportunity_id: int | None,
    user_id: int,
    db: AsyncSession,
) -> Opportunity | None:
    if opportunity_id is None:
        return None
    result = await db.execute(
        select(Opportunity)
        .join(Task, Task.id == Opportunity.task_id)
        .where(Opportunity.id == opportunity_id, Task.user_id == user_id)
    )
    opp = result.scalar_one_or_none()
    if opp is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="机会不存在")
    return opp


# ── 普通消息（非流式，兼容旧逻辑）─────────────────────────────

@router.post("/message", response_model=APIResponse[ChatResponse])
async def chat_message(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    opportunity = await _load_opportunity(payload.opportunity_id, current_user.id, db)
    content = await chat_service.reply(
        message=payload.message,
        history=payload.conversation_history,
        opportunity=opportunity,
    )
    return APIResponse(success=True, data=ChatResponse(content=content))


# ── 流式消息（SSE，打字机效果）────────────────────────────────

@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Server-Sent Events 流式聊天。
    每个 token 推送：data: {"type":"delta","content":"..."}\n\n
    结束：data: [DONE]\n\n
    """
    opportunity = await _load_opportunity(payload.opportunity_id, current_user.id, db)
    report_mode = getattr(payload, "report_mode", False)

    async def generator():
        try:
            async for chunk in chat_service.stream_reply(
                message=payload.message,
                history=payload.conversation_history,
                opportunity=opportunity,
                report_mode=report_mode,
            ):
                yield f"data: {json.dumps({'type': 'delta', 'content': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
