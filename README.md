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
- UploadThing file uploads

## Completed Modules

- Dashboard and analytics overview
- Clients
- Leads
- Projects
- Tasks with assignment notifications
- Finance
- Documents with UploadThing-backed file upload
- Database notifications
- Audit logs
- Team / users management
- Reports
- Role-based navigation and UI restrictions
- Chat module with direct messaging, group chats, reactions, thread replies, and attachment uploads

## Chat Module

WayFind CRM includes a professional internal chat feature for team messaging.
- **Lightweight Polling**: Realtime messaging is powered by lightweight client-side polling every 5 seconds (no WebSockets or paid real-time services required). Polling automatically halts when the browser tab is hidden or blurred.
- **Attachments**: Supports image previews and document downloads. File attachments require `UPLOADTHING_TOKEN` to be configured. If the token is missing, the attachment upload button is disabled/hidden and text chat remains fully functional.
- **Reactions & Replies**: Users can react to messages with emojis and reply directly to messages to create thread previews.


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
UPLOADTHING_TOKEN=
```

`CLERK_WEBHOOK_SECRET` is optional until Clerk webhooks are enabled.
`UPLOADTHING_TOKEN` is required for document uploads. Create an UploadThing app,
copy the token from UploadThing, and add it to `.env.local`.

## Local Development

### Local Development Runtime

Recommended Node.js version: `20.x`.

Next.js 14 is stable on Node 20 LTS. Newer unsupported runtimes, including
Node 24, can crash during `npm run dev` with Edge Runtime syntax errors such as
`Unexpected identifier 'Object'`.

On Windows, use `nvm-windows`:

```bash
nvm install 20.11.1
nvm use 20.11.1
node -v
```

After switching Node versions, clean reinstall dependencies:

```bash
# Delete node_modules
# Delete .next
# Delete package-lock.json only if needed
npm install
npm run dev
```

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run db:push
npm run typecheck
npm run build
npm run test:smoke
npm run dev
```

## Database Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:seed
npm run test:smoke
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

## Deployment

WayFind CRM is ready to deploy on Vercel with Neon PostgreSQL and Clerk.

### Vercel Steps

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables in Vercel Project Settings.
4. Deploy using the default build command:

```bash
npm run build
```

Do not configure Vercel to automatically run `db:push` during build unless you
intentionally want schema changes applied on every deployment.

### Required Environment Variables

Use `.env.example` as the template. Add these values in Vercel:

```env
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
CLERK_WEBHOOK_SECRET=""
UPLOADTHING_TOKEN=""
```

`CLERK_WEBHOOK_SECRET` is only required after Clerk webhooks are enabled. Never
commit real secrets.
`UPLOADTHING_TOKEN` is required for the Documents upload flow.

### Neon Database Setup

- Create a Neon PostgreSQL project.
- Copy the production pooled connection string into `DATABASE_URL`.
- For first production setup, apply the schema from a local terminal using the
  production `DATABASE_URL` carefully:

```bash
npm run db:push
```

You can also use generated migrations with:

```bash
npm run db:generate
npm run db:migrate
```

### Clerk Production Checklist

- Add the production domain in Clerk.
- Configure sign-in and sign-up URLs.
- Configure allowed redirect URLs.
- Use production Clerk keys in Vercel.
- Add a webhook endpoint later if needed: `/api/webhooks/clerk`.
- Add `CLERK_WEBHOOK_SECRET` only after enabling the webhook.

### UploadThing Setup

- Create an UploadThing project/app.
- Add `UPLOADTHING_TOKEN` to `.env.local` for development.
- Add the same variable in Vercel Project Settings for production.
- The app accepts PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, and WEBP files up
  to 16MB.
- After adding the token, open `/documents/new`, select a file, optionally
  attach a client/project, and save.

### First Production Admin

1. Deploy the app with environment variables configured.
2. Open the production app and sign in once with Clerk.
3. From a local terminal pointed at the production `DATABASE_URL`, run:

```bash
npm run admin:make-super -- user@example.com
```

The script only promotes an existing synced local user. It does not create Clerk
users.

### Optional Production Seed Data

Seed demo data only when needed:

```bash
npm run db:seed
```

Use this carefully in production because it creates demo CRM records.

### Deployment Health Checklist

- `npm run typecheck` passes.
- `npm run build` passes.
- `npm run test:smoke` passes.
- Environment variables are added to Vercel.
- Neon database schema is pushed or migrated.
- First user has signed in through Clerk.
- First user is promoted to `super_admin`.
- Dashboard opens in production.

## Final QA Checklist

Run local validation before deploying:

```bash
nvm use 20.11.1
npm run db:push
npm run typecheck
npm run build
npm run test:smoke
npm run dev
```

Manually test these routes:

- `/dashboard`
- `/clients`
- `/leads`
- `/projects`
- `/tasks`
- `/finance`
- `/documents`
- `/notifications`
- `/reports`
- `/audit-logs`
- `/team/users`
- `/settings`

Role-test the app as `super_admin`, `project_manager`, `finance_manager`, and
`employee`. Confirm hidden navigation and server-side permissions match each
role.

For Vercel deployment:

- Push the GitHub repository.
- Import the repository in Vercel.
- Add the required environment variables.
- Deploy.
- Test the live URL.

## Production Readiness

The app validates required environment variables at startup, protects app routes
with Clerk middleware, and keeps server-side permission checks in Server Actions.
UI role restrictions are for usability only; backend checks remain the source of
truth.

## Runtime Troubleshooting

If Vercel fails during install with an error like
`Unsupported platform for @next/swc-win32-x64-msvc`, a platform-specific Next.js
SWC package was likely installed manually or locked as a root dependency. Do not
add `@next/swc-*` packages to `package.json`; Next.js manages those optional
platform packages automatically.

To repair the install state:

```bash
rm -rf node_modules
rm -f package-lock.json
npm install
```

Commit the regenerated `package-lock.json` and push again. The lockfile may
still contain `@next/swc-*` entries as optional dependencies under `next`, but
they should not appear in the root project dependency list.

If runtime database query errors occur during local development:

```bash
npm run db:push
npm run test:smoke
npm run typecheck
npm run build
npm run dev
```

Also verify `DATABASE_URL` points to the expected Neon database, restart the dev
server after schema changes, and confirm optional services such as UploadThing
are configured only for the features that use them.
