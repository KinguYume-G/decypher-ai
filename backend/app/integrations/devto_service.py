# Fetches recent tech articles from the Dev.to public REST API.
# 调用 Dev.to 公开 REST API 获取最新技术文章。
import logging

import httpx

from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

_API = "https://dev.to/api"
# DEV.to 不需要 API Key，加 User-Agent 是礼貌做法
_HEADERS = {
    "User-Agent": "DecypherAI/0.1.0 (https://decypher.ai)",
    "Accept": "application/json",
}
_PER_PAGE = 15
_MIN_REACTIONS = 5  # 过滤极低互动的文章


class DevToService(BaseDataService):
    """
    DEV.to 开发者社区 API — 无需 Key，完全免费，适合全部模块。
    覆盖创业/市场/技术/AI 等高质量开发者内容。
    """

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        # DEV.to 支持 tag 搜索和关键词搜索两种方式
        # 对每个关键词做一次搜索，合并结果
        signals: list[RawSignal] = []
        seen_urls: set[str] = set()

        async with httpx.AsyncClient(timeout=20, headers=_HEADERS) as client:
            for keyword in keywords[:3]:
                try:
                    # Use the stable /articles endpoint with tag filter
                    tag = keyword.lower().replace(" ", "").replace("-", "")
                    res = await client.get(
                        f"{_API}/articles",
                        params={"tag": tag, "per_page": _PER_PAGE, "top": 7},
                    )
                    res.raise_for_status()
                    articles = res.json()

                    for article in articles:
                        reactions = article.get("public_reactions_count", 0)
                        if reactions < _MIN_REACTIONS:
                            continue
                        url = article.get("url", "")
                        if not url or url in seen_urls:
                            continue
                        seen_urls.add(url)

                        title = article.get("title", "")
                        description = article.get("description") or ""
                        tags = article.get("tag_list") or []
                        body = f"{description} Tags: {', '.join(tags)}" if tags else description

                        signals.append(
                            RawSignal(
                                title=title,
                                body=body[:800],
                                url=url,
                                source="devto",
                                score=reactions + article.get("comments_count", 0),
                            )
                        )
                except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                    logger.warning(f"DEV.to search failed for '{keyword}': {e}")

        # 按互动分数降序
        signals.sort(key=lambda s: s.score, reverse=True)
        logger.info(f"DEV.to: {len(signals)} articles for keywords={keywords}")
        return signals[:_PER_PAGE]


devto_service = DevToService()
