# Queries the OpenAlex open-access academic graph API for research works matching task keywords.
# 查询 OpenAlex 开放学术图谱 API，获取匹配任务关键词的研究成果。
import logging

import httpx

from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_API = "https://api.openalex.org/works"
# 加 mailto 可进入 polite pool（速率更高）
_HEADERS = {"User-Agent": "DecypherAI/0.1.0 (mailto:support@decypher.ai)"}
_PER_PAGE = 10


class OpenAlexService(BaseDataService):
    """OpenAlex 开放学术 API — 无需 Key，提供引用量、DOI、摘要。"""

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = " ".join(keywords)
        params = {
            "filter": f"title.search:{query}",
            "sort": "cited_by_count:desc",
            "per-page": _PER_PAGE,
            "select": "id,title,abstract_inverted_index,doi,cited_by_count,primary_location",
        }
        try:
            async with httpx.AsyncClient(timeout=20, headers=_HEADERS) as client:
                res = await client.get(_API, params=params)
                res.raise_for_status()

            works = res.json().get("results", [])
            signals: list[RawSignal] = []
            for w in works:
                title = w.get("title") or ""
                if not title:
                    continue
                abstract = _reconstruct_abstract(w.get("abstract_inverted_index") or {})
                doi = w.get("doi") or ""
                url = (
                    (w.get("primary_location") or {}).get("landing_page_url")
                    or (f"https://doi.org/{doi}" if doi else w.get("id", ""))
                )
                citations = w.get("cited_by_count", 0)
                signals.append(
                    RawSignal(
                        title=title,
                        body=abstract[:800],
                        url=url,
                        source="openalex",
                        score=citations,
                    )
                )
            logger.info(f"OpenAlex: {len(signals)} works for keywords={keywords}")
            return signals

        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"OpenAlex search failed: {e}")
            return []


def _reconstruct_abstract(inverted: dict) -> str:
    """OpenAlex 把摘要存成倒排索引 {word: [pos1, pos2, ...]}，还原为文本。"""
    if not inverted:
        return ""
    position_word: list[tuple[int, str]] = []
    for word, positions in inverted.items():
        for pos in positions:
            position_word.append((pos, word))
    position_word.sort()
    return " ".join(w for _, w in position_word)


openalex_service = OpenAlexService()
