# Sakura-AI - Architecture (Reusable Core)

This document describes the invariant (reusable) modules, runtime architecture, data flows, and file structure of this project. It is written so another AI can recreate an equivalent codebase quickly (same behavior, different branding/content).

Repo root (this workspace): `D:\AI-ex1`

---

## 1) What this product is

Sakura AI is a Next.js (App Router) web app providing:

- A marketing landing page with an embedded image editor.
- An authenticated user account/workspace page.
- AI image generation/editing via an internal API route that calls OpenRouter.
- A credits system (daily free + paid credits).
- PayPal Checkout to purchase credits/subscriptions (credits are granted after webhook verification).

---

## 2) Core (Invariant) Modules to Reuse

When building a product matrix, treat the following as the stable platform layer.

### A) Web App Shell (Next.js App Router)

- Server Components for SSR layout, metadata, and auth-gated routing.
- Client Components for interactive editor/account UI.

Key files:
- `app/layout.tsx` (SSR layout, metadata, initial locale & auth user, initial credits)
- `app/page.tsx` (landing page composition)
- `app/account/page.tsx` (auth-gated workspace route)

### B) Auth (Supabase, Google OAuth, SSR cookies)

Goals:
- Google OAuth sign-in via Supabase
- Persist session in cookies
- SSR can read user session
- Middleware refreshes session

Key files:
- `app/auth/sign-in/google/route.ts` (start OAuth, set `sakura-next` cookie)
- `app/auth/callback/route.ts` (exchange `code` for session, redirect)
- `app/auth/sign-out/route.ts` (sign out)
- `lib/supabase/route.ts` (Supabase client for Route Handlers; supports optional bypass)
- `lib/supabase/server.ts` (Supabase client for Server Components via Next cookies)
- `lib/supabase/middleware.ts` + `proxy.ts` (session refresh middleware)

Module contract:
- A logged-in user is required to generate images and to purchase credits.

### C) AI Generation API (OpenRouter)

Goal:
- Provide a single internal endpoint for image generation/editing.
- Support txt2img and img2img (reference image).
- Return one or more output image URLs (or data URLs) extracted from provider response.

Key file:
- `app/api/generate-image/route.ts`

Important behaviors:
- Enforces same-origin requests and rate limiting.
- Checks credits; blocks if insufficient (unless the client already consumed credits).
- Calls OpenRouter `chat/completions` with a fixed model string.
- Extracts images from multiple possible response formats (provider compatibility).

### D) Credits ledger + daily refresh

Goal:
- Maintain `free_credits` and `paid_credits` per user.
- Auto-refresh daily free credits.
- Provide "consume credits" and "add paid credits" operations.

Key file:
- `lib/credits.ts` (server-side, uses Supabase Service Role)

Important note:
- UI also calls Supabase RPC functions (`get_my_credits`, `consume_credits`). These must exist in your Supabase database (see Section 6).

### E) Payments (PayPal Checkout + webhook verification)

Goal:
- Create PayPal orders server-side.
- Capture orders server-side.
- Only grant credits after webhook verification (signature verification + order validation).

Key files:
- `components/paypal-checkout-dialog.tsx` (loads PayPal JS SDK, orchestrates create/capture)
- `app/api/paypal/create-order/route.ts` (create PayPal order, persist to DB)
- `app/api/paypal/capture-order/route.ts` (capture, mark DB status as captured)
- `lib/paypal.ts` (PayPal REST API auth + create/capture)
- `lib/paypal-catalog.ts` (SKU -> price/credits mapping)
- `supabase/payment-orders.sql` (table + `apply_paypal_order_credit` RPC)
- `supabase/functions/handle-paypal-success/index.ts` (Supabase Edge Function webhook)

### F) Security controls (Same-Origin + Rate Limit + CSP)

Key files:
- `lib/security.ts` (origin allowlist + rate limiting wrapper)
- `lib/rate-limit.ts` (in-memory token bucket; works per-instance)
- `next.config.mjs` (CSP + other security headers)

Tradeoff:
- `lib/rate-limit.ts` is process memory; for multi-instance production replace with Redis/Upstash/etc.

### G) UI primitives + theming + i18n

- shadcn-style primitives in `components/ui/*`
- `lib/i18n.tsx` provides `I18nProvider`, `useI18n()`, `Locale` (`en`/`zh`)
- `app/globals.css` defines theme CSS variables and Tailwind layer base styles

Note:
- Some `zh` translations appear garbled (encoding). Ensure UTF-8 source encoding and fix strings if needed.

---

## 3) High-Level Runtime Architecture

### Roles

- Browser:
  - Renders landing/editor UI, calls internal APIs, talks to Supabase (browser client) for auth + RPC.
  - Loads PayPal JS SDK for checkout UI.
- Next.js server (Route Handlers run in Node runtime here):
  - SSR can read Supabase session cookies.
  - `/api/generate-image` calls OpenRouter.
  - `/api/paypal/*` calls PayPal REST APIs.
  - `/api/credits` returns credits info.
