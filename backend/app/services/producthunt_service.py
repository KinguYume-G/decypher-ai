import logging

import httpx

from app.config import settings
from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_GRAPHQL_URL = "https://api.producthunt.com/v2/api/graphql"
_QUERY = """
query SearchPosts($query: String!) {
  posts(first: 15, order: VOTES, query: $query) {
    edges {
      node {
        id
        name
        tagline
        description
        votesCount
        url
        topics { edges { node { name } } }
      }
    }
  }
}
"""


class ProductHuntService(BaseDataService):
    """Product Hunt GraphQL API — 需要 PRODUCTHUNT_API_KEY。无 Key 时返回 []。"""

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        token = getattr(settings, "producthunt_api_key", "")
        if not token:
            logger.debug("ProductHunt: no API key configured, skipping")
            return []

        query = " ".join(keywords)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                res = await client.post(
                    _GRAPHQL_URL,
                    json={"query": _QUERY, "variables": {"query": query}},
                    headers=headers,
                )
                res.raise_for_status()

            edges = (
                res.json()
                .get("data", {})
                .get("posts", {})
                .get("edges", [])
            )
            signals: list[RawSignal] = []
            for edge in edges:
                node = edge.get("node", {})
                name = node.get("name", "")
                tagline = node.get("tagline", "")
                description = node.get("description") or ""
                votes = node.get("votesCount", 0)
                url = node.get("url", "")
                if not name or not url:
                    continue
                body = f"{tagline}. {description}"
                signals.append(
                    RawSignal(
                        title=name,
                        body=body[:800],
                        url=url,
                        source="producthunt",
                        score=votes,
                    )
                )
            logger.info(f"ProductHunt: {len(signals)} posts for keywords={keywords}")
            return signals

        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"ProductHunt search failed: {e}")
            return []


producthunt_service = ProductHuntService()
