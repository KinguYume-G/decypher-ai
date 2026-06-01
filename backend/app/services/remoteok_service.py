# Scrapes the Remote OK JSON endpoint for remote tech job listings matching task keywords.
# 抓取 Remote OK JSON 接口，获取匹配任务关键词的远程科技职位信息。
import logging

import httpx

from app.services.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

# Remote OK 公开 API，无需 Key，无需注册
_API = "https://remoteok.com/api"
_HEADERS = {
    "User-Agent": "DecypherAI/0.1.0 (https://decypher.ai)",
    "Accept": "application/json",
}
_MAX_RESULTS = 20


class RemoteOKService(BaseDataService):
    """
    Remote OK 远程职位 API — 无需 Key，完全免费。
    适合求职热点模块：通过真实职位 tags 判断哪些技术栈正在爆发。
    """

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        signals: list[RawSignal] = []
        seen: set[str] = set()

        async with httpx.AsyncClient(timeout=20, headers=_HEADERS) as client:
            for keyword in keywords[:3]:
                tag = keyword.lower().replace(" ", "-").replace("_", "-")
                try:
                    res = await client.get(_API, params={"tag": tag})
                    res.raise_for_status()

                    # Remote OK 第一条是 legal notice，跳过
                    items = res.json()
                    if items and isinstance(items[0], dict) and "legal" in items[0]:
                        items = items[1:]

                    for job in items[:_MAX_RESULTS]:
                        url = job.get("url", "") or f"https://remoteok.com/remote-jobs/{job.get('id', '')}"
                        if not url or url in seen:
                            continue
                        seen.add(url)

                        company = job.get("company", "Unknown")
                        position = job.get("position", "")
                        description = job.get("description") or ""
                        tags = job.get("tags") or []

                        title = f"{position} @ {company}"
                        body = (
                            f"Skills: {', '.join(tags[:8])}. "
                            + description[:400]
                        )

                        signals.append(
                            RawSignal(
                                title=title,
                                body=body,
                                url=url,
                                source="remoteok",
                                # 用 epoch 作为时效性权重（越新 score 越高）
                                score=int(job.get("epoch", 0)) // 1_000_000,
                            )
                        )

                except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                    logger.warning(f"Remote OK search failed for '{keyword}': {e}")

        signals.sort(key=lambda s: s.score, reverse=True)
        logger.info(f"RemoteOK: {len(signals)} jobs for keywords={keywords}")
        return signals


remoteok_service = RemoteOKService()
