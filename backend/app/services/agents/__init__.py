# Exports get_system_prompt() — the per-category LLM system prompt factory used by analysis_service.
# 导出 get_system_prompt()，按分类返回对应 LLM 系统提示词，由 analysis_service 调用。
from app.services.agents.prompts import get_system_prompt

__all__ = ["get_system_prompt"]
