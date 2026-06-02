# Pipeline layer 1: fans out to all configured data-source services concurrently and returns a flat list of RawSignals.
# Pipeline 第一层：并发调用所有配置的数据源 Service，汇总返回 RawSignal 列表。
import asyncio
import logging

from app.models.task import Task
from app.integrations.arxiv_service import arxiv_service
from app.integrations.base_data_service import RawSignal
from app.integrations.devto_service import devto_service
from app.integrations.github_service import github_service
from app.integrations.hn_service import hn_service
from app.integrations.openalex_service import openalex_service
from app.integrations.papers_with_code_service import papers_with_code_service
from app.integrations.producthunt_service import producthunt_service
from app.integrations.reddit_service import reddit_service
from app.integrations.remoteok_service import remoteok_service
from app.integrations.rss_service import (
    rss_jobs_service, rss_market_service, rss_research_service,
    rss_startup_service, rss_stocks_service,
)
from app.integrations.sec_service import sec_service
from app.integrations.semantic_scholar_service import semantic_scholar_service
from app.integrations.stackexchange_service import stackexchange_service

logger = logging.getLogger(__name__)

_SERVICE_MAP = {
    # ── 通用 ─────────────────────────────────────────────
    "github":             github_service,
    "hackernews":         hn_service,
    "devto":              devto_service,
    "reddit":             reddit_service,         # 有 Key 时自动生效
    "producthunt":        producthunt_service,    # 需 PRODUCTHUNT_API_KEY
    # ── 学术研究 ─────────────────────────────────────────
    "arxiv":              arxiv_service,
    "openalex":           openalex_service,
    "paperswithcode":     papers_with_code_service,
    "semanticscholar":    semantic_scholar_service,
    "rss_research":       rss_research_service,
    # ── 商业市场 ─────────────────────────────────────────
    "rss_market":         rss_market_service,
    # ── 创业机会 ─────────────────────────────────────────
    "rss_startup":        rss_startup_service,
    # ── 股市动态 ─────────────────────────────────────────
    "sec":                sec_service,
    "rss_stocks":         rss_stocks_service,
    # ── 求职热点 ─────────────────────────────────────────
    "stackexchange":      stackexchange_service,
    "remoteok":           remoteok_service,
    "rss_jobs":           rss_jobs_service,
}


async def collect(task: Task) -> list[RawSignal]:
    """
    Concurrently fetch signals from all sources listed in task.sources.
    Unknown sources are silently skipped; failed sources log and return [].
    """
    services = [
        _SERVICE_MAP[source]
        for source in task.sources
        if source in _SERVICE_MAP
    ]

    if not services:
        logger.warning(f"Task {task.id}: no valid sources configured")
        return []

    results = await asyncio.gather(
        *[svc.search(task.keywords) for svc in services],
        return_exceptions=True,
    )

    signals: list[RawSignal] = []
    for result in results:
        if isinstance(result, Exception):
            logger.error(f"Task {task.id}: source error: {result}")
        else:
            signals.extend(result)

    logger.info(f"Task {task.id}: collected {len(signals)} raw signals")
    return signals
