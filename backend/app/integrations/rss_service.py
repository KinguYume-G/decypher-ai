# Generic async RSS/Atom feed parser (RSS 2.0 + Atom 1.0); instantiated once per feed URL, no feedparser dependency.
# 通用异步 RSS/Atom 解析器（支持 RSS 2.0 和 Atom 1.0）；每个 feed URL 实例化一次，无需 feedparser 依赖。
"""
通用 RSS / Atom 采集器。
支持 RSS 2.0 和 Atom 1.0，用 httpx + ElementTree 解析，无需 feedparser 依赖。
"""
import logging
import xml.etree.ElementTree as ET
from dataclasses import dataclass

import httpx

from app.integrations.base_data_service import BaseDataService, RawSignal

logger = logging.getLogger(__name__)

# Atom 命名空间
_ATOM_NS = "http://www.w3.org/2005/Atom"

# 各模块的 RSS 源（全部免费，无需 Key）
RSS_FEEDS_BY_CATEGORY: dict[str, list[dict]] = {
    "market": [
        {"url": "https://techcrunch.com/feed/", "label": "TechCrunch"},
        {"url": "https://venturebeat.com/feed/", "label": "VentureBeat"},
        {"url": "https://feeds.technologyreview.com/technologyreview-index", "label": "MIT Tech Review"},
    ],
    "research": [
        {"url": "https://blog.ml.cmu.edu/feed/", "label": "CMU ML Blog"},
        {"url": "https://bair.berkeley.edu/blog/feed.xml", "label": "BAIR Blog"},
    ],
    "startup": [
        {"url": "https://news.ycombinator.com/rss", "label": "HN RSS"},
        {"url": "https://lobste.rs/rss", "label": "Lobste.rs"},
    ],
    "stocks": [
        {"url": "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", "label": "WSJ Markets"},
    ],
    "jobs": [
        {"url": "https://weworkremotely.com/remote-jobs.rss", "label": "We Work Remotely"},
        {"url": "https://remotive.com/rss/remote-jobs/software-dev", "label": "Remotive Dev"},
    ],
}


class RSSService(BaseDataService):
    """
    通用 RSS 采集器。
    category 决定从哪些 feed 抓取；keywords 用于标题过滤。
    """

    def __init__(self, category: str = "market"):
        self.category = category
        self.feeds = RSS_FEEDS_BY_CATEGORY.get(category, [])

    async def search(self, keywords: list[str]) -> list[RawSignal]:
        kw_lower = [k.lower() for k in keywords]
        signals: list[RawSignal] = []
        seen: set[str] = set()

        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "DecypherAI/0.1.0"}) as client:
            for feed in self.feeds:
                try:
                    res = await client.get(feed["url"])
                    if res.status_code != 200:
                        continue
                    entries = _parse_feed(res.text)
                    for entry in entries:
                        # 关键词过滤（标题或摘要包含任意关键词）
                        combined = (entry.title + " " + entry.body).lower()
                        if kw_lower and not any(kw in combined for kw in kw_lower):
                            continue
                        if entry.url in seen:
                            continue
                        seen.add(entry.url)
                        signals.append(
                            RawSignal(
                                title=entry.title,
                                body=entry.body[:800],
                                url=entry.url,
                                source=f"rss_{feed['label'].lower().replace(' ', '_')}",
                                score=0,
                            )
                        )
                except Exception as e:
                    logger.warning(f"RSS fetch failed for {feed['url']}: {e}")

        logger.info(f"RSS[{self.category}]: {len(signals)} entries for keywords={keywords}")
        return signals[:20]


@dataclass
class _Entry:
    title: str
    body: str
    url: str


def _parse_feed(xml_text: str) -> list[_Entry]:
    """解析 RSS 2.0 或 Atom 1.0 格式。"""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return []

    tag = root.tag.lower()

    if "rss" in tag:
        return _parse_rss(root)
    if "feed" in tag:
        return _parse_atom(root)
    return []


def _parse_rss(root: ET.Element) -> list[_Entry]:
    entries: list[_Entry] = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        desc  = (item.findtext("description") or "").strip()
        link  = (item.findtext("link") or "").strip()
        if title and link:
            entries.append(_Entry(title=title, body=_strip_html(desc), url=link))
    return entries


def _parse_atom(root: ET.Element) -> list[_Entry]:
    ns = {"a": _ATOM_NS}
    entries: list[_Entry] = []
    for entry in root.findall("a:entry", ns):
        title   = (entry.findtext("a:title", "", ns) or "").strip()
        summary = (entry.findtext("a:summary", "", ns) or "").strip()
        link_el = entry.find("a:link[@rel='alternate']", ns) or entry.find("a:link", ns)
        link    = (link_el.get("href", "") if link_el is not None else "").strip()
        if title and link:
            entries.append(_Entry(title=title, body=_strip_html(summary), url=link))
    return entries


def _strip_html(text: str) -> str:
    """粗略去除 HTML 标签。"""
    import re
    return re.sub(r"<[^>]+>", " ", text).strip()


# 每个模块一个实例
rss_market_service   = RSSService("market")
rss_research_service = RSSService("research")
rss_startup_service  = RSSService("startup")
rss_stocks_service   = RSSService("stocks")
rss_jobs_service     = RSSService("jobs")
