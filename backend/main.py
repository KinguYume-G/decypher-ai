from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 — 注册所有 ORM 模型，让 init_db 能建表
from app.api.v1 import auth, cards, chat, notes, opportunities, seed, tasks
from app.config import settings
from app.core.scheduler import scheduler
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Decypher AI",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/v1")
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(opportunities.router, prefix="/api/v1")
app.include_router(cards.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(notes.router, prefix="/api/v1")
app.include_router(seed.router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Decypher AI Backend", "version": "0.1.0"}
