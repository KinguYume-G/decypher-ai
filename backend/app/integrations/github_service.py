# Searches GitHub trending repos and issues via the authenticated REST API (5000 req/hr with token).
# 通过 GitHub 认证 REST API 搜索热门仓库和 Issue（带 Token 可达 5000 次/小时）。
import logging

import httpx

from app.config import settings
from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_GITHUB_API = "https://api.github.com"
_PER_PAGE = 10  # quality > quantity; keeps payload and token usage small


class GitHubService(BaseDataService):

    def _headers(self) -> dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if settings.github_token:
            headers["Authorization"] = f"Bearer {settings.github_token}"
        return headers

    def _build_query(self, keywords: list[str]) -> str:
        # Quote each keyword so multi-word phrases are treated as exact phrases
        return " OR ".join(f'"{kw}"' for kw in keywords)

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = self._build_query(keywords)
        async with httpx.AsyncClient(timeout=15) as client:
            issues = await self._search_issues(client, query)
            repos = await self._search_repos(client, query)
        return issues + repos

    async def _search_issues(
        self, client: httpx.AsyncClient, query: str
    ) -> list[RawSignal]:
        try:
            res = await client.get(
                f"{_GITHUB_API}/search/issues",
                # GitHub requires is:issue or is:pull-request when searching issues endpoint
                params={"q": f"{query} is:issue", "sort": "reactions", "per_page": _PER_PAGE},
                headers=self._headers(),
            )
            res.raise_for_status()
            return [
                RawSignal(
                    title=item["title"],
                    # truncate body here — processor will do deeper cleaning later
                    body=(item.get("body") or "")[:1000],
                    url=item["html_url"],
                    source="github",
                    score=item.get("reactions", {}).get("total_count", 0),
                )
                for item in res.json().get("items", [])
            ]
        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"GitHub issues search failed: {e}")
            return []

    async def _search_repos(
        self, client: httpx.AsyncClient, query: str
    ) -> list[RawSignal]:
        try:
            res = await client.get(
                f"{_GITHUB_API}/search/repositories",
                params={"q": query, "sort": "stars", "per_page": _PER_PAGE},
                headers=self._headers(),
            )
            res.raise_for_status()
            return [
                RawSignal(
                    title=item["full_name"],
                    body=item.get("description") or "",
                    url=item["html_url"],
                    source="github",
                    score=item.get("stargazers_count", 0),
                )
                for item in res.json().get("items", [])
            ]
        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"GitHub repos search failed: {e}")
            return []


github_service = GitHubService()
