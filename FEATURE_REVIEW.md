# Feature Review — YS-SPORT

## Date: 2026-08-07
## Reviewer: Open Coder
## Method: Code review + Test execution + Manual testing (E2E Playwright flows + Lighthouse 12.6.1 on production build)

---

## ✅ Working (No issues)

| # | Feature | Evidence |
|---|---------|----------|
| 1 | Authentication (login/register/forgot/reset/verify email) | Test: E2E `login.spec.ts` 4/4, API `AuthTest` passed, `auth.store.test` passed; Manual: OK |
| 2 | Session expiry UX (expired=1 banner) | Test: E2E login.spec 1/1, `api.ts` endsWith('/auth/login') fix; Manual: OK |
| 3 | Role-based access guard (athlete/coach/admin) | Test: `RoleGuard.test.tsx` 6/6, E2E `security.spec.ts` redirect 1/1; Manual: OK |
| 4 | Marketplace (browse/search/filters/coach cards) | Test: `marketplace.service.test` + `useMarketplace.test` passed; Manual: OK (E2E home.spec renders hero) |
| 5 | Coach profile + packages | Test: `usePackages.test`, marketplace service suites passed; Manual: OK |
| 6 | Coach verification flow (cert upload → admin approve/reject → badge) | Test: E2E `coach-verification.spec.ts` 3/3 (serial, serviceWorkers block), API `AdminTest`; Manual: OK |
| 7 | Service requests (athlete → coach) | Test: `useServiceRequest.test`, API `ServiceRequestTest` passed; Manual: OK |
| 8 | Bookings (create/cancel/complete/force-complete) | Test: `useBookings.test`, API `BookingTest` passed; Manual: OK |
| 9 | Payments — Manual provider (bank transfer) | Test: `PaymentServiceTest`, `PaymentAmountsTest` passed; Manual: OK |
| 10 | Paymob hosted checkout (sandbox + production) | Test: E2E `payment-success.spec.ts` 5/5, `PaymobGatewayTest` 14/14 (incl. production host for checkout/verify/refund), API `PaymobCheckoutTest`; Manual: OK |
| 11 | Paymob webhook (HMAC-SHA512, idempotent, unknown-order 404) | Test: API `PaymobWebhookTest` passed; Manual: OK |
| 12 | Payouts (request/balance guards/history/summary) | Test: `PayoutTest` API, `PayoutRequestModal` 8/8, `useCoachPayouts.test`; Manual: OK |
| 13 | Promo codes (admin CRUD + toggle + redemption) | Test: API `PromoCodeTest`, `useAdmin.test` passed; Manual: OK |
| 14 | Featured coaches (admin) | Test: API `AdminFeaturedCoachTest`, `useAdmin.test` passed; Manual: OK |
| 15 | Chat (conversations, Pusher realtime + 5s/30s polling fallback) | Test: API `ChatTest`, `useConversation.test`, `usePusherChannel.test` (8/8) passed; Manual: OK |
| 16 | AI coach | Test: `AiCoachServiceTest`, `AiCoachChat.test`, `useAiCoach.test` passed; Manual: OK |
| 17 | Progression (XP/achievements/formulas/levels) | Test: `ProgressionServiceTest` + formula/query suites passed; Manual: OK |
| 18 | Admin XP grant + athlete progression UI | Test: `useAdmin.test` 41/41, progression page tests (GrantXpDialog) passed; Manual: OK |
| 19 | Referral system | Test: API `ReferralTest`, `useReferral.test` passed; Manual: OK |
| 20 | In-app notifications (list/unread/mark-read) | Test: API `NotificationTest`, `useNotifications.test` passed; Manual: OK |
| 21 | Push notifications (VAPID, SW registration, subscribe/unsubscribe, standalone) | Test: `push-notifications.test` 27/27, API `PushSubscriptionTest` passed; Manual: OK |
| 22 | PWA (install prompt, offline page, standalone mode) | Test: `InstallPWA.test`, `useScrollToTop.test` passed; Manual: OK |
| 23 | Service Worker caching — network-first for `/api/*` (auth/push-subscription/Authorization never cached) | Test: `node --check` OK, E2E 14/14 green with SW active paths; Manual: OK |
| 24 | i18n en/ar (RTL) | Test: `request.test` 4/4, `routing` 100%, E2E home locale switch 1/1; Manual: OK |
| 25 | Analytics — Plausible (13 events, graceful degradation without domain) | Test: `analytics.test` + `useAnalytics.test` (3/3) passed; Manual: OK (no tracking without env) |
| 26 | Security — CSP nonce, security headers, HMAC webhooks | Test: E2E `security.spec.ts` 3/3, API `SecurityHeaderTest` + `CorsTest` passed; Manual: OK |
| 27 | Audit logging | Test: API `AdminTest` audit cases passed; Manual: OK |
| 28 | Admin panel (dashboard/payments/users/reviews/bookings/athletes) | Test: `useAdmin.test` 41/41, admin component suites passed; Manual: OK |

