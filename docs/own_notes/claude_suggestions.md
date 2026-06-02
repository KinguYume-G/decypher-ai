Good bones — the data pipeline, auth, and API layer are all functional. But commercialization requires three separate problems to be solved in order: the product must work first, then it must be useful, then it must be monetizable. Rushing to step 3 without step 1 is the most common mistake.

---

## 1. Fix the core loop first (2 weeks)

Your product's signature promise is: click a card → right-side AI Analyst loads its context → ask questions → get cited answers. That loop is currently broken in two places per status.md:

- Five-tab module filtering doesn't actually filter (cosmetic only)
- Card selection → AI Analyst linkage doesn't work

Everything else is secondary. A user who opens the product and clicks a card expecting the AI to respond to it — and nothing happens — will leave and never come back. The architecture is built for this feature, it just needs to be wired up. Your roadmap.md Phase 1 is exactly right on what to do.

**Also fix before real users:**

- ```source_signals``` in ```orchestrator.py``` is hardcoded to ```[]``` — that's a silent data loss bug
- Switch ```create_all``` → Alembic before you have any production data. Once you have users, schema changes without migrations will cause downtime or data loss.

---

## 2. Pick one module and own it

The product currently tries to be excellent for 5 completely different audiences simultaneously: founders, researchers, investors, job seekers, and tech generalists. That's not a product, it's a portal. Portals compete against Google and lose.

**Pick the 创业机会 (Startup Opportunity) module as your beachhead.** The reasons:

- Clearest, most acute pain: founders/indie hackers manually scan HN/Product Hunt/GitHub daily looking for market gaps — it's tedious and they know it
- Your scoring model (trend + novelty + competition + feasibility + commercial) is uniquely valuable for this use case
- This audience is easy to reach: Indie Hackers, HN, Twitter/X builders
- Your cross-module signal correlation (one LangGraph signal appears in market + research + jobs + startup) is a genuine differentiator here — no competitor does this

Make that one module so good that users tell other founders about it. Then expand.

---

## 3. RAG is not optional — it's the product

Right now the AI Analyst is a chatbot that happens to be open next to some cards. The actual vision — *AI that cites specific signals when answering* — requires RAG. Without it, users quickly realize they could just use ChatGPT.

The roadmap.md Phase 3 RAG implementation is architecturally sound. Specifically:

- ```items``` table + store raw signals (not just opportunities)
- pgvector on PostgreSQL (you already have Postgres, zero extra infra)
- When a user asks "why is this a good opportunity?", retrieve the 5 most similar raw signals and inject them into the prompt

This is what makes the AI Analyst genuinely useful vs just impressive-looking.

---

## 4. Monetization comes after validated utility

Don't build a paywall before you know users get value. The sequence:

1. Get 10–20 target users (founders/indie hackers) using it for real
2. Watch what they actually do (add basic analytics — which tabs, which cards, how often they chat)
3. Find the behavior that predicts "this person would pay" — probably: creates a task → checks it the next day → asks follow-up questions
4. Only then add Stripe

Natural pricing for this product: freemium with a usage cap (e.g., 2 tasks free, unlimited paid at ~$20/month). The paid version's value is depth and frequency, not access — so free users still experience the core product.

---

## What NOT to do right now

- Don't build the reporting/周报 feature yet (Phase 3+) — nobody's validated the core loop
- Don't build multi-agent orchestration (orchestrator_agent.py, market_agent.py etc.) yet — one good prompt beats five mediocre specialized ones at this stage
- Don't build mobile until the web product is validated
- Don't add more data sources — 15+ is already more than enough

---

## Concrete order of work

| Week | Focus |
|-|-|
| 1–2 | Phase 1 roadmap: tab filtering, card→AI Analyst linkage, fix source_signals bug, Alembic migration |
| 3–4 | Items table + pgvector + RAG chat (turns AI Analyst from cosmetic to functional) |
| 5–6 | Double down on 创业机会 module: better scoring, better prompt, get 10 real users |
| 7–8 | Usage analytics, onboarding flow, Stripe integration |

The product has a real differentiating idea — multi-source signal aggregation + structured scoring + contextual AI Analyst. That combination doesn't exist as a focused tool. But right now the core interaction is broken, and you're a week's work away from having something you can actually show people.