# Pipeline layer 2: deduplicates by URL, ranks by score, truncates body text, and formats into one AI-ready string.
# Pipeline 第二层：按 URL 去重、按分数排序、截断正文，拼接为供 AI 消费的单一文本块。
import logging

from app.integrations.base_data_service import RawSignal

logger = logging.getLogger(__name__)

_MAX_BODY_CHARS = 300   # per-signal body truncation
_MAX_TOTAL_CHARS = 8000  # total context budget for the AI prompt


def process(signals: list[RawSignal]) -> str:
    """
    Deduplicate, rank, and format raw signals into a text blob for the AI.
    Returns empty string if nothing survives.
    """
    if not signals:
        return ""

    # Deduplicate by URL
    seen: set[str] = set()
    unique: list[RawSignal] = []
    for s in signals:
        if s.url not in seen:
            seen.add(s.url)
            unique.append(s)

    # Highest-engagement signals first
    unique.sort(key=lambda s: s.score, reverse=True)

    lines: list[str] = []
    total = 0

    for i, s in enumerate(unique, 1):
        body = s.body[:_MAX_BODY_CHARS].strip()
        entry = (
            f"{i}. [{s.source.upper()}] {s.title}\n"
            f"   URL: {s.url}\n"
            f"   Score: {s.score}\n"
            + (f"   Summary: {body}\n" if body else "")
            + "\n"
        )
        if total + len(entry) > _MAX_TOTAL_CHARS:
            break
        lines.append(entry)
        total += len(entry)

    logger.info(
        f"Processor: {len(unique)} unique signals → {len(lines)} after budget trim"
    )
    return "".join(lines)