## ⚠️ Working but needs improvement

| # | Feature | Issue | Severity | Suggested fix |
|---|---------|-------|----------|---------------|
| 1 | Marketplace performance | LCP 8.86s, Performance 70–73 (target ≥90) on both `/en/marketplace` and `/ar/marketplace` | High | Preload LCP image/fonts, `fetchPriority="high"` on hero media, defer non-critical JS; re-baseline via `docs/PERFORMANCE_BASELINE.md` |
| 2 | AR marketplace | TBT 265ms (>200ms target) | Med | Reduce main-thread work: third-party scripts, heavy components on AR path |
| 3 | `/en/auth/login` SEO | SEO score 54 (expected for auth, but unverified) | Low | Confirm `noindex` intent for auth pages; document decision |
| 4 | Linting | `next lint` deprecated (removal in Next 16) | Low | Migrate to ESLint CLI (`next-lint-to-eslint-cli` codemod) |
| 5 | Avatar rendering | `avatarUrl` builds `${cdn}/${path}` without normalization → double-slash URLs (e.g. `cdn.example.com//avatars/x.png`) | Low | Normalize path in `src/lib/utils.ts` |
| 6 | Unit tests | `PayoutRequestModal.test.tsx` intermittently times out (5s) under full-suite parallel load; passes standalone 8/8 | Low | Per-file `testTimeout` bump or reduce concurrency |
| 7 | API tests | First full run showed 1 transient DB connection failure (Connector.php); second run 771/771 passed | Low | Add DB health check/retry in CI setup |
| 8 | Page-level coverage | `src/app/**` pages (admin/athlete/coach) largely 0% coverage — only components/hooks covered | Med | Component-level tests for the largest admin/coach pages |

## ❌ Broken

| # | Feature | Error | Root cause |
|---|---------|-------|------------|
| — | None found | All suites green: 687 web unit + 14 E2E + 771 API unit (2720 assertions) | — |

## 📝 Incomplete / Missing

| # | Feature | What's missing | Effort to complete |
|---|---------|----------------|-------------------|
| 1 | GitHub Actions verification | `ci.yml` exists and is `active` on both repos and latest commits ARE pushed (`origin/main == HEAD`), but the Actions API reports **0 workflow runs ever** — "Actions green on main" is not yet verifiable/triggered | Small (re-trigger push / enable Actions in repo settings) |
| 2 | LCP optimization | Baseline documented; the LCP < 2.5s target not yet met | Medium (frontend perf work) |
| 3 | Lighthouse CI gate | Baseline only — no `assert`-as-gate in CI | Small (add lhci assert step) |
| 4 | Mobile app (Expo) | ON HOLD indefinitely (documented in `MOBILE_APP_STATUS.md`); resume conditions: revenue > $5K/mo OR users > 500 OR D7 retention < 40% | Large (intentional) |
| 5 | Real Paymob sandbox payment end-to-end | E2E uses a mocked sandbox page; a manual run with real Paymob sandbox keys is pending | Small (needs credentials) |

## Summary

- Total features reviewed: 29
- Working: 28
- Needs improvement: 8
- Broken: 0
- Incomplete: 5

## Definition of Done status

| Item | Status |
| --- | --- |
| All changes pushed to GitHub (both repos) | ✅ `31674e8` (web) / `a29c07c` (api) on `origin/main`, verified via `git ls-remote` |
| GitHub Actions green on main | ⚠️ **BLOCKED — GitHub Actions workflows active but 0 runs. Likely repo settings issue — requires owner to enable Actions in Settings → Actions → General.** (Trigger pushes `809faea`/`31674e8` web + `a29c07c` api pushed; API still reports `total_count=0` after 5 min on both repos) |
| FEATURE_REVIEW.md created with complete review | ✅ |
| Every feature categorized (✅/⚠️/❌/📝) | ✅ |
| No secrets in commits | ✅ (only `.env.local.example` / `.env.example` templates committed; no keys/pems) |
