import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def chat_completion(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> str:
    if settings.ai_provider == "ollama":
        return await _ollama_chat_completion(messages, max_tokens=max_tokens, temperature=temperature)

    return await _openai_compatible_chat_completion(
        messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )


async def _ollama_chat_completion(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> str:
    url = f"{settings.ollama_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.active_ai_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=180) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

    return _extract_content(data)


async def _openai_compatible_chat_completion(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> str:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(**settings.ai_client_kwargs)
    response = await client.chat.completions.create(
        model=settings.active_ai_model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content or ""


def _extract_content(data: dict[str, Any]) -> str:
    choices = data.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    return str(message.get("content") or "")
