# Go Converto — Admin Panel

Internal staff dashboard for the Go Converto platform. Unlike the company-facing `dashboard` app (scoped to one organization), everything here is **cross-company**: staff (`super_admin` / `admin` / `manager`) sign in separately from company users and see data across every organization at once.

Built with Next.js (App Router), NextAuth, Tailwind CSS, and `recharts`, talking to the shared FastAPI `backend`.

## Getting Started

```bash
npm install
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001). The backend (`../backend`) must be running separately — see its own README for setup.

## Environment

Create `.env` with:

```bash
# FastAPI backend base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# This app's own URL (NextAuth needs it for callbacks)
NEXTAUTH_URL=http://localhost:3001

# NextAuth session encryption key — generate with: openssl rand -base64 48
# Rotating this immediately invalidates every existing session (everyone
# signed in has to log back in), so don't do it casually in production.
NEXTAUTH_SECRET="..."
```

## Auth model

NextAuth is configured with two separate Credentials providers in `auth.ts`:

- `credentials` — company/user login (`POST /api/v1/auth/signin`), against the backend's `users` collection. Mostly a fallback path here (e.g. the topbar's `getUserData()` call); this app is built for staff, not company owners.
- `admin-credentials` — staff login (`POST /api/v1/admin/signin`), against the separate `admins` collection. This is what actually signs you into this panel, and it's what every `/api/v1/admin/...` endpoint expects (via `get_current_admin` on the backend) — see the note below.

**Important:** a staff JWT's `sub` is an id in `admins`, not `users`. Any backend endpoint that only accepts a `users`-collection token (e.g. the company-scoped `/api/v1/leads/...`, `/api/v1/chat/...`, `/api/v1/notifications/...`) will 401 for a staff session. Every feature in this app that needs cross-company data goes through a dedicated `/api/v1/admin/...` endpoint instead (`admin_route.py` + `services/admin/admin_*_service.py` on the backend) — if you're wiring up a new page and it needs to see data across companies, add a new `admin_*_service.py` mirroring the existing ones rather than reusing the company-scoped routes.

## Pages

| Route | What it does |
|---|---|
| `/dashboard` | Platform overview — KPI cards, Growth Trends chart (sign-ups/leads/conversions, monthly or yearly), Plan Distribution (Free Trial/Professional/Advanced/Enterprise), platform health |
| `/users` | Every company on the platform, with sign-up → trial → paid journey stage; click through to a full profile |
| `/leads` | Visitor leads captured by any organization's chatbot, with which org captured each one |
| `/chats` | Chat history, drilled down 3 levels: organizations → that org's visitors → a visitor's full chat history across all their sessions |
| `/messages` | Enterprise "Contact Sales" inquiries submitted from the public pricing page, with a Connected/Confirmed status workflow |
| `/settings` | Staff Accounts — create/edit/deactivate `admin`/`manager` accounts (super admin only) |
| `/user-settings` | Your own account settings |
| `/profile` | Your own profile (read-only — see note below) |

Notifications are real-time: the topbar bell holds a WebSocket connection (`/api/v1/admin/notifications/ws`) and gets pushed every notification platform-wide (new lead, new chat, subscription events) the instant it's created on the backend, with a 60s poll as a fallback if the socket drops.

Profile editing is intentionally read-only: the backend's admin-update endpoint (`PATCH /admin/admins/{id}`) is gated to `super_admin` managing *other* staff accounts — there's no self-service "edit my own profile" endpoint yet.

## Shared conventions

- **Pagination**: every list page (`Users`, `Leads`, `Chats`, `Messages`, `Settings`) uses the same `components/shared/Pagination.tsx` — fetch up to 100 records, paginate 10-per-page client-side, so stat cards stay accurate against the full fetched set rather than just the visible page.
- **Cross-company enrichment**: any admin service that reads a company-scoped collection (`leads`, `chat_sessions`, `notifications`) joins back to `users` for `company_name`/`company_email` via a small `_company_lookup` helper — same pattern in `admin_lead_service.py`, `admin_chat_service.py`, and `admin_notification_service.py`.
- **Server actions**: all backend calls go through `app/actions/*.ts` (`"use server"` files), never fetched directly from client components.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth (Auth.js) Documentation](https://authjs.dev)
