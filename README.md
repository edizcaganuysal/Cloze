# Cloze

AI sales copilot that turns every rep into your best closer. Cloze ingests your company context, researches your prospects, and delivers real-time coaching during live calls — powered by models fine-tuned on your top performers' actual conversations.

## What Makes Cloze Different

Most sales tools record calls and give you a summary after it's over. Cloze coaches reps **while they're still on the call** — with suggestions that are grounded in your company's products, your prospect's business, and the conversation patterns that actually close deals at your org.

1. **Upload your company URL** — Cloze scrapes and extracts your offerings, pricing, differentiators, and company details automatically. No manual data entry.
2. **Import or find leads** — Pull leads from Apollo or upload your own lists. Cloze enriches each prospect with web search and scraping to build a profile before the call even starts.
3. **Fine-tune on your best reps** — Train the coaching model on recorded conversations from your top closers. The AI learns the exact patterns, phrases, and strategies that win deals at your company — then coaches every other rep to sell the same way.
4. **Call with real-time coaching** — During live calls, the copilot engine streams contextual suggestions, objection responses, proof points, and stage-aware nudges directly to the rep's screen.

## Features

### Real-Time Call Coaching
Live AI suggestions streamed to the rep during active calls. The copilot engine tracks conversation stage, detects objections, analyzes sentiment, and delivers the right talking point at the right moment — using your company context, product catalog, prospect research, and RAG-retrieved documents.

### Prospect Intelligence
Automated lead enrichment via Apollo API, web search, and web scraping. Before the call starts, Cloze builds a detailed profile of the prospect's company, role, pain points, and priorities — so the rep walks in prepared and the AI can tailor suggestions to that specific buyer.

### Fine-Tuned Coaching Models
Every organization can train the coaching model on their own top performers' call recordings. The AI learns org-specific selling patterns — which discovery questions lead to closed deals, how your best reps handle objections, what proof points resonate — and teaches those patterns to the rest of the team.

### Practice Mode
AI-simulated prospect conversations for training reps before real calls. The simulated prospect responds realistically based on the target persona while the full coaching engine runs in parallel, giving the rep practice with live feedback.

### Autonomous AI Caller
A fully autonomous AI sales rep that handles outbound calls end-to-end. It uses the same copilot engine, the same company context, and the same fine-tuned model — so it sells the way your best reps do, at scale.

### Adaptive Coach Memory
The AI remembers context across calls — what worked, what objections came up, what stage a deal is in. Coaching improves over time as the engine accumulates signal from each conversation.

### Playbook Engine
Multi-stage sales playbooks with checklists, intent weights, and automatic progression tracking. Define your sales process once; the AI enforces it in real time and knows exactly where each call stands.

### Vector RAG
Semantic retrieval over uploaded company documents, case studies, battle cards, and product specs. The engine pulls the most relevant context for each moment in the conversation — not generic advice, but your actual proof points and competitive intel.

### Automatic Company Onboarding
Paste your company URL and Cloze extracts everything — product offerings, pricing tiers, value propositions, competitive positioning. The system is ready to coach on your first call.

### Agent Marketplace
Create, share, and approve custom coaching agents. Admins can publish org-wide agents; reps can build personal ones. Approval workflows keep quality high.

### Call Analytics
Post-call summaries, full transcripts, performance scoring, and trend analysis. Track how reps improve over time and which coaching patterns drive results.

### Multi-Tenant RBAC
Organization-scoped access with Admin, Manager, and Rep roles. Per-org governance for agent approval, publishing policies, and data retention.

### Usage-Based Billing
Credit system tied to actual AI costs. Per-feature ledger tracking with transparent pricing — no hidden fees, pay for what you use.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS 10, Fastify, Socket.io, TypeScript |
| Database | PostgreSQL 16, Drizzle ORM, pgvector |
| Cache | Redis 7 |
| AI | OpenAI GPT-4o, OpenAI Realtime API, OpenAI TTS, OpenAI Embeddings, fine-tuned models |
| Telephony | Twilio (outbound calls, Media Streams, TwiML) |
| Speech-to-Text | Deepgram (real-time streaming transcription) |
| Lead Enrichment | Apollo API, web search, web scraping |
| Monorepo | pnpm workspaces, Turborepo |
| Deployment | Railway, Cloudflare |