- Supabase:
  - Auth (Google OAuth)
  - Database tables and RPC functions (credits + payment orders)
  - Edge Function for PayPal webhook verification + credit granting

---

## 4) Data Flows (Copyable Playbooks)

### Auth flow (Google OAuth)

1. User hits `/auth/sign-in/google?next=/account`
2. Route sets cookie `sakura-next=/account` and redirects to Supabase OAuth URL
3. Supabase redirects back to `/auth/callback?code=...`
4. Callback exchanges code for session and redirects to the `next` path

### Generate image flow (credits-protected)

Two patterns exist in code:

Pattern A - server-consume (API checks and consumes):
1. Client calls `/api/generate-image` without `x-credits-consumed`
2. Server checks credits via `getUserCredits()` and consumes via `consumeUserCredits()`
3. Server calls OpenRouter, returns `images[]` + `remainingCredits`

Pattern B - client-consume (used by editor/account UI):
1. Client checks credits via `supabase.rpc("get_my_credits")`
2. Client consumes credits via `supabase.rpc("consume_credits", ...)`
3. Client calls `/api/generate-image` with header `x-credits-consumed: 1`
4. Server skips consuming again, calls OpenRouter, returns `images[]` + `remainingCredits` (best-effort)

### PayPal -> credits flow

1. Client opens checkout dialog (`components/paypal-checkout-dialog.tsx`)
2. PayPal SDK calls `/api/paypal/create-order` with a `sku`
3. Server creates PayPal order and upserts `payment_orders` row
4. On approval, client calls `/api/paypal/capture-order` with `orderId`
5. Server captures and sets order status to `captured`; UI shows success
6. PayPal webhook hits Supabase Edge Function `handle-paypal-success`
7. Edge function verifies signature + reads PayPal order details + compares:
   - amount/currency
   - `custom_id` payload
8. Edge function calls DB RPC `apply_paypal_order_credit(orderId, eventPayload)`
9. Credits are granted; order marked `completed`

---

## 5) File/Directory Structure

### `app/` (Next.js App Router)

- Global:
  - `app/layout.tsx` - SSR layout, metadata, reads auth user and initial credits
  - `app/page.tsx` - marketing page and embedded editor sections
  - `app/globals.css` - Tailwind v4 + CSS variables theme
  - `app/robots.ts`, `app/sitemap.ts`
- Auth routes:
  - `app/auth/sign-in/google/route.ts`
  - `app/auth/callback/route.ts`
  - `app/auth/sign-out/route.ts`
  - `app/auth/error/page.tsx`
- Pages:
  - `app/account/page.tsx`
  - `app/pricing/page.tsx`, `app/pricing-v2/page.tsx`
  - `app/privacy/page.tsx`, `app/terms/page.tsx`
- API:
  - `app/api/generate-image/route.ts`
  - `app/api/credits/route.ts`
  - `app/api/paypal/create-order/route.ts`
  - `app/api/paypal/capture-order/route.ts`

### `components/` (business UI + providers)

- Business:
  - `components/editor-section.tsx` - landing page editor UI (credits RPC + `/api/generate-image`)
  - `components/account-page.tsx` - workspace UI + history (credits RPC + `/api/generate-image`)
  - `components/paypal-checkout-dialog.tsx` - PayPal checkout UI
  - `components/navbar.tsx`, `components/footer.tsx`, `components/*-section.tsx`
- Providers:
  - `components/app-providers.tsx` - wraps `I18nProvider`
- UI primitives:
  - `components/ui/*` - Radix-based components, buttons, dialogs, inputs, etc.

### `lib/` (services, integrations, utilities)

- Supabase:
  - `lib/supabase/env.ts` - env validation (+ optional bypass flag)
  - `lib/supabase/server.ts` - SSR server client (Next cookies)
  - `lib/supabase/client.ts` - browser client
  - `lib/supabase/route.ts` - route handler client
  - `lib/supabase/admin.ts` - service-role admin client
  - `lib/supabase/middleware.ts` - update session in middleware
- Core:
  - `lib/credits.ts` - credits state + daily refresh + consume/add paid
  - `lib/paypal.ts` - PayPal REST calls
  - `lib/paypal-catalog.ts` - SKU catalog
  - `lib/security.ts` - same-origin + rate limit + prompt normalization
  - `lib/rate-limit.ts` - memory token bucket
  - `lib/i18n.tsx` - i18n provider/hooks
  - `lib/utils.ts` - shared helpers

### Middleware proxy

- `proxy.ts` forwards to `lib/supabase/middleware.ts` and exports a `matcher`.

### `supabase/` (DB + edge functions)

- SQL:
  - `supabase/user-credits.sql`
  - `supabase/payment-orders.sql`
- Edge function:
  - `supabase/functions/handle-paypal-success/*`
- Config:
  - `supabase/config.toml`

---

