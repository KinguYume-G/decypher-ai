# All Pydantic request/response schemas: APIResponse[T] wrapper, User/Task/Opportunity/Note/Chat types.
# 所有 Pydantic 请求/响应 Schema：通用 APIResponse[T] 包装格式及各业务实体的数据校验模型。
from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, EmailStr, Field, field_validator

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None = None
    error: str | None = None


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not 3 <= len(v) <= 100:
            raise ValueError("用户名长度必须在 3-100 字符之间")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("密码至少 8 位")
        if not any(c.isalpha() for c in v):
            raise ValueError("密码必须包含字母")
        if not any(c.isdigit() for c in v):
            raise ValueError("密码必须包含数字")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Task Schemas ──────────────────────────────────────────

VALID_SOURCES = {
    # 通用
    "github", "hackernews", "devto", "reddit", "producthunt",
    # 学术研究
    "arxiv", "openalex", "paperswithcode", "semanticscholar", "rss_research",
    # 商业市场
    "rss_market",
    # 创业机会
    "rss_startup",
    # 股市动态
    "sec", "rss_stocks",
    # 求职热点
    "stackexchange", "remoteok", "rss_jobs",
}
VALID_CATEGORIES = {"market", "research", "startup", "stocks", "jobs"}

# 各模块最优默认数据源组合（全部免费可用）
CATEGORY_DEFAULT_SOURCES: dict[str, list[str]] = {
    "startup":  ["github", "hackernews", "devto", "producthunt", "rss_startup"],
    "market":   ["github", "hackernews", "devto", "producthunt", "rss_market"],
    "research": ["arxiv", "openalex", "paperswithcode", "semanticscholar", "rss_research"],
    "stocks":   ["sec", "hackernews", "rss_stocks"],
    "jobs":     ["stackexchange", "remoteok", "devto", "rss_jobs"],
}


class TaskCreate(BaseModel):
    name: str
    keywords: list[str]
    sources: list[str]
    interval_seconds: int = 3600
    category: str = "startup"

    @field_validator("keywords")
    @classmethod
    def keywords_not_empty(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("关键词不能为空")
        if len(v) > 10:
            raise ValueError("关键词最多 10 个")
        return v

    @field_validator("sources")
    @classmethod
    def sources_valid(cls, v: list[str]) -> list[str]:
        invalid = set(v) - VALID_SOURCES
        if invalid:
            raise ValueError(f"不支持的数据源: {invalid}")
        return v

    @field_validator("interval_seconds")
    @classmethod
    def interval_minimum(cls, v: int) -> int:
        if v < 300:
            raise ValueError("执行间隔最少 300 秒（5分钟）")
        return v

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"不支持的模块分类: {v}，可选: {VALID_CATEGORIES}")
        return v


class TaskUpdate(BaseModel):
    name: str | None = None
    keywords: list[str] | None = None
    interval_seconds: int | None = None
    is_active: bool | None = None
    category: str | None = None


class TaskOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    name: str
    category: str
    keywords: list
    sources: list
    interval_seconds: int
    status: str
    is_active: bool
    last_run_at: datetime | None
    next_run_at: datetime | None
    run_count: int
    created_at: datetime


class AnalysisRunOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    task_id: int
    trigger: str
    status: str
    collected_count: int
    processed_count: int
    opportunity_count: int
    ai_provider: str | None
    ai_model: str | None
    error_code: str | None
    error_message: str | None
    started_at: datetime | None
    finished_at: datetime | None
    created_at: datetime


class ItemOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    task_id: int
    run_id: int
    source: str
    url: str
    title: str
    content: str
    score: int
    published_at: datetime | None
    collected_at: datetime


# ── Opportunity Schemas ───────────────────────────────────


class OpportunityOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    task_id: int
    category: str
    title: str
    what_to_build: str
    why_it_matters: str
    how_to_execute: str
    score_trend: float
    score_novelty: float
    score_competition: float
    score_feasibility: float
    score_commercial: float
    score_total: float
    keywords_matched: list
    source_signals: list
    is_favorited: bool = False
    created_at: datetime


# -- Chat Schemas -------------------------------------------------


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    opportunity_id: int | None = None
    conversation_history: list[ChatMessage] = Field(default_factory=list)
    report_mode: bool = False  # True → 生成结构化报告
    conversation_id: int | None = None

    @field_validator("message")
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("消息不能为空")
        return v.strip()


class ChatResponse(BaseModel):
    role: Literal["assistant"] = "assistant"
    content: str
    conversation_id: int | None = None
    citations: list[dict] = Field(default_factory=list)


class ConversationMessageOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    role: str
    content: str
    citations: list
    created_at: datetime


class ConversationOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    opportunity_id: int | None
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ConversationMessageOut] = Field(default_factory=list)


# ── Note Schemas ──────────────────────────────────────────


class NoteCreate(BaseModel):
    title: str
    content: str

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()[:300]

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Content cannot be empty")
        return v.strip()


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

    @field_validator("title")
    @classmethod
    def title_strip(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()[:300]
            if not v:
                raise ValueError("Title cannot be empty")
        return v

    @field_validator("content")
    @classmethod
    def content_strip(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Content cannot be empty")
        return v


class NoteOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    title: str
    content: str
    created_at: datetime
