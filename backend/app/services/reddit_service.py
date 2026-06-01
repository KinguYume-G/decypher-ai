# Placeholder Reddit service; OAuth2 integration is not yet implemented — search() returns an empty list.
# Reddit 占位服务；OAuth2 对接尚未完成，search() 目前固定返回空列表。
import logging

from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)


class RedditService(BaseDataService):
    async def search(self, keywords: list[str]) -> list[RawSignal]:
        # Reddit OAuth2 integration is deferred to a future phase
        logger.debug("Reddit service is a placeholder; returning []")
        return []


reddit_service = RedditService()