## 6) Environment Variables (Required)

Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Site URL / origin enforcement:
- `NEXT_PUBLIC_SITE_URL` (recommended in production; used for OAuth redirect and origin checks)
- `ALLOWED_ORIGINS` (optional; comma/space separated list of extra allowed origins)

OpenRouter (AI):
- `OPENROUTER_API_KEY`
- `OPENROUTER_APP_NAME` (optional; used as `X-Title` header)

PayPal:
- `PAYPAL_ENV` (`sandbox` or `live`)
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

Supabase Edge Function additionally expects:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_WEBHOOK_ID`

---

## 7) Database Schema & RPC (Supabase) - Required to Reproduce

### Tables (provided in repo)

1) `user_credits`
- SQL: `supabase/user-credits.sql`
- Stores `free_credits`, `paid_credits`, `last_daily_refresh`

2) `payment_orders`
- SQL: `supabase/payment-orders.sql`
- Stores PayPal order lifecycle and expected/captured validation payloads

### RPC functions (partially provided)

Provided in repo:
- `apply_paypal_order_credit(p_paypal_order_id text, p_paypal_event_payload jsonb default null)` in `supabase/payment-orders.sql`

Referenced by code but missing from repo (MUST be created in Supabase):
- `get_my_credits()`
- `consume_credits(p_amount int, p_remark text)` (remark is used by UI; signature can vary if you adapt UI)

Recommended behavior:
- `get_my_credits()`:
  - identify current user (`auth.uid()`)
  - ensure a `user_credits` row exists
  - apply daily refresh logic
  - return free/paid/total credits
- `consume_credits(p_amount)`:
  - verify current user
  - atomically subtract credits with free-first policy
  - error if insufficient

Important: the repo currently mixes two approaches:
- server-side credits logic in `lib/credits.ts` (service role)
- client-side RPC calls in components

For a clean reproduction, pick one as the source of truth:
- Option 1 (matches current UI): keep client RPC consume + server generation with `x-credits-consumed: 1`
- Option 2 (more centralized): consume server-side only; remove client consume calls

Schema consistency warning:
- `supabase/payment-orders.sql` references `private.user_credits`, while `supabase/user-credits.sql` creates `public.user_credits`.
- To reproduce correctly, choose one schema and align all SQL and code to it.

---

## 8) Internal API Contracts

### `POST /api/generate-image`

Auth: requires Supabase user session.

Input:
- `multipart/form-data`: `prompt` (string), `image` (File, optional)
- or JSON: `{ prompt: string, imageDataUrl?: string }`

Header:
- `x-credits-consumed: 1` (optional) to skip server-side consume when already consumed via RPC.

Output (success):
- `{ images: string[], remainingCredits: number | null, spentCredits: number | null }`

### `GET /api/credits`

Auth: requires user session.

Output:
- `{ credits: { totalCredits: number }, costPerImage: number }`

### `POST /api/paypal/create-order`

Auth: requires user session.

Input: `{ sku: string }`

Output: `{ id: string }`

### `POST /api/paypal/capture-order`

Auth: requires user session.

Input: `{ orderId: string }`

Output: `{ status: "captured_awaiting_webhook", ... }`

---

## 9) How to Reproduce Fast (Template Recipe for a Product Matrix)

Do not fork N codebases. Keep one invariant platform, then parameterize variants.

Recommended:
1. Keep the invariant modules above as a single repo.
2. Move product-variant data into configuration:
   - branding (name/logo/colors)
   - SEO metadata
   - OpenRouter model string + prompt policy
   - pricing catalog (SKU mapping)
   - landing page copy and assets
3. Implement a config layer:
   - add `lib/product.ts` (or `config/products/*.ts`) with a `ProductConfig` type
   - select config by `NEXT_PUBLIC_PRODUCT_ID`
   - update consumers:
     - `app/layout.tsx` metadata/title
     - `components/navbar.tsx` logo/name/links
     - `components/*-section.tsx` copy and assets
     - `lib/paypal-catalog.ts` (or map SKU per product)
     - `app/api/generate-image/route.ts` model selection

Minimal matrix deployment:
- Deploy the same repo multiple times with different env vars (at least `NEXT_PUBLIC_PRODUCT_ID`, `NEXT_PUBLIC_SITE_URL`).

---

## 10) Build/Run

Commands (pnpm):
- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`

On Windows with restrictive PowerShell execution policy, use `pnpm.cmd` instead of `pnpm`.

---

## 11) Known Constraints / Gotchas

- Rate limiting is in-memory (`lib/rate-limit.ts`): unsuitable for multi-instance production.
- CSP in `next.config.mjs` must allow:
  - `openrouter.ai`
  - PayPal domains (sandbox/live)
  - Supabase domains (`https://*.supabase.co` and `wss://*.supabase.co`)
- Credits RPC functions are required by UI but not defined in this repo; you must implement them in Supabase.
- SQL schema mismatch (`public.user_credits` vs `private.user_credits`): align before production.

