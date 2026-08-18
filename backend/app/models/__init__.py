# Re-exports all ORM models so SQLAlchemy metadata sees them and init_db() creates every table.
# 统一导出所有 ORM 模型，确保 SQLAlchemy metadata 能感知到每张表，init_db() 才能正确建表。
from app.models.analysis_run import AnalysisRun, RunStatus
from app.models.conversation import Conversation
from app.models.conversation_message import ConversationMessage
from app.models.item import Item
from app.models.note import Note
from app.models.opportunity import Opportunity
from app.models.task import Task
from app.models.user import User
from app.models.user_favorite import UserFavorite

__all__ = [
    "AnalysisRun", "RunStatus", "Conversation", "ConversationMessage", "Item",
    "User", "Task", "Opportunity", "UserFavorite", "Note",
]
