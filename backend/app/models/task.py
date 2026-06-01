# Task ORM model: stores collection config (keywords, sources, schedule interval) and status machine; owned by User.
# Task ORM 模型：存储采集配置（关键词、数据源、调度间隔）及状态机；归属于 User。
import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base

VALID_CATEGORIES = {"market", "research", "startup", "stocks", "jobs"}


class TaskStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    paused = "paused"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    # 所属模块：market | research | startup | stocks | jobs
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="startup", index=True)
    keywords: Mapped[list] = mapped_column(JSON().with_variant(JSONB(), "postgresql"), nullable=False, default=list)
    sources: Mapped[list] = mapped_column(JSON().with_variant(JSONB(), "postgresql"), nullable=False, default=list)
    interval_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=3600)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), nullable=False, default=TaskStatus.pending)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    run_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="tasks")
    opportunities = relationship("Opportunity", back_populates="task", cascade="all, delete-orphan")
