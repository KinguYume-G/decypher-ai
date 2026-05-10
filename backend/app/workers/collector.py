import asyncio
import logging

from app.models.task import Task
from app.services.base_data_service import RawSignal
from app.services.github_service import github_service
from app.services.hn_service import hn_service
from app.services.reddit_service import reddit_service

logger = logging.getLogger(__name__)

_SERVICE_MAP = {
    "github": github_service,
    "hackernews": hn_service,
    "reddit": reddit_service,
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
