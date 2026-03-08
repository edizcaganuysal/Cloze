# Sales AI

A web-first, multi-tenant B2B sales coaching platform. AI listens to outbound sales calls in real time and gives reps clean, focused guidance — live suggestions, objection detection, nudges, and sentiment analysis.

## Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| Web          | Next.js 15 (App Router) · React 18 · TypeScript · Tailwind · shadcn/ui |
| API          | NestJS 10 · WebSocket Gateway (Socket.io) · TypeScript        |
| Database     | PostgreSQL 16 (Supabase cloud or local Docker)                |
| ORM          | drizzle-orm · drizzle-kit                                     |
| Cache/PubSub | Redis 7                                                       |
| AI/LLM       | OpenAI (gpt-4o) · Anthropic · Azure OpenAI                   |
| STT          | Deepgram (real-time transcription)                            |
| Dialer       | Twilio (outbound calls, Media Streams)                        |
| Vector DB    | PostgreSQL pgvector (semantic RAG)                            |
| Monorepo     | pnpm 9+ · Turborepo 2                                        |

---

## Repository Structure

```
sales-ai/
├── apps/
│   ├── api/             # NestJS backend    → http://localhost:3001
│   └── web/             # Next.js frontend  → http://localhost:3000
├── packages/
│   └── shared/          # Shared types, zod schemas, RBAC helpers, enums
├── infra/
│   ├── docker-compose.yml
│   └── .env.example
├── supabase/
│   └── sql/             # Database migrations
├── package.json         # pnpm workspace root
└── turbo.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9 — `npm i -g pnpm`
- [Docker Desktop](https://www.docker.com/) (for Postgres + Redis)

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp infra/.env.example infra/.env
cp infra/.env.example apps/api/.env
cp infra/.env.example apps/web/.env.local
```

Minimum required for local dev:

| Variable       | Value (dev default)                                  |
| -------------- | ---------------------------------------------------- |
| `DATABASE_URL` | `postgresql://lsc:lsc_dev_pass@localhost:5432/lsc_db` |
| `REDIS_URL`    | `redis://:lsc_redis_pass@localhost:6379`             |
| `JWT_SECRET`   | any long random string                               |

### 3. Start infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 4. Run database migrations

```bash
pnpm --filter @live-sales-coach/api db:generate
pnpm --filter @live-sales-coach/api db:migrate
pnpm --filter @live-sales-coach/api db:seed
```

### 5. Start dev servers

```bash
pnpm dev
```

| App    | URL                         |
| ------ | --------------------------- |
| Web    | http://localhost:3000       |
| API    | http://localhost:3001       |
| Health | http://localhost:3001/health |

### Seed defaults

| What           | Value                              |
| -------------- | ---------------------------------- |
| Org            | Demo Organization                  |
| Admin email    | `admin@example.com`                |
| Admin password | `Password123!`                     |
| Playbook       | Default Sales Playbook (5 stages)  |
| Agent          | Default Coach (APPROVED, ORG)      |

Override via env: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

---

## Architecture

### How It Works

```
┌─────────┐    Twilio     ┌─────────┐   Deepgram    ┌──────────┐
│  Phone  │───Media Stream──▶│   API   │───Real-time───▶│   STT    │
│  Call   │                │ Gateway │    audio      │  Service │
└─────────┘                └────┬────┘               └────┬─────┘
                                │                         │
                                │    transcript lines     │
                                ▼                         │
                          ┌──────────┐◀───────────────────┘
                          │  Copilot │
                          │  Engine  │──── LLM (GPT-4o) ────▶ suggestions
                          └────┬─────┘                        nudges
                               │                              objections
                          WebSocket                           sentiment
                               │
                          ┌────▼─────┐
                          │  Web UI  │  Live coaching cards
                          │ (Next.js)│  for the sales rep
                          └──────────┘
```

1. Rep initiates a call (outbound via Twilio, mock practice, or AI caller)
2. Audio streams through Twilio Media Streams to the API
3. Deepgram transcribes in real time
4. The **Copilot Engine** processes each transcript update with full context (company brief, RAG chunks, playbook, coach memory, fundamental rules)
5. Engine emits suggestions, nudges, objection alerts, and sentiment via WebSocket
6. The live coaching UI renders guidance in real time

### Call Modes

| Mode          | Description                                    |
| ------------- | ---------------------------------------------- |
| `OUTBOUND`    | Real Twilio call with live AI coaching          |
| `MOCK`        | Practice call with AI-simulated prospect        |
| `AI_CALLER`   | Fully autonomous AI caller via Realtime API     |

### Multi-Tenant RBAC

Roles: `ADMIN > MANAGER > REP`

| Action                   | ADMIN | MANAGER               | REP             |
| ------------------------ | ----- | --------------------- | --------------- |
| Manage org settings      | ✓     |                       |                 |
| Publish ORG agents       | ✓     | if `ADMIN_AND_MANAGERS` |               |
| Create personal agents   | ✓     | ✓                     | if org allows   |
| Approve personal agents  | ✓     | ✓                     |                 |
| View all org calls       | ✓     | ✓                     | own calls only  |

