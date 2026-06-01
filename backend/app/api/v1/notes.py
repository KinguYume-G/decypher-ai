from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.note import Note
from app.models.user import User
from app.schemas import APIResponse, NoteCreate, NoteOut

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=APIResponse[list[NoteOut]])
async def list_notes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Note)
        .where(Note.user_id == current_user.id)
        .order_by(desc(Note.created_at))
    )
    notes = result.scalars().all()
    return APIResponse(success=True, data=[NoteOut.model_validate(n) for n in notes])


@router.post("", response_model=APIResponse[NoteOut], status_code=status.HTTP_201_CREATED)
async def create_note(
    body: NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = Note(user_id=current_user.id, title=body.title, content=body.content)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return APIResponse(success=True, data=NoteOut.model_validate(note))


@router.delete("/{note_id}", response_model=APIResponse[None])
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return APIResponse(success=True, data=None)
