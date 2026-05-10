import logging

from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)


class RedditService(BaseDataService):
    async def search(self, keywords: list[str]) -> list[RawSignal]:
        # Reddit OAuth2 integration is deferred to a future phase
        logger.debug("Reddit service is a placeholder; returning []")
        return []


reddit_service = RedditService()