### Org Governance Settings

| Setting                  | Options                              |
| ------------------------ | ------------------------------------ |
| `requiresAgentApproval`  | `true` / `false`                     |
| `allowRepAgentCreation`  | `true` / `false`                     |
| `publisherPolicy`        | `ADMIN_ONLY` / `ADMIN_AND_MANAGERS`  |
| `liveLayoutDefault`      | `MINIMAL` / `STANDARD` / `TRANSCRIPT` |
| `retentionDays`          | `30` / `90` / `365`                  |

### Live Coach UI Layouts

| Layout       | Suggestion    | Nudges              | Transcript         |
| ------------ | ------------- | ------------------- | ------------------ |
| `MINIMAL`    | Large card    | 1–2 chips           | Drawer button only |
| `STANDARD`   | Large card    | 3 chips + checklist | Slide-over drawer  |
| `TRANSCRIPT` | Floating card | Minimal             | Center stage       |

---

## Database Schema

### Core Tables

| Table               | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `orgs`              | Organizations (multi-tenant root)                    |
| `org_settings`      | Governance config (approval, publishing, retention)  |
| `org_company_profiles` | Rich company context (15+ text fields)            |
| `sales_context`     | Sales strategy (competitors, case studies, etc.)     |
| `users`             | Users with role (`ADMIN`/`MANAGER`/`REP`) + status  |
| `agents`            | Coaching agents (scope: `PERSONAL`/`ORG`, approval workflow) |
| `playbooks`         | Sales playbooks                                      |
| `playbook_stages`   | Stages with checklists + intent weights              |
| `products`          | Product catalog with pricing, objections, FAQs       |

### Call Tables

| Table               | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `calls`             | Call records (mode, type, status, Twilio SID, coach memory) |
| `call_transcript`   | Transcript lines (speaker, text, timestamp, is_final) |
| `call_suggestions`  | Live suggestions (PRIMARY / ALTERNATIVE)             |
| `call_summaries`    | Post-call summaries + outcome                        |

### Infrastructure Tables

| Table               | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `embedding_chunks`  | Vector RAG chunks (pgvector, 1536-dim embeddings)    |
| `ingestion_jobs`    | Document ingestion tracking                          |
| `credit_ledger`     | Credit billing history                               |
| `org_subscription`  | Plan + credits balance                               |

### Option A — Supabase (recommended for production)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the **Direct connection** string from **Settings → Database**
3. Set as `DATABASE_URL` in `apps/api/.env`

### Option B — Local Docker

```bash
docker compose -f infra/docker-compose.yml up -d
# DATABASE_URL already points to localhost in .env.example
```

---

## Feature Flags

All flags default to `false`. Defined in `apps/api/src/config/feature-flags.ts`.

| Flag                        | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `VECTOR_RAG_ENABLED`        | pgvector semantic RAG vs keyword RAG             |
| `NEW_OUTPUT_SCHEMA`         | New output schema (say/intent/reason format)     |
| `ENGINE_AS_AI_CALLER_BRAIN` | Engine-driven AI Caller vs direct Realtime API   |
| `ENGINE_AS_MOCK_BRAIN`      | Engine-driven Mock Call vs Realtime persona       |
| `AI_CALLER_TTS_FALLBACK`    | Separate TTS vs Realtime text injection          |
| `FINE_TUNED_MODEL_ENABLED`  | Fine-tuned model vs base model                   |

---

## API Modules

| Module        | Path                   | Description                              |
| ------------- | ---------------------- | ---------------------------------------- |
| Auth          | `src/auth/`            | JWT + Passport.js authentication         |
| Calls         | `src/calls/`           | Engine, Twilio, Media Streams, LLM, STT  |
| Agents        | `src/agents/`          | Agent CRUD + approval workflow           |
| Playbooks     | `src/playbooks/`       | Sales playbooks + stages                 |
| Products      | `src/products/`        | Product catalog                          |
| Org           | `src/org/`             | Org settings, company profiles, sales context |
| Embeddings    | `src/embeddings/`      | Vector RAG with pgvector + OpenAI embeddings |
| Ingest        | `src/ingest/`          | Document ingestion → embedding pipeline  |
| Billing       | `src/billing/`         | Credit ledger, subscriptions             |
| Support       | `src/support/`         | Support tickets                          |

---

## Frontend Routes

| Route                  | Description                     |
| ---------------------- | ------------------------------- |
| `/app/home`            | Dashboard                       |
| `/app/calls`           | Call list                       |
| `/app/calls/[id]/live` | Live coaching UI                |
| `/app/dialer`          | Practice / real call dialer     |
| `/app/training`        | Training mode                   |
| `/app/context`         | Sales context editor            |
| `/app/admin/*`         | Admin (agents, playbooks, products, requests) |
| `/app/settings`        | Org settings, company profile   |

