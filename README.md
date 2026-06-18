# StudyHub Web

The web client for **StudyHub** — a collaborative academic platform where students share lecture notes, past papers, and course resources, plan their studies, earn reputation, and climb a community leaderboard.

Built with **Next.js 16** (App Router) + **React 19** and **Tailwind CSS v4**, deployed on **Vercel**. It talks to the separate [StudyHub API](https://github.com/MIHMahmudEli/Studyhub-api) (NestJS) and shares a Cloudflare R2 bucket for files.

| Part of the stack | Repo | Hosting |
| --- | --- | --- |
| **Web (this repo)** | `Studyhub-web` | Vercel |
| API | `studyhub-api` | Render |
| Mobile app | `studyhub-app` (Expo / React Native) | EAS |

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Routes](#routes)
- [Architecture & key concepts](#architecture--key-concepts)
- [Theming](#theming)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Landing page** — hero, product preview, stats, features, "how it works", a YouTube video showcase, an app-download section, and contact. Every section has a **shareable anchor** (e.g. `/#download`).
- **Auth** — register with OTP email verification, login, password reset, JWT access/refresh handled transparently with auto-refresh.
- **Notes & resources** — browse, search, filter, upload (direct to R2), view, rate/review, react, bookmark, download.
- **Routine planner**, **bookmarks**, **leaderboard**, **profiles**, **follows**, **notifications** (real-time via WebSocket).
- **Get the App** — lists Android/iOS builds with versions and download counts; shareable deep link.
- **Admin portal** — dashboard, user management, content moderation (pending notes/resources), trending, analytics (charts), theme management, app-release uploads, and **real-time "Online Now"** presence split by web/android/ios with an online-history chart.
- **Theming** — dark/light with **Deep Space** (starfield), **Midnight**, and **Ramadan** variants, set globally by admins.
- **Polish** — Sentry error tracking, error boundary, optimistic UI, skeletons, toasts, PDF/zip export utilities.

---

## Tech stack

| Concern | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + `tailwindcss-animate` |
| Data fetching | Axios + `@tanstack/react-query` |
| Realtime | `socket.io-client` |
| Icons | `lucide-react` |
| Charts | `recharts` |
| Validation | `zod` |
| Files/export | `jspdf`, `jszip`, `html-to-image`, `react-easy-crop` |
| Monitoring | `@sentry/nextjs` |
| Storage | Cloudflare R2 (presigned uploads via the API) |

---

## Getting started

### Prerequisites
- Node.js 20+
- A running [StudyHub API](https://github.com/MIHMahmudEli/Studyhub-api) (local `http://localhost:3001` or the deployed URL)

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env.local (see Environment variables)

# 3. Start the dev server (runs on port 8000)
npm run dev
```

Open **http://localhost:8000**.

> The dev server runs on **port 8000** (`next dev -p 8000`). The API's CORS and R2 bucket CORS are configured to allow `http://localhost:8000`.

---

## Environment variables

Create `.env.local` in the project root:

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the StudyHub API | `http://localhost:3001` or `https://studyhub-api-a7ou.onrender.com` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public base URL of the R2 bucket (used to build file/download URLs) | `https://pub-xxxx.r2.dev` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (if used) | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |

All are `NEXT_PUBLIC_*` (exposed to the browser). Point `NEXT_PUBLIC_API_URL` at localhost for full-stack local dev, or at the deployed API to develop the UI against production data.

---

## Project structure

```
app/
├── layout.js                # Root layout: providers, themes, fonts, global effects
├── page.js                  # Landing page (composes home/* sections + deep-link scroll)
├── globals.css              # Tailwind v4 + theme variables (dark/light/ramadan/nebula)
├── not-found.js             # 404
├── auth/                    # /auth, /auth/register, /auth/forgot-password
├── dashboard/               # student dashboard, routine, uploaded-notes
├── notes/ resources/        # browse + detail + upload
├── leaderboard/ bookmarks/ notifications/ search/ settings/ profile/[id]/
├── privacy/ terms/          # legal pages
└── admin/                   # admin portal (dashboard, users, moderation, analytics,
                             #   theme, online_users, app_releases, released_apps, ...)

components/
├── home/                    # Landing sections: Hero, Preview, Highlights, Features,
│                            #   HowItWorks, Videos, Downloads, Contact
├── layout/                  # Navbar, Footer, DashboardNavbar
├── admin/                   # StatsCard, UserCard, panels, PresenceHistoryChart, ...
├── auth/ notes/ resources/ dashboard/ leaderboard/ notifications/ settings/ upload/
├── ramadan/ space/          # themed visual effects (starfield, decorations)
├── ui/                      # Toast, Skeleton, ErrorBoundary, logo, buttons, ...
├── ScreenGate.js            # client-side route protection
├── RouteTracker.js          # analytics/route tracking
└── ThemeSync.js             # syncs theme from DB

context/
├── AuthContext.js           # auth state, tokens, login/logout, inactivity logout
├── SocketContext.js         # Socket.IO connection (passes token + platform: 'web')
├── ThemeContext.js / ThemeProvider.js  # theme + variant management

lib/
├── api.js                   # axios instance, token refresh, X-Client-Platform: web
├── socket.js                # Socket.IO client factory
├── r2.js                    # uploadToR2 / getDisplayUrl / deleteFromR2
├── storage.js supabase.js   # storage helpers
├── schemas.js               # zod validation schemas
├── hooks/                   # useAuthGuard, useAdminDashboard, useNotes, useResources, ...
├── data/                    # courses.json (catalog) and demo data
└── ramadan.js fonts.js cn.js searchUtils.js mention.js nameUtils.js
```

---

## Routes

### Public
`/` (landing) · `/auth` · `/auth/register` · `/auth/forgot-password` · `/privacy` · `/terms`

### Authenticated (student)
`/dashboard` · `/dashboard/routine` · `/dashboard/uploaded-notes` · `/notes` · `/notes/[id]` · `/resources` · `/resources/[id]` · `/resources/[id]/[term]` · `/resources/upload_resources` · `/upload` · `/leaderboard` · `/bookmarks` · `/notifications` · `/search` · `/settings` · `/profile/[id]`

### Admin / moderator
`/admin/dashboard` · `/admin/users` · `/admin/active_users` · `/admin/online_users` · `/admin/pending_notes` · `/admin/pending_resources` · `/admin/trending_notes` · `/admin/trending_resources` · `/admin/resources` · `/admin/resources/[id]` · `/admin/analytics` · `/admin/theme` · `/admin/app_releases` (upload builds) · `/admin/released_apps` (manage builds)

Route protection is enforced both at the edge (`proxy.js` middleware — redirects unauthenticated users to `/auth`) and client-side (`ScreenGate`, `useAuthGuard`, and per-page role checks).

---

## Architecture & key concepts

- **API client (`lib/api.js`)** — a single Axios instance with the access token in memory, automatic **refresh-token rotation** on `401`, and an `X-Client-Platform: web` header so the backend can attribute activity to the web client.
- **Direct-to-R2 uploads (`lib/r2.js`)** — `uploadToR2(file, key)` asks the API for a presigned URL, `PUT`s the file straight to R2, and returns the object key; `getDisplayUrl(key)` builds the public URL from `NEXT_PUBLIC_R2_PUBLIC_URL`.
- **Realtime (`context/SocketContext.js`)** — opens an authenticated Socket.IO connection (`auth: { token, platform: 'web' }`) for notifications and admin live presence/active-user feeds.
- **Providers** (in `app/layout.js`): `ThemeProvider → AuthProvider → SocketProvider → ErrorBoundary → QueryProvider → ScreenGate`. An inline `<script>` applies the saved theme before paint to avoid a flash.
- **Deep links** — landing sections carry meaningful `id`s; `app/page.js` scrolls to `location.hash` on load (with a retry for client-rendered sections), and the navbar/footer update the URL hash so links like `/#download` are shareable.

---

## Theming

Themes are CSS-variable driven in `globals.css` and applied via `data-theme` (`dark`/`light`) and `data-theme-variant` (`current`/`previous`/`ramadan`) on `<html>`.

- **Deep Space** = dark + `current` (starfield + nebula). **Midnight** = dark + `previous`. **Ramadan** = festive variant. Light has Dawn and Eid Morning.
- Admins set the global variant at `/admin/theme`; `ThemeProvider`/`ThemeSync` load it and cache it in `localStorage` for an instant, flash-free apply.

> The `[data-theme='nebula']` block in `globals.css` is unused legacy.

---

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on **:8000** |
| `npm run build` | Production build |
| `npm start` | Serve the production build on :8000 |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |

---

## Deployment

Deployed on **Vercel** (auto-deploys from `main`). Set the `NEXT_PUBLIC_*` env vars in the Vercel project. The deployed API must allow the web origin in its CORS and R2 bucket CORS (`FRONTEND_URL` + `POST /storage/cors-setup` on the API).

### Branching
Work lands on `develop`, then merges to `main`:
```bash
# commit on develop, then:
git checkout main && git merge --ff-only develop && git push origin main
```

---

## Troubleshooting

- **Site won't load on some mobile carriers (e.g. in Bangladesh) but works on VPN/WiFi** — carrier-level SNI/DNS filtering of the shared `*.vercel.app` / `*.onrender.com` domains. Fix: serve the web and API from a **custom domain behind Cloudflare**; a VPN working confirms it's network filtering, not the app.
- **Uploads blocked by CORS** — the R2 bucket must allow your web origin. Set `FRONTEND_URL` on the API and run `curl -X POST <api>/storage/cors-setup`.
- **Admin pages look empty / 401s** — ensure you're logged in as an admin and the API DB migrations have been run.
- **About Next.js** — this project targets a newer Next.js; consult `node_modules/next/dist/docs/` before relying on older App Router behavior (see `AGENTS.md`).

---

## License

Private project.
