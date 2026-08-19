# Fish Me Aqua — Admin Dashboard

Staff-only admin panel for [Fish Me Aqua](https://www.fishmeaqua.com/), an aquarium/fish-supplies e-commerce store. Manages the product catalog, categories, orders, and staff accounts. Signs in separately from customers — only `manager` / `admin` / `superadmin` roles can access this panel.

Built with Next.js (App Router), NextAuth (Auth.js), TypeScript, and Tailwind CSS v4, talking to the Express/MongoDB `backend` in this same repo.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (falls back to the next free port if 3000 is busy). The backend (`../backend`) must be running separately — see its own README for setup.

## Environment

Create `.env` with:

```bash
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:5001

# NextAuth session encryption key — generate with: openssl rand -base64 32
# Rotating this immediately invalidates every existing session (everyone
# signed in has to log back in), so don't do it casually in production.
AUTH_SECRET="..."
```

## Auth model

NextAuth is configured with a single Credentials provider (`admin-credentials` in `auth.ts`), which calls the backend's `POST /api/v1/auth/staff/signin`. That endpoint explicitly rejects customer accounts — only `manager`, `admin`, and `superadmin` roles can sign into this panel, and both email and phone are accepted as the `identifier`.

Role-based access is enforced on the backend, not just in the UI:

- `manager` — day-to-day catalog/order management
- `admin` — everything a manager can do, plus can create/manage `manager` accounts
- `superadmin` — can create/manage `manager`, `admin`, and `superadmin` accounts

`components/settings/RolesPermissionsView.tsx` is the staff management UI — it only shows/enables actions the signed-in account is actually allowed to perform (mirroring the backend's own permission matrix), and always excludes your own account from the manage-others list.

## Pages

| Route | What it does |
|---|---|
| `/dashboard` | Landing page after sign-in |
| `/products` | Product catalog — list, add, edit (feature + gallery images via DigitalOcean Spaces, BDT pricing with optional discount, kg/g/l/ml/pcs units, TinyMCE rich-text overview, auto-generated SKU) |
| `/products/[slug]` | Public-style product detail view (storefront-like layout: gallery left, pricing/specs right) |
| `/products/categories` | Category management — list, add, edit |
| `/orders` | Order list — status/payment tracking, inline status updates; Add Order supports manual/phone orders with a product picker and BD address form |
| `/reviews` | **Design-only** — UI mockup with static mock data, not wired to a backend yet |
| `/customers` | **Design-only** — UI mockup with static mock data, not wired to a backend yet |
| `/messages` | **Design-only** — customer inquiry inbox UI with static mock data, not wired to a backend yet |
| `/settings` | General settings — your own profile (name/email/phone/avatar) and password change |
| `/settings/roles` | Roles & Permissions — staff account management (see Auth model above) |

## Shared conventions

- **Pagination**: list pages (`Products`, `Orders`, category/staff lists) fetch a full page of records and paginate 10-per-page client-side via `components/shared/Pagination.tsx`, so stat cards stay accurate against the whole fetched set rather than just the visible page.
- **Server actions**: all backend calls go through `app/actions/*.ts` (`"use server"` files) — never fetched directly from client components.
- **Add/Edit pages, not modals**: Products, Categories, and Orders each use dedicated `/add` and `/edit` pages rather than modal dialogs. Staff account create/edit (Roles & Permissions) is the one exception — small enough to stay a modal.
- **Auto-generated identifiers**: product SKUs (`FMA-WC-{n}`) and order numbers (`FMA-ORD-{n}`) are suggested by the backend on creation but remain editable.
- **Bangladesh-specific fields**: addresses use the division/district/upazila/post-code structure, plus an Inside Dhaka / Outside Dhaka delivery zone used for shipping.
- **Rich text**: the product Overview field uses a self-hosted TinyMCE (`components/shared/RichTextEditor.tsx`, GPL license, no Tiny Cloud API key) — assets are copied into `public/tinymce` via the `postinstall` script.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth (Auth.js) Documentation](https://authjs.dev)
