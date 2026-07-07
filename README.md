# AdReel — AI UGC Ad Generator

Turn a product and one idea into a scroll-stopping **vertical ad video** for TikTok, Reels &
Shorts. AdReel writes the script, voices it, picks up an AI avatar, burns animated captions,
and renders a ready-to-post 1080×1920 MP4 — all on your own machine, at **$0 per render**.

It's a real SaaS: email/password auth, a credit economy, subscription tiers, and a rendering
worker. Built to run free/local today and go live the moment you add Stripe keys and deploy.

---

## Why this is free to run

The entire generation pipeline uses local tools — no paid AI APIs:

| Stage | Free/local default | Pluggable upgrade |
|-------|--------------------|-------------------|
| Script | **Ollama** (local LLM); deterministic template fallback | any LLM |
| Voiceover | macOS **`say`** → mp3 (silent fallback elsewhere) | Piper / Kokoro |
| Captions | duration-estimated word timing | Whisper (word-accurate) |
| Avatar | still portrait + **Ken-Burns** motion via ffmpeg | GPU lip-sync (SadTalker/Wav2Lip) |
| Compose | **ffmpeg** filtergraph → H.264 MP4 + thumbnail | — |

Every stage is a swappable provider (`src/providers/*`) selected by env, so upgrading one
piece never touches the rest.

> **Honest scope note:** photoreal lip-sync needs a GPU and isn't part of the free default.
> The default ships the caption-driven UGC format that dominates the feed anyway; lip-sync is
> wired as a provider (`AVATAR_PROVIDER=lipsync` + `LIPSYNC_ENDPOINT`) for when you add a GPU.

---

## Prerequisites

- **Node 20.6+** (22 recommended — the worker uses `process.loadEnvFile`)
- **ffmpeg** + **ffprobe** on your PATH (`brew install ffmpeg`)
- **Ollama** *(optional)* for AI scripts: `brew install ollama && ollama pull llama3.2`
  (without it, a built-in template writer is used — the app never hard-fails)
- macOS gives you `say` for free voiceover. On Linux, install Piper (or a silent track is used).

## Quick start

```bash
npm install
cp .env.example .env
# generate a session secret and drop it into AUTH_SECRET:
openssl rand -base64 32

npm run db:migrate     # create the SQLite database
npm run db:seed        # seed avatars + voices (also generates avatar art)

# Two processes:
npm run dev            # the Next.js app  → http://localhost:3000
npm run worker         # the render worker (processes the queue)
```

Then: sign up → **New Ad** → complete the wizard → watch the render progress → your MP4
plays in the library. No external API keys required.

---

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Next.js dev server |
| `npm run worker` | Polls the queue and renders jobs with ffmpeg |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Production server (after build) |
| `npm run db:migrate` / `db:seed` / `db:reset` | Database lifecycle |
| `npm run test` | Vitest (plans, utils, credit-ledger money path) |

## Configuration

All config lives in `.env` and is validated at startup (`src/lib/env.ts`). Only `AUTH_SECRET`
and `DATABASE_URL` are required; every AI/billing provider has a free/local default. See
`.env.example` for the annotated list (script/TTS/caption/avatar providers, Ollama, billing).

## Monetization

- **Plans & credits** are defined in one file: `src/lib/plans.ts`
  (Free / Starter $39 / Growth $99 / Scale $299). Each render costs credits; plans grant a
  monthly allotment. The ledger is append-only (`CreditLedger`), balance = sum of deltas.
- **Billing provider** is selected by `BILLING_PROVIDER`:
  - `mock` (default) — upgrades fulfill locally and grant credits, so you can demo the entire
    paywall with **zero Stripe setup**.
  - `stripe` — set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the three
    `STRIPE_PRICE_*` ids. Checkout → `src/lib/billing/stripe.ts`; the webhook
    (`/api/stripe/webhook`) syncs subscriptions and grants credits on purchase + renewal.

## Architecture

```
app/(marketing)   landing, pricing, auth        app/api           job status, media, webhook
app/(app)         dashboard, wizard, library     src/lib           auth, db, credits, jobs, billing
src/providers     swappable AI adapters          src/pipeline      ffmpeg compose + orchestrator
src/worker        queue poller                    prisma            schema + seed
```

Data flow: the wizard calls `startRenderAction` → `enqueueRender` reserves credits and inserts
a `queued` RenderJob → the **worker** claims it, runs script→TTS→captions→compose, writes the
MP4 to `storage/renders/<jobId>/`, and marks it `done` (or `failed`, which refunds the credit).
The UI polls `/api/jobs/<id>` for live progress; finished videos stream from `/api/media/*`
with per-user ownership checks and HTTP Range support.

## Production notes

- **Database:** swap `DATABASE_URL` for Postgres and change the Prisma `provider` — no app
  changes needed.
- **Storage:** renders write to `storage/` (gitignored). Front with S3/R2 for multi-node.
- **Worker:** single-node is fine for launch; the `RenderJob` queue table supports scaling to
  multiple workers (claims are atomic via a guarded `updateMany`).
- **Security:** hardened headers in `next.config.mjs`, httpOnly signed-cookie sessions,
  bcrypt password hashing, ownership-checked media, Stripe signature verification.

## License

Proprietary — all rights reserved (yours to make money with).
