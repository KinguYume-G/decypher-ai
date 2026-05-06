from datetime import datetime
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, EmailStr, field_validator

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

VALID_SOURCES = {"github", "hackernews", "reddit"}


class TaskCreate(BaseModel):
    name: str
    keywords: list[str]
    sources: list[str]
    interval_seconds: int = 3600

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


class TaskUpdate(BaseModel):
    name: str | None = None
    keywords: list[str] | None = None
    interval_seconds: int | None = None
    is_active: bool | None = None


class TaskOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    name: str
    keywords: list
    sources: list
    interval_seconds: int
    status: str
    is_active: bool
    last_run_at: datetime | None
    next_run_at: datetime | None
    run_count: int
    created_at: datetime
