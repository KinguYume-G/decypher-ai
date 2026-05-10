import logging

from app.config import settings
from app.models.opportunity import Opportunity
from app.schemas import ChatMessage
from app.services.llm_client import chat_completion

logger = logging.getLogger(__name__)


class ChatService:
    async def reply(
        self,
        message: str,
        history: list[ChatMessage],
        opportunity: Opportunity | None = None,
    ) -> str:
        context = self._format_opportunity(opportunity)
        fallback = self._fallback_reply(message, opportunity)

        try:
            content = await chat_completion(
                [
                    {
                        "role": "system",
                        "content": (
                            "You are Decypher Core, a concise startup opportunity analyst. "
                            "Give direct, practical answers. Focus on risk, validation, MVP scope, "
                            "customer segment, and next actions. Avoid hype."
                        ),
                    },
                    {"role": "user", "content": context},
                    *[
                        {"role": item.role, "content": item.content}
                        for item in history[-8:]
                    ],
                    {"role": "user", "content": message},
                ],
                max_tokens=min(settings.ai_max_tokens, 1200),
                temperature=0.4,
            )
            return content.strip() or fallback
        except Exception as e:
            logger.warning(f"Chat completion failed, returning fallback: {e}")
            return fallback

    def _format_opportunity(self, opportunity: Opportunity | None) -> str:
        if opportunity is None:
            return "No selected opportunity. Answer as a general product strategy analyst."

        return (
            "Selected opportunity:\n"
            f"Title: {opportunity.title}\n"
            f"What to build: {opportunity.what_to_build}\n"
            f"Why it matters: {opportunity.why_it_matters}\n"
            f"How to execute: {opportunity.how_to_execute}\n"
            f"Scores: trend={opportunity.score_trend}, novelty={opportunity.score_novelty}, "
            f"competition={opportunity.score_competition}, feasibility={opportunity.score_feasibility}, "
            f"commercial={opportunity.score_commercial}, total={opportunity.score_total}\n"
            f"Keywords: {', '.join(opportunity.keywords_matched or [])}"
        )

    def _fallback_reply(self, message: str, opportunity: Opportunity | None) -> str:
        subject = opportunity.title if opportunity else "this idea"
        return (
            f"Here is a practical read on {subject}:\n\n"
            "1. Validate demand first: interview 8-12 target users and confirm the problem is urgent, recurring, and budgeted.\n"
            "2. Keep the MVP narrow: build one workflow that turns raw signals into one clear decision or saved hour.\n"
            "3. Watch the risk: noisy data, weak differentiation, and unclear buyer ownership are the biggest blockers.\n"
            "4. Next step: define the first customer profile, one success metric, and a 2-week prototype scope."
        )


chat_service = ChatService()
