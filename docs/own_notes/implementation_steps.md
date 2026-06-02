## Set up Alembic — before any schema changes

You're about to add an ```items``` table for RAG. Do Alembic setup first, otherwise you'll have no migration history:

```
cd backend
pip install alembic
alembic init alembic
```

Then edit ```alembic/env.py``` to import your models and point to ```DECYPHER_DATABASE_URL```. Generate the baseline migration from the current schema:

```
alembic revision --autogenerate -m "baseline"
alembic upgrade head
```

From this point forward, every new table or column change goes through alembic revision --autogenerate.

---

## Core product loop — after the above

Once architecture is clean, tackle Phase 1 in this order (each depends on the previous):

**1. Backend first:** Verify cards.py properly filters by ```?category=```. If it does, the frontend tab work is unblocked.
**2. Frontend — tab filtering:** In dashboard/page.tsx, add ```activeModule``` state and pass it to ```useCards({ category: activeModule })```. The roadmap.md already has the exact code spec for this.
**3. Frontend — ```selectedCard``` global state:** Add ```selectedCard``` + ```setSelectedCard``` to store/index.ts. Then in OpportunityCard.tsx, call ```setSelectedCard(card)``` on click.
**4. Frontend — AI Analyst linkage:** The right-side chat panel needs to watch ```selectedCard```. When it changes, pre-populate the chat context with that card's title and scores. This is the most important UX change — it's what makes the product feel like an analyst rather than a chatbot.

---

## What to skip for now

The ```integrations/``` split and ```pipeline_service.py``` are two mornings of work max — do them before writing new features, not after
Don't touch multi-agent routing (```market_agent.py```, ```orchestrator_agent.py``` from the roadmap) until the core loop is validated by real users
RAG (```items``` table + pgvector) comes after Phase 1 — it's the right next step, but the product needs to work without it first