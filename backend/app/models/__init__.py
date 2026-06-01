# Re-exports all ORM models so SQLAlchemy metadata sees them and init_db() creates every table.
# 统一导出所有 ORM 模型，确保 SQLAlchemy metadata 能感知到每张表，init_db() 才能正确建表。
from app.models.note import Note
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.models.user_favorite import UserFavorite

__all__ = ["User", "Task", "Opportunity", "UserFavorite", "Note"]
