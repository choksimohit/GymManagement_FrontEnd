# Gym Management — Frontend

Next.js 15 app with **TypeScript + Tailwind CSS + React Hook Form**, deployed on **Vercel**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Forms | React Hook Form + Zod |
| HTTP client | Custom fetch wrapper (`src/lib/api.ts`) |
| Auth | JWT stored in localStorage |
| Date utils | date-fns |

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Redirect → /dashboard or /portal
│   │   ├── globals.css             # Tailwind base + component classes
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── (admin)/                # Admin route group (requires admin role)
│   │   │   ├── layout.tsx          # Sidebar layout + auth guard
│   │   │   ├── dashboard/page.tsx  # KPI dashboard
│   │   │   ├── members/
│   │   │   │   ├── page.tsx        # Member list with search
│   │   │   │   ├── new/page.tsx    # Create member
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # Member details
│   │   │   │       └── edit/page.tsx
│   │   │   ├── plans/page.tsx      # Plan management
│   │   │   ├── memberships/page.tsx # Assign memberships + payments
│   │   │   ├── attendance/page.tsx  # Daily log + QR generator
│   │   │   └── reports/page.tsx    # Membership & revenue reports
│   │   └── (member)/               # Member route group (requires member role)
│   │       ├── layout.tsx          # Header layout + auth guard
│   │       └── portal/page.tsx     # Member dashboard + QR check-in
│   ├── components/
│   │   ├── Sidebar.tsx             # Admin navigation sidebar
│   │   └── MemberForm.tsx          # Reusable member create/edit form
│   ├── lib/
│   │   ├── api.ts                  # Typed fetch wrapper (auto-attaches JWT)
│   │   └── auth.ts                 # Save/read/clear JWT + user from localStorage
│   └── types/
│       └── index.ts                # All shared TypeScript types + enum label maps
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── vercel.json
└── tsconfig.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

For production, set this to your deployed Railway backend URL.

### 3. Start development server

```bash
npm run dev    # runs on http://localhost:3000
```

### Other commands

```bash
npm run build  # production build
npm run start  # serve production build
npm run lint   # ESLint check
```

## Pages & Features

### Admin

| Route | Feature |
|---|---|
| `/login` | Email + password login |
| `/dashboard` | 6 KPI cards: total members, active, subscriptions, today's attendance, expiring soon, monthly revenue |
| `/members` | Searchable member list with status badges |
| `/members/new` | Create member form with dynamic emergency contacts |
| `/members/:id` | Member profile, membership history, body progress table |
| `/members/:id/edit` | Edit member details + emergency contacts |
| `/plans` | Create / edit / delete membership plans as cards |
| `/memberships` | Assign plans to members, add payments with balance validation |
| `/attendance` | Daily attendance log by date, QR code generator |
| `/reports` | Membership report (Active/Due/Expired) with CSV export; monthly revenue breakdown |

### Member Portal

| Route | Feature |
|---|---|
| `/portal` | Personal info, current membership status, QR code check-in/out |

## Auth Flow

1. User logs in → backend returns a JWT token + user object
2. Token and user are saved to `localStorage`
3. All API calls automatically attach `Authorization: Bearer <token>`
4. Route groups `(admin)` and `(member)` check role on mount and redirect if unauthorized
5. Logout clears localStorage and redirects to `/login`

## Deployment (Vercel)

1. Push this folder (or the whole monorepo) to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-backend-url.up.railway.app/api
   ```
5. Deploy — Vercel auto-detects Next.js

## Styling Notes

Global utility classes are defined in `globals.css` for consistency:

| Class | Usage |
|---|---|
| `.btn-primary` | Blue action button |
| `.btn-secondary` | Grey neutral button |
| `.btn-danger` | Red destructive button |
| `.input` | Styled form input |
| `.label` | Form field label |
| `.card` | White rounded panel |
| `.badge-green/red/yellow/blue/gray` | Status pills |
| `.table-cell` / `.table-header` | Table cell padding |
