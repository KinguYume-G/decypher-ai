# Queries SEC EDGAR full-text search for recent regulatory filings matching task keywords.
# 查询 SEC EDGAR 全文搜索接口，获取匹配任务关键词的最新监管文件。
import logging
from datetime import datetime, timedelta, timezone

import httpx

from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

# SEC EDGAR full-text search（公开 API，无需 Key）
_SEARCH_API = "https://efts.sec.gov/LATEST/search-index"
# SEC 要求 User-Agent 包含联系信息
_HEADERS = {"User-Agent": "DecypherAI/0.1.0 support@decypher.ai"}
_MAX_HITS = 10

# ⚠️ 免责声明：本模块仅采集公开信息用于研究目的，不构成投资建议
_DISCLAIMER = (
    "[DISCLAIMER: The following data is sourced from public SEC filings for "
    "research purposes only. It does NOT constitute investment advice.]"
)


class SECService(BaseDataService):
    """SEC EDGAR 全文搜索 — 无需 Key，适合股市动态模块（仅研究用途）。"""

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        query = " ".join(f'"{kw}"' for kw in keywords)
        # 只取最近 60 天的 8-K（重大事件）和 10-Q（季报）
        since = (datetime.now(timezone.utc) - timedelta(days=60)).strftime("%Y-%m-%d")
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        params = {
            "q": query,
            "forms": "8-K,10-Q",
            "dateRange": "custom",
            "startdt": since,
            "enddt": today,
            "_source": "file_date,entity_name,file_num,form_type,period_of_report,biz_location",
        }
        try:
            async with httpx.AsyncClient(timeout=20, headers=_HEADERS) as client:
                res = await client.get(_SEARCH_API, params=params)
                res.raise_for_status()

            hits = res.json().get("hits", {}).get("hits", [])[:_MAX_HITS]
            signals: list[RawSignal] = []
            for hit in hits:
                src = hit.get("_source", {})
                entity = src.get("entity_name", "Unknown Entity")
                form = src.get("form_type", "")
                period = src.get("period_of_report", "")
                file_date = src.get("file_date", "")
                file_num = hit.get("_id", "")

                title = f"{entity} — {form} ({period or file_date})"
                body = (
                    f"{_DISCLAIMER} "
                    f"Form {form} filed by {entity} on {file_date}. "
                    f"Period: {period}."
                )
                url = (
                    f"https://www.sec.gov/cgi-bin/browse-edgar"
                    f"?action=getcompany&filenum={file_num}&type={form}&dateb=&owner=include&count=10"
                )
                signals.append(
                    RawSignal(
                        title=title,
                        body=body,
                        url=url,
                        source="sec",
                        score=0,
                    )
                )
            logger.info(f"SEC EDGAR: {len(signals)} filings for keywords={keywords}")
            return signals

        except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
            logger.warning(f"SEC EDGAR search failed: {e}")
            return []


sec_service = SECService()
