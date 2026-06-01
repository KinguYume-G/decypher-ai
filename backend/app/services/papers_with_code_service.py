import logging

import httpx

from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_API = "https://paperswithcode.com/api/v1/papers/"
_HEADERS = {"User-Agent": "DecypherAI/0.1.0"}


class PapersWithCodeService(BaseDataService):
    """Papers With Code — ML/AI 论文 + 开源实现数量，免费，无需 Key。"""

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = " ".join(keywords)
        params = {
            "q": query,
            "ordering": "-github_link_count",
            "page_size": 12,
        }
        try:
            async with httpx.AsyncClient(
                timeout=20, headers=_HEADERS, follow_redirects=True
            ) as client:
                res = await client.get(_API, params=params)
                res.raise_for_status()

            results = res.json().get("results", [])
            signals: list[RawSignal] = []
            for paper in results:
                title = paper.get("title", "")
                abstract = paper.get("abstract") or ""
                url = paper.get("url_pdf") or paper.get("paper_url") or ""
                if not title:
                    continue
                github_count = paper.get("github_link_count", 0)
                signals.append(
                    RawSignal(
                        title=title,
                        body=abstract[:800],
                        url=url or f"https://paperswithcode.com/paper/{title.lower().replace(' ', '-')}",
                        source="paperswithcode",
                        score=github_count,
                    )
                )
            logger.info(f"PapersWithCode: {len(signals)} papers for keywords={keywords}")
            return signals
        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"PapersWithCode search failed: {e}")
            return []


papers_with_code_service = PapersWithCodeService()
