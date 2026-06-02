# Searches Stack Overflow/Exchange questions via the Stack Exchange API.
# 通过 Stack Exchange API 搜索 Stack Overflow 及相关社区的问题。
import logging

import httpx

from app.config import settings
from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_API = "https://api.stackexchange.com/2.3"
# Stack Exchange 返回 gzip 压缩数据，httpx 自动解压
_PER_PAGE = 15
_MIN_SCORE = 5


class StackExchangeService(BaseDataService):
    """
    Stack Exchange API — 无需 Key（300次/天），有 Key（STACKEXCHANGE_API_KEY）后升至 10000次/天。
    适合求职热点模块。
    """

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = " ".join(keywords)
        params: dict = {
            "q": query,
            "site": "stackoverflow",
            "order": "desc",
            "sort": "votes",
            "pagesize": _PER_PAGE,
        }
        # 有 key 时附带，自动提升配额
        api_key = getattr(settings, "stackexchange_api_key", "")
        if api_key:
            params["key"] = api_key
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                res = await client.get(f"{_API}/search/advanced", params=params)
                res.raise_for_status()

            items = res.json().get("items", [])
            signals: list[RawSignal] = []
            for item in items:
                score = item.get("score", 0)
                if score < _MIN_SCORE:
                    continue
                title = item.get("title", "")
                body = item.get("body_markdown") or item.get("excerpt") or ""
                url = item.get("link", "")
                if not title or not url:
                    continue
                signals.append(
                    RawSignal(
                        title=title,
                        body=body[:800],
                        url=url,
                        source="stackexchange",
                        score=score,
                    )
                )
            logger.info(f"StackExchange: {len(signals)} questions for keywords={keywords}")
            return signals

        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"StackExchange search failed: {e}")
            return []


stackexchange_service = StackExchangeService()
