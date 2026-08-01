# YS SPORTS — Frontend (Web)

Next.js 14 (App Router) frontend for the YS Sports coaching marketplace.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS (dark navy + electric green design system)
- **State:** Zustand (auth) + TanStack Query (server state)
- **Forms:** react-hook-form + zod
- **Real-time:** Pusher JS (private channels, falls back to polling if unconfigured)
- **UI primitives:** Radix UI (Dialog, DropdownMenu, Slider)

## Structure

```
src/
├── app/
│   ├── auth/                 Login, register, verify-email, forgot-password
│   ├── marketplace/          Public coach search
│   ├── coaches/[uuid]/       Public coach profile + booking flow
│   ├── (athlete)/            Athlete dashboard (route group)
│   ├── (coach)/               Coach dashboard (route group)
│   ├── (admin)/                Admin portal (route group)
│   └── page.tsx               Landing page
├── components/
│   ├── ui/                    Base components (Button, Input, Modal, etc.)
│   ├── layout/                Navbars, sidebars, auth layout
│   ├── marketplace/            Coach card, filters, package card
│   ├── coach/                  Coach-specific (package form, slot modal)
│   └── shared/                 Cross-role (BookingCard, ChatPanel, RoleGuard)
├── hooks/                      React Query hooks per domain
├── services/                   API client wrappers (one per backend domain)
├── store/                      Zustand stores
├── lib/                        api.ts (axios+JWT), pusher.ts, utils.ts
└── types/                      Shared TypeScript types (mirrors backend)
```

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_CDN_URL=https://cdn.yssports.com
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```

```bash
npm run dev
```

## Auth flow

JWT access token lives in memory only (never localStorage — XSS protection). Refresh token is an HttpOnly cookie set by the backend. Axios interceptor in `lib/api.ts` auto-refreshes on 401 and queues concurrent requests during refresh.

## Real-time chat

`ChatPanel` subscribes to `private-conversation.{uuid}` via Pusher when `NEXT_PUBLIC_PUSHER_KEY` is set. Without a Pusher key, it falls back to 5-second polling — the app works either way, real-time is progressive enhancement.

## Role-based routing

Three route groups — `(athlete)`, `(coach)`, `(admin)` — each wrapped in `RoleGuard`, which redirects unauthenticated users to login and mismatched roles to their correct dashboard.

## Known gaps (not required for V1 launch)

- No dark/light theme toggle (dark-only by design)
- No i18n (English only in V1)
- Admin portal has no pagination controls yet (backend supports it, UI defaults to page 1)
