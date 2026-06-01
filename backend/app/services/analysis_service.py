# Converts a formatted signal text block into structured Opportunity JSON with 5-dimension scores via the LLM.
# 调用 LLM 将格式化后的信号文本块转化为含 5 维评分的结构化 Opportunity JSON。
import json
import logging
import re

from app.config import settings
from app.services.agents import get_system_prompt
from app.services.llm_client import chat_completion

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> dict:
    """
    Parse JSON from LLM output robustly.
    Handles: qwen3 <think> blocks, markdown code fences, raw JSON.
    """
    text = text.strip()

    # Strip qwen3 thinking blocks — JSON lives after </think>
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    # Strip markdown code fences by removing the delimiters, not capturing inside them
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    text = text.strip()

    # Direct parse (works when model outputs clean JSON after fence stripping)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Last resort: greedily match outermost {...} block
    brace = re.search(r"\{[\s\S]*\}", text)
    if brace:
        try:
            return json.loads(brace.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"No valid JSON found in response (first 300 chars): {text[:300]}")


class AnalysisService:
    async def analyze_signals(
        self,
        signals_text: str,
        keywords: list[str],
        category: str = "startup",
    ) -> list[dict]:
        """
        Send processed signals to the LLM using the category-specific prompt.
        Contract: never raises — returns [] on any failure.
        """
        if not signals_text.strip():
            return []

        system_prompt = get_system_prompt(category)
        # /no_think disables qwen3's extended thinking mode → much faster JSON output
        user_message = (
            "/no_think\n"
            f"Module: {category}\n"
            f"Keywords being tracked: {', '.join(keywords)}\n\n"
            f"Signals:\n{signals_text}"
        )

        try:
            raw = await chat_completion(
                [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                max_tokens=settings.ai_max_tokens,
                temperature=0.7,
            )
            data = _extract_json(raw)
            opportunities = data.get("opportunities", [])
            logger.info(f"AI returned {len(opportunities)} opportunities")
            return opportunities

        except (ValueError, json.JSONDecodeError) as e:
            logger.error(f"AI returned unparseable response: {e}")
            return []
        except Exception as e:
            logger.error(f"AI analysis failed ({type(e).__name__}): {e!r}")
            return []


analysis_service = AnalysisService()
