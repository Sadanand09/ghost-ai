# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 03 (Auth) — complete

## Current Goal
- Feature 04 (TBD)

## Completed

- Feature 01: Design System — shadcn@4.5.0 initialized for Tailwind v4 (CSS-based config, no tailwind.config.js), dark-only theme tokens in globals.css (:root sets all shadcn + custom vars to dark values directly, no .dark switching), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added to components/ui/, lucide-react installed, lib/utils.ts cn() helper in place. TypeScript and build clean.
- Feature 02: Editor Chrome — EditorNavbar (fixed top bar with PanelLeftOpen/PanelLeftClose toggle) and ProjectSidebar (fixed overlay, slides from left, Projects title + close button, My Projects/Shared tabs with empty states, New Project button) added to components/editor/. Dialog pattern confirmed ready via existing components/ui/dialog.tsx. TypeScript and ESLint clean.
- Feature 03: Auth — ClerkProvider with dark theme from @clerk/ui/themes wrapping root layout. proxy.ts at project root protects all routes except /sign-in and /sign-up (defined via NEXT_PUBLIC_CLERK_SIGN_IN_URL / NEXT_PUBLIC_CLERK_SIGN_UP_URL env vars). Two-panel sign-in and sign-up pages with logo/tagline/feature list on left, Clerk form on right (form-only on mobile). Root page redirects authenticated users to /editor, unauthenticated to /sign-in. UserButton added to EditorNavbar right section. TypeScript and build clean.

## In Progress

- None.

## Next Up
- TBD (Feature 04)



## Open Questions

- None yet.

## Architecture Decisions

- shadcn/ui over Tailwind v4 (CSS-based token config via @theme inline in globals.css, no tailwind.config.js).
- Dark-only theme: all shadcn :root variables set to dark values directly — no .dark class switching.
- Do not modify generated components/ui/* files after shadcn installation.
- Next.js 16 uses proxy.ts (not middleware.ts) — same API, renamed to reflect its purpose.

## Session Notes

- Using Next.js 16.2.4 with React 19 and Tailwind CSS v4.
- shadcn version 4.5.0 was used; it auto-detected Tailwind v4.
- lucide-react ^1.11.0 installed as a direct dependency.
- @clerk/nextjs ^7.3.0 and @clerk/ui ^1.7.0 installed. Appearance uses `theme` property (not `baseTheme`) and `Variables` type from @clerk/ui/internal. proxy.ts is Next.js 16's replacement for middleware.ts — same API, renamed.
- @liveblocks/node installed alongside existing @liveblocks/client, @liveblocks/react, @liveblocks/react-flow, @liveblocks/react-ui. Liveblocks client uses lazy init (getLiveblocks()) to avoid key validation errors at build time.
- @vercel/blob ^2.3.3 installed. BLOB_READ_WRITE_TOKEN set in .env.local.
- @trigger.dev/sdk ^4.4.4 installed. trigger.config.ts reads project ref from TRIGGER_PROJECT_REF env var. TRIGGER_SECRET_KEY must be set in .env.local for triggering tasks from server code. Run `npx trigger.dev@latest dev` for local development; deploy with `npx trigger.dev@latest deploy`.
- Prisma 7.8.0 — generated client goes to app/generated/prisma/; import PrismaClient from @/app/generated/prisma/client (no index.ts in v7). Constructor always requires { adapter } argument. @prisma/adapter-pg used for all connections.
- prisma.config.ts uses schema: "prisma/" (multi-file schema) and reads DATABASE_URL from .env via dotenv.
