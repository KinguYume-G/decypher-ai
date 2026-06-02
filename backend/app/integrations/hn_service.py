# Searches Hacker News stories and comments via the Algolia HN Search API (no auth required).
# 通过 Algolia HN Search API 搜索 Hacker News 帖子和评论（无需认证）。
import logging

import httpx

from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_HN_API = "https://hn.algolia.com/api/v1"
_MIN_POINTS = 10   # filter out low-signal noise
_HITS_PER_PAGE = 15


class HackerNewsService(BaseDataService):

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        # Algolia does natural-language search, so joining keywords works well
        query = " ".join(keywords)
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                res = await client.get(
                    f"{_HN_API}/search",
                    params={
                        "query": query,
                        "tags": "story",
                        "hitsPerPage": _HITS_PER_PAGE,
                        # Algolia uses numericFilters, not minPoints
                        "numericFilters": f"points>{_MIN_POINTS}",
                    },
                )
                res.raise_for_status()
                hits = res.json().get("hits", [])
                return [
                    RawSignal(
                        title=hit.get("title", ""),
                        # text posts (Ask HN) have story_text; link posts have url
                        body=hit.get("story_text") or "",
                        url=(
                            hit.get("url")
                            or f"https://news.ycombinator.com/item?id={hit['objectID']}"
                        ),
                        source="hackernews",
                        score=hit.get("points", 0),
                    )
                    for hit in hits
                    if hit.get("title")  # skip malformed entries
                ]
        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"HN search failed: {e}")
            return []


hn_service = HackerNewsService()
