# Chat routes: POST /chat/stream pushes LLM tokens to the frontend as SSE; message can reference a task for context.
# 对话路由：POST /chat/stream 以 SSE 流式推送 LLM 响应；消息可关联任务以注入上下文。
import json
import re

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.item import Item
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.schemas import APIResponse, ChatRequest, ChatResponse, ConversationOut
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


async def _load_or_create_conversation(
    payload: ChatRequest,
    user_id: int,
    db: AsyncSession,
) -> Conversation:
    if payload.conversation_id is not None:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conversation = result.scalar_one_or_none()
        if conversation is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="对话不存在")
        return conversation

    conversation = Conversation(
        user_id=user_id,
        opportunity_id=payload.opportunity_id,
        title=payload.message[:80],
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


async def _load_citations(
    opportunity: Opportunity | None,
    user_id: int,
    query: str,
    db: AsyncSession,
) -> list[dict]:
    if opportunity is None:
        return []
    result = await db.execute(
        select(Item)
        .join(Task, Task.id == Item.task_id)
        .where(Item.task_id == opportunity.task_id, Task.user_id == user_id)
        .order_by(desc(Item.collected_at))
        .limit(100)
    )
    terms = {term.lower() for term in re.findall(r"[\w-]{2,}", query)}
    items = list(result.scalars().all())
    items.sort(
        key=lambda item: (
            len(terms & set(re.findall(r"[\w-]{2,}", f"{item.title} {item.content}".lower()))),
            item.score,
        ),
        reverse=True,
    )
    return [{
        "item_id": item.id,
        "title": item.title,
        "url": item.url,
        "source": item.source,
        "excerpt": item.content[:800],
    } for item in items[:5]]


def _citation_context(citations: list[dict]) -> str:
    if not citations:
        return ""
    lines = ["Use only these user-owned sources as supporting evidence:"]
    lines.extend(
        f"[{index}] {citation['title']} ({citation['source']}): {citation['url']}\n"
        f"Evidence excerpt: {citation.get('excerpt') or 'No excerpt available'}"
        for index, citation in enumerate(citations, start=1)
    )
    return "\n".join(lines)


async def _save_message(
    db: AsyncSession,
    conversation_id: int,
    role: str,
    content: str,
    citations: list[dict] | None = None,
) -> None:
    db.add(ConversationMessage(
        conversation_id=conversation_id,
        role=role,
        content=content,
        citations=citations or [],
    ))
    await db.commit()


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
    conversation = await _load_or_create_conversation(payload, current_user.id, db)
    citations = await _load_citations(opportunity, current_user.id, payload.message, db)
    message = payload.message
    context = _citation_context(citations)
    if context:
        message = f"{payload.message}\n\n{context}"
    await _save_message(db, conversation.id, "user", payload.message)
    content = await chat_service.reply(
        message=message,
        history=payload.conversation_history,
        opportunity=opportunity,
    )
    await _save_message(db, conversation.id, "assistant", content, citations)
    return APIResponse(
        success=True,
        data=ChatResponse(content=content, conversation_id=conversation.id, citations=citations),
    )


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
    conversation = await _load_or_create_conversation(payload, current_user.id, db)
    citations = await _load_citations(opportunity, current_user.id, payload.message, db)
    message = payload.message
    context = _citation_context(citations)
    if context:
        message = f"{payload.message}\n\n{context}"
    await _save_message(db, conversation.id, "user", payload.message)
    report_mode = getattr(payload, "report_mode", False)

    async def generator():
        chunks: list[str] = []
        try:
            yield f"data: {json.dumps({'type': 'meta', 'conversation_id': conversation.id, 'citations': citations})}\n\n"
            async for chunk in chat_service.stream_reply(
                message=message,
                history=payload.conversation_history,
                opportunity=opportunity,
                report_mode=report_mode,
            ):
                chunks.append(chunk)
                yield f"data: {json.dumps({'type': 'delta', 'content': chunk})}\n\n"
        except Exception:
            yield f"data: {json.dumps({'type': 'error', 'content': 'AI service temporarily unavailable'})}\n\n"
        finally:
            content = "".join(chunks).strip()
            if content:
                await _save_message(db, conversation.id, "assistant", content, citations)
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/conversations", response_model=APIResponse[list[ConversationOut]])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
        .order_by(desc(Conversation.updated_at))
        .limit(50)
    )
    return APIResponse(
        success=True,
        data=[ConversationOut.model_validate(item) for item in result.scalars().unique().all()],
    )