---

## Environment Variables

### API — `apps/api/.env`

| Variable                  | Description                            | Example                        |
| ------------------------- | -------------------------------------- | ------------------------------ |
| `NODE_ENV`                | Environment                            | `development`                  |
| `PORT`                    | API port                               | `3001`                         |
| `DATABASE_URL`            | PostgreSQL connection string           | `postgresql://...`             |
| `REDIS_URL`               | Redis connection string                | `redis://:pass@localhost:6379` |
| `WEB_ORIGIN`              | Allowed web origin(s), comma-separated | `http://localhost:3000`        |
| `JWT_SECRET`              | JWT signing secret                     | random string                  |
| `JWT_EXPIRES_IN`          | JWT expiry                             | `7d`                           |
| `TWILIO_ACCOUNT_SID`      | Twilio Account SID                     | `ACxxx...`                     |
| `TWILIO_AUTH_TOKEN`        | Twilio Auth Token                      | `xxx...`                       |
| `TWILIO_FROM_NUMBER`       | Outbound caller ID                     | `+15551234567`                 |
| `TWILIO_TWIML_APP_SID`    | TwiML App SID                          | `APxxx...`                     |
| `TWILIO_WEBHOOK_BASE_URL`  | Public base URL (ngrok in dev)         | `https://xyz.ngrok.io`         |
| `STT_PROVIDER`            | Speech-to-text provider                | `deepgram`                     |
| `STT_API_KEY`             | STT API key                            | `...`                          |
| `LLM_PROVIDER`            | LLM provider                           | `openai`                       |
| `LLM_API_KEY`             | LLM API key                            | `sk-...`                       |
| `LLM_MODEL`               | Model ID                               | `gpt-4o`                       |
| `LLM_BASE_URL`            | Custom base URL (optional)             | _(blank = provider default)_   |
| `SEED_ADMIN_EMAIL`        | Admin email for `db:seed`              | `admin@example.com`            |
| `SEED_ADMIN_PASSWORD`     | Admin password for `db:seed`           | `Password123!`                 |

### Web — `apps/web/.env.local`

| Variable               | Description          | Example                      |
| ---------------------- | -------------------- | ---------------------------- |
| `APP_BASE_URL`         | Web base URL         | `http://localhost:3000`      |
| `API_BASE_URL`         | API base URL         | `http://localhost:3001`      |
| `NEXT_PUBLIC_WS_URL`   | WebSocket URL        | `ws://localhost:3001`        |
| `NEXT_PUBLIC_APP_NAME` | Display name         | `Sales AI`                   |

---

## Shared Package

`packages/shared/src/` — used by both API and Web for type safety.

| File          | Exports                                                |
| ------------- | ------------------------------------------------------ |
| `enums.ts`    | `Role`, `AgentScope`, `AgentStatus`, `GuidanceLevel`, `LiveLayout`, etc. |
| `types.ts`    | TypeScript interfaces for all entities                 |
| `schemas.ts`  | Zod validation schemas (Org, User, Agent, Call, etc.)  |
| `rbac.ts`     | RBAC helper functions                                  |

---

## Commands Reference

```bash
# Dev
pnpm dev                           # Start all apps (Turbo)
pnpm --filter @live-sales-coach/web dev   # Web only
pnpm --filter @live-sales-coach/api dev   # API only

# Build
pnpm build                         # Build all apps

# Database
pnpm --filter @live-sales-coach/api db:generate   # Generate migrations
pnpm --filter @live-sales-coach/api db:migrate    # Apply migrations
pnpm --filter @live-sales-coach/api db:seed       # Seed defaults

# Quality
pnpm lint                          # ESLint
pnpm format                        # Prettier
pnpm type-check                    # TypeScript check

# Test
pnpm test                          # Run tests (Jest)
pnpm test:watch                    # Watch mode
pnpm test:cov                      # Coverage

# Infrastructure
docker compose -f infra/docker-compose.yml up -d    # Start Postgres + Redis
docker compose -f infra/docker-compose.yml down      # Stop
```

---

## Deployment

### Railway (recommended)

1. Create two services from this repo:
   - **API**: Build `pnpm --filter @live-sales-coach/api build`, Start `pnpm --filter @live-sales-coach/api start`
   - **Web**: Build `pnpm --filter @live-sales-coach/web build`, Start `pnpm --filter @live-sales-coach/web start`
2. Set env vars for both services
3. Deploy API first, then Web
4. Configure Twilio webhooks:
   - TwiML: `https://<api-domain>/calls/twiml?callId={CALL_ID}`
   - Status: `https://<api-domain>/calls/webhook/status`
   - Media Stream: `wss://<api-domain>/media-stream`

### Smoke Tests

```bash
curl https://<api-domain>/health
# Open https://<web-domain>/login → log in → confirm /app/home loads
# Start a mock call → verify live suggestions appear
```

See `DEPLOYMENT.md` for full Railway setup instructions.