## Architecture

```
                              ┌──────────────┐
                              │   Apollo +   │
                              │  Web Scraper │  Prospect research
                              └──────┬───────┘
                                     │
┌──────────┐   Twilio Media    ┌─────▼─────┐   Deepgram     ┌─────────┐
│  Phone   │───── Stream ─────▶│    API    │──── Audio ────▶│   STT   │
│  Call    │                   │  Gateway  │                │ Service │
└──────────┘                   └─────┬─────┘                └────┬────┘
                                     │                           │
                                     │     transcript lines      │
                                     ▼                           │
┌──────────┐               ┌───────────────┐◀────────────────────┘
│ pgvector │──── RAG ─────▶│    Copilot    │
│ Docs +   │               │    Engine     │──── Fine-tuned LLM ──▶ suggestions
│ Products │               └───────┬───────┘                        nudges
└──────────┘                       │                                objections
                                WebSocket                           sentiment
                                   │
                              ┌────▼──────┐
                              │  Web UI   │  Live coaching
                              │ (Next.js) │  dashboard
                              └───────────┘
```

1. **Before the call** — Cloze enriches the prospect via Apollo, web search, and scraping. Company context and product catalog are already loaded from the onboarding URL scrape.
2. **Call starts** — Audio streams through Twilio Media Streams to the API gateway. Deepgram transcribes in real time.
3. **Every utterance** — The Copilot Engine processes each transcript update with full context: company brief, prospect research, RAG-retrieved documents, playbook stage, product catalog, coach memory, and the fine-tuned model trained on your top reps.
4. **Real-time output** — Engine emits structured guidance (suggestions, objection responses, proof points, stage nudges, sentiment) via WebSocket to the live coaching UI.

### Call Modes

| Mode | Description |
| --- | --- |
| `OUTBOUND` | Real phone call with live AI coaching sidebar for the rep |
| `MOCK` | Practice call against an AI-simulated prospect with full coaching feedback |
| `AI_CALLER` | Fully autonomous AI sales rep that handles the call end-to-end |

## Repository Structure

```
cloze/
├── apps/
│   ├── api/                 # NestJS backend
│   │   └── src/
│   │       ├── calls/       # Copilot engine, Twilio, media streams, LLM, STT
│   │       ├── agents/      # Coaching agent CRUD + approval workflow
│   │       ├── playbooks/   # Sales playbooks + stage management
│   │       ├── products/    # Product catalog
│   │       ├── org/         # Org settings, company profiles, sales context
│   │       ├── embeddings/  # Vector RAG with pgvector + OpenAI embeddings
│   │       ├── ingest/      # Document ingestion → chunking → embedding pipeline
│   │       ├── credits/     # Credit ledger + usage billing
│   │       └── auth/        # JWT + Passport.js authentication
│   └── web/                 # Next.js frontend
│       └── app/
│           ├── (marketing)/ # Landing page, pricing, book demo
│           └── app/         # Dashboard, dialer, live calls, training, admin
├── packages/
│   └── shared/              # Shared types, zod schemas, RBAC helpers, enums
├── infra/
│   ├── docker-compose.yml
│   └── .env.example
└── supabase/
    └── sql/                 # Database migrations
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for PostgreSQL + Redis)

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp infra/.env.example apps/api/.env
cp infra/.env.example apps/web/.env.local

# Start infrastructure
docker compose -f infra/docker-compose.yml up -d

# Run database migrations and seed
pnpm --filter @live-sales-coach/api db:generate
pnpm --filter @live-sales-coach/api db:migrate
pnpm --filter @live-sales-coach/api db:seed

# Start dev servers
pnpm dev
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:3001`.

## License

Proprietary. All rights reserved.
