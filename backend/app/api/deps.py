# FastAPI dependency functions: get_db() injects AsyncSession, get_current_user() validates Bearer JWT and returns User.
# FastAPI 依赖函数：get_db() 注入 AsyncSession，get_current_user() 验证 Bearer JWT 并返回当前用户对象。
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User

# auto_error=False 让我们自己返回 401，而不是 FastAPI 默认的 403
bearer_scheme = HTTPBearer(auto_error=False)

_UNAUTH = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="未认证或 Token 已过期",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise _UNAUTH

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise _UNAUTH

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise _UNAUTH

    return user
