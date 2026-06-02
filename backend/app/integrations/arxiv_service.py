# Fetches academic paper abstracts from the arXiv API filtered by search query.
# 调用 arXiv API，按搜索关键词获取学术论文摘要。
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

import httpx

from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_API = "https://export.arxiv.org/api/query"
_NS = {"atom": "http://www.w3.org/2005/Atom"}
_MAX_RESULTS = 12


class ArxivService(BaseDataService):
    """arXiv Atom API — 无需 Key，适合学术研究模块。"""

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = " OR ".join(f'abs:"{kw}"' for kw in keywords)
        # 只取最近 90 天的论文，减少噪音
        since = (datetime.now(timezone.utc) - timedelta(days=90)).strftime("%Y%m%d%H%M%S")
        params = {
            "search_query": f"({query}) AND submittedDate:[{since} TO 99991231235959]",
            "start": 0,
            "max_results": _MAX_RESULTS,
            "sortBy": "lastUpdatedDate",
            "sortOrder": "descending",
        }
        try:
            async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
                res = await client.get(_API, params=params)
                res.raise_for_status()

            root = ET.fromstring(res.text)
            signals: list[RawSignal] = []
            for entry in root.findall("atom:entry", _NS):
                title = _text(entry, "atom:title")
                summary = _text(entry, "atom:summary")
                arxiv_id = _text(entry, "atom:id")  # e.g. http://arxiv.org/abs/2401.12345v1
                if not title or not arxiv_id:
                    continue
                signals.append(
                    RawSignal(
                        title=title.replace("\n", " ").strip(),
                        body=(summary or "").replace("\n", " ").strip()[:800],
                        url=arxiv_id.strip(),
                        source="arxiv",
                        score=0,  # arXiv 无公开 citation 数，按发布时间排序
                    )
                )
            logger.info(f"arXiv: {len(signals)} papers for keywords={keywords}")
            return signals

        except (httpx.TimeoutException, httpx.HTTPStatusError, ET.ParseError) as e:
            logger.warning(f"arXiv search failed: {e}")
            return []


def _text(element: ET.Element, path: str) -> str:
    node = element.find(path, _NS)
    return (node.text or "") if node is not None else ""


arxiv_service = ArxivService()
