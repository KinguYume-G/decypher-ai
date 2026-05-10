# Decypher AI

![Decypher AI](https://img.shields.io/badge/Status-Alpha-orange) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791) ![Python](https://img.shields.io/badge/Python-3.11+-blue)

**Decypher AI** is an advanced, AI-driven intelligent decision and opportunity discovery engine. It continuously monitors high-value tech communities (GitHub, Hacker News, Reddit), processes discrete signals through Large Language Models (OpenAI/DeepSeek), and surfaces structured, high-confidence startup and investment opportunities in a "Cyber-Premium" dashboard.

## 🚀 Key Features

*   **Automated Agentic Pipeline**: Define target keywords and let the engine autonomously scrape, clean, and analyze market signals at scheduled intervals using APScheduler.
*   **Deep-Dive Chat Engine**: Real-time streaming (SSE) interactive chat with the "Decypher Core" AI to analyze generated opportunities, complete with visualizers and contextual sidebars.
*   **Bento-Box Dashboard**: A stunning, high-density glassmorphism UI built with Next.js and Tailwind CSS to monitor active forecasts, token usage, and system latency.
*   **Fully Asynchronous Backend**: FastAPI + asyncpg + SQLAlchemy 2.0 ensures maximum throughput without blocking the main thread during heavy I/O data collection.

---

## 🏗️ Technical Architecture

Decypher AI employs a modern, fully decoupled full-stack architecture designed for high concurrency and long-term maintainability.

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript 5.x
*   **Styling**: Tailwind CSS 3.4 (Custom "Cyber-Premium" Design System, Glassmorphism)
*   **State Management**: Zustand
*   **Data Fetching**: Axios

### Backend
*   **Framework**: FastAPI (ASGI)
*   **Language**: Python 3.11+
*   **Database ORM**: SQLAlchemy 2.0 (Async) & asyncpg
*   **Task Scheduling**: APScheduler (with Redis Job Store)
*   **Authentication**: JWT (python-jose) + bcrypt (passlib)
*   **AI Integration**: OpenAI Python SDK (DeepSeek Fallback)

### Infrastructure
*   **Primary DB**: PostgreSQL 15
*   **Cache & Job Store**: Redis 7
*   **Containerization**: Docker & Docker Compose

---

## 📂 Repository Structure

```text
Decypher AI/
├── backend/                  # FastAPI Backend Application
│   ├── app/                  # Main Application Package
│   │   ├── api/v1/           # HTTP RESTful API Routes
│   │   ├── core/             # Security (JWT) & Scheduler (APScheduler)
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── schemas/          # Pydantic Validation Schemas
│   │   ├── services/         # Business Logic (AI, Auth, Providers)
│   │   └── workers/          # Background AI Pipeline (Collector, Processor, Orchestrator)
│   ├── main.py               # ASGI Entrypoint
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/              # App Router Pages (login, dashboard, chat, tasks)
│   │   ├── components/       # Reusable React UI Components (AppShell, etc.)
│   │   ├── store/            # Zustand Global State
│   │   └── lib/              # API Clients & Utilities
│   └── package.json          # Node Dependencies
├── docs/                     # Technical Architecture & API Documentation
├── docker-compose.yml        # Local Infrastructure (Postgres, Redis)
└── .env                      # Global Environment Variables
```

---

## 💻 Quick Start & Local Development

### 1. Prerequisites
*   [Python 3.11+](https://www.python.org/)
*   [Node.js 20.x LTS](https://nodejs.org/)
*   [Docker Desktop 24+](https://www.docker.com/) (Ensure WSL2 is enabled on Windows)
*   [Git](https://git-scm.com/)

### 2. Environment Configuration
Create a `.env` file in the project root directory based on `.env.example`. You must provide:
```env
DECYPHER_SECRET_KEY=your_secure_random_key
DECYPHER_DATABASE_URL=postgresql+asyncpg://decypher:decypher123@localhost:5432/decypher_db
DECYPHER_REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk-your_actual_openai_key
DECYPHER_AI_PROVIDER=openai
NEXT_PUBLIC_API_URL=http://localhost:8000
DECYPHER_ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Start Infrastructure (Database & Redis)
Ensure Docker is running, then execute from the project root:
```powershell
docker compose up -d postgres redis
```
Verify the containers are healthy with `docker compose ps`.

### 4. Start the Backend (FastAPI)
Open a new terminal and run:
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Health Check*: Navigate to `http://localhost:8000/health` in your browser.

### 5. Start the Frontend (Next.js)
Open another terminal and run:
```powershell
cd frontend
npm install
npm run dev
```
*Access the App*: Navigate to `http://localhost:3000` to view the Decypher AI dashboard.

---

## 🔒 Security & Best Practices
*   **Never commit the `.env` file**. Always ensure your API keys and database credentials remain local.
*   The `.gitignore` is configured to exclude `node_modules`, `.venv`, `.next`, and Python cache files.
*   When deploying to production (e.g., Vercel / Railway), inject the environment variables via the platform's native secrets manager.

---
*Decypher AI - Intelligent Engine for Next-Gen Opportunities*
