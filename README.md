# WayFind CRM

WayFind CRM is a Next.js 14 App Router CRM / ERP MVP for managing clients,
leads, projects, tasks, finance records, documents, notifications, audit logs,
team users, and reports.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk Authentication
- Neon PostgreSQL
- Drizzle ORM
- Zod validation
- Server Actions
- Sonner toast
- Lucide React icons

## Completed Modules

- Dashboard and analytics overview
- Clients
- Leads
- Projects
- Tasks with assignment notifications
- Finance
- Documents metadata
- Database notifications
- Audit logs
- Team / users management
- Reports
- Role-based navigation and UI restrictions

## Environment Variables

Create `.env.local` for local development. Do not commit it.

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=
```

`CLERK_WEBHOOK_SECRET` is optional until Clerk webhooks are enabled.

## Local Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run build
```

## Database Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
```

Use `db:push` carefully in production environments. Prefer generated
migrations once the schema stabilizes.

## First Super Admin Setup

Users are created locally after they sign in with Clerk. To promote the first
admin:

1. Sign in once through Clerk with the email you want to promote.
2. Run:

```bash
npm run admin:make-super -- user@example.com
```

You can also set `ADMIN_EMAIL` and run the command without an argument. The
script does not create Clerk users; it only updates an existing local user.

## Demo Seed Data

After a `super_admin` exists, seed safe demo data with:

```bash
npm run db:seed
```

The seed script is intended for development/demo setup and uses clear demo
names. It avoids duplicating the same demo records where practical.

## Deployment Notes

- Configure all required environment variables in the hosting provider.
- Use a production Neon database connection string for `DATABASE_URL`.
- Configure Clerk production keys and allowed redirect URLs.
- Run `npm run build` before deploying.
- Never commit `.env`, `.env.local`, or production secrets.

## Production Readiness

The app validates required environment variables at startup, protects app routes
with Clerk middleware, and keeps server-side permission checks in Server Actions.
UI role restrictions are for usability only; backend checks remain the source of
truth.
