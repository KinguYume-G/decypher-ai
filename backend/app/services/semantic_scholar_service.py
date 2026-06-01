import logging

import httpx

from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_API = "https://api.semanticscholar.org/graph/v1/paper/search"
_HEADERS = {"User-Agent": "DecypherAI/0.1.0"}
_FIELDS = "title,abstract,year,citationCount,externalIds,openAccessPdf"


class SemanticScholarService(BaseDataService):
    """Semantic Scholar — AI/ML 聚焦学术搜索，引用量排序，免费，无需 Key（100次/5分钟）。"""

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = " ".join(keywords)
        params = {
            "query": query,
            "fields": _FIELDS,
            "limit": 10,
        }
        try:
            async with httpx.AsyncClient(timeout=20, headers=_HEADERS) as client:
                res = await client.get(_API, params=params)
                res.raise_for_status()

            papers = res.json().get("data", [])
            signals: list[RawSignal] = []
            for paper in papers:
                title = paper.get("title", "")
                abstract = paper.get("abstract") or ""
                citations = paper.get("citationCount", 0)

                # 优先取开放获取 PDF，否则用 DOI
                pdf_info = paper.get("openAccessPdf") or {}
                doi = (paper.get("externalIds") or {}).get("DOI", "")
                url = pdf_info.get("url") or (f"https://doi.org/{doi}" if doi else "")

                if not title:
                    continue

                signals.append(
                    RawSignal(
                        title=title,
                        body=abstract[:800],
                        url=url,
                        source="semanticscholar",
                        score=citations,
                    )
                )
            logger.info(f"SemanticScholar: {len(signals)} papers for keywords={keywords}")
            return signals
        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"SemanticScholar search failed: {e}")
            return []


semantic_scholar_service = SemanticScholarService()
