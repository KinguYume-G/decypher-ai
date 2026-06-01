from datetime import datetime

from sqlalchemy import Float, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base
from sqlalchemy.dialects.postgresql import JSONB


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # 继承自 task.category：market | research | startup | stocks | jobs
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="startup", index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    what_to_build: Mapped[str] = mapped_column(Text, nullable=False)
    why_it_matters: Mapped[str] = mapped_column(Text, nullable=False)
    how_to_execute: Mapped[str] = mapped_column(Text, nullable=False)

    score_trend: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    score_novelty: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    score_competition: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    score_feasibility: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    score_commercial: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    score_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    source_signals: Mapped[list] = mapped_column(
        JSON().with_variant(JSONB(), "postgresql"), nullable=False, default=list
    )
    keywords_matched: Mapped[list] = mapped_column(
        JSON().with_variant(JSONB(), "postgresql"), nullable=False, default=list
    )

    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), nullable=False
    )

    task = relationship("Task", back_populates="opportunities")
    # favorites 关联由 UserFavorite 的 FK cascade 管理；不在此定义关系以避免懒加载

    __table_args__ = (
        Index("idx_opportunities_category", "category"),
        Index("idx_opportunities_score_total", "score_total"),
        Index("idx_opportunities_created_at", "created_at"),
    )
