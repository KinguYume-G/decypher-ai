import json
import logging
import re

from app.config import settings
from app.services.llm_client import chat_completion

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are a startup opportunity analyst. Analyze signals from GitHub and Hacker News.
Extract 2-4 concrete startup opportunities from the signals provided.

Respond ONLY with valid JSON in exactly this structure (no markdown, no code fences, no explanation):
{
  "opportunities": [
    {
      "title": "Opportunity title (max 15 words)",
      "what_to_build": "Concrete product description (2-3 sentences)",
      "why_it_matters": "Why this opportunity exists now, with evidence from the signals (2-3 sentences)",
      "how_to_execute": "Step-by-step MVP approach (2-3 sentences)",
      "scores": {
        "trend": 8.0,
        "novelty": 7.0,
        "competition": 3.0,
        "feasibility": 8.0,
        "commercial": 7.5
      },
      "keywords_matched": ["keyword1", "keyword2"]
    }
  ]
}

Score guide (1-10):
- trend: How strongly is this trending right now?
- novelty: How unique/novel is this idea?
- competition: How crowded is the space? (lower = less competition = better)
- feasibility: How feasible is a small-team MVP?
- commercial: How clear is the monetization path?
"""


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
        self, signals_text: str, keywords: list[str]
    ) -> list[dict]:
        """
        Send processed signals to the LLM and return structured opportunity dicts.
        Contract: never raises — returns [] on any failure.
        """
        if not signals_text.strip():
            return []

        user_message = (
            f"Keywords being tracked: {', '.join(keywords)}\n\n"
            f"Signals:\n{signals_text}"
        )

        try:
            raw = await chat_completion(
                [
                    {"role": "system", "content": _SYSTEM_PROMPT},
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
            logger.error(f"AI analysis failed: {e}")
            return []


analysis_service = AnalysisService()
