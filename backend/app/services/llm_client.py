# OpenAI SDK wrapper: chat() returns a full string, stream() yields token chunks; all LLM calls route through here.
# OpenAI SDK 封装：chat() 同步返回完整字符串，stream() 异步逐 token 生成；所有大模型调用统一经此。
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


# ── 普通（非流式）调用 ──────────────────────────────────────────

async def chat_completion(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> str:
    if settings.ai_provider == "ollama":
        return await _ollama_completion(messages, max_tokens=max_tokens, temperature=temperature)
    return await _openai_completion(messages, max_tokens=max_tokens, temperature=temperature)


async def _ollama_completion(
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
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=300) as client:
        res = await client.post(url, json=payload)
        res.raise_for_status()
    return _extract_content(res.json())


async def _openai_completion(
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


# ── 流式调用 ────────────────────────────────────────────────────

async def chat_completion_stream(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[str, None]:
    """逐 token 产出字符串，供 SSE 端点使用。"""
    if settings.ai_provider == "ollama":
        async for chunk in _ollama_stream(messages, max_tokens=max_tokens, temperature=temperature):
            yield chunk
    else:
        async for chunk in _openai_stream(messages, max_tokens=max_tokens, temperature=temperature):
            yield chunk


async def _ollama_stream(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[str, None]:
    url = f"{settings.ollama_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.active_ai_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "stream": True,
    }
    import json
    async with httpx.AsyncClient(timeout=300) as client:
        async with client.stream("POST", url, json=payload) as res:
            res.raise_for_status()
            async for line in res.aiter_lines():
                line = line.strip()
                if not line or line == "data: [DONE]":
                    continue
                if line.startswith("data: "):
                    line = line[6:]
                try:
                    data = json.loads(line)
                    content = (
                        data.get("choices", [{}])[0]
                        .get("delta", {})
                        .get("content") or ""
                    )
                    if content:
                        yield content
                except (json.JSONDecodeError, IndexError):
                    continue


async def _openai_stream(
    messages: list[dict[str, str]],
    *,
    max_tokens: int,
    temperature: float,
) -> AsyncGenerator[str, None]:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(**settings.ai_client_kwargs)
    stream = await client.chat.completions.create(
        model=settings.active_ai_model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        stream=True,
    )
    async for chunk in stream:
        content = chunk.choices[0].delta.content or ""
        if content:
            yield content


# ── 工具函数 ─────────────────────────────────────────────────────

def _extract_content(data: dict[str, Any]) -> str:
    choices = data.get("choices") or []
    if not choices:
        return ""
    message = choices[0].get("message") or {}
    return str(message.get("content") or "")
