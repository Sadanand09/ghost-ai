# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 09 (Share Dialog) — complete

## Current Goal
- Feature 09: Share dialog with invite/remove collaborators and Clerk-enriched avatars

## Completed

- Feature 01: Design System — shadcn@4.5.0 initialized for Tailwind v4 (CSS-based config, no tailwind.config.js), dark-only theme tokens in globals.css (:root sets all shadcn + custom vars to dark values directly, no .dark switching), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added to components/ui/, lucide-react installed, lib/utils.ts cn() helper in place. TypeScript and build clean.
- Feature 02: Editor Chrome — EditorNavbar (fixed top bar with PanelLeftOpen/PanelLeftClose toggle) and ProjectSidebar (fixed overlay, slides from left, Projects title + close button, My Projects/Shared tabs with empty states, New Project button) added to components/editor/. Dialog pattern confirmed ready via existing components/ui/dialog.tsx. TypeScript and ESLint clean.
- Feature 03: Auth — ClerkProvider with dark theme from @clerk/ui/themes wrapping root layout. proxy.ts at project root protects all routes except /sign-in and /sign-up (defined via NEXT_PUBLIC_CLERK_SIGN_IN_URL / NEXT_PUBLIC_CLERK_SIGN_UP_URL env vars). Two-panel sign-in and sign-up pages with logo/tagline/feature list on left, Clerk form on right (form-only on mobile). Root page redirects authenticated users to /editor, unauthenticated to /sign-in. UserButton added to EditorNavbar right section. TypeScript and build clean.
- Feature 04: Project Dialogs — editor home screen (heading + description + New Project button, centered). useProjectDialogs hook in hooks/use-project-dialogs.ts manages dialog/form/loading state; toSlug exported. CreateProjectDialog (name input + live slug preview), RenameProjectDialog (prefilled, auto-focus, Enter submits), DeleteProjectDialog (destructive confirm only) — all with onConfirm callbacks. Editor page holds projects[] state; handleCreate/Rename/Delete update it and call closeDialog(). ProjectSidebar accepts projects prop (splits owned/shared), removes hardcoded mock data, overrides tab trigger text to text-copy-secondary/text-copy-primary. Dialog descriptions use text-copy-secondary (was text-muted-foreground). Home description uses text-copy-secondary. TypeScript and ESLint clean.
- Feature 05: Prisma — Project and ProjectCollaborator models in prisma/models/project.prisma (enum ProjectStatus DRAFT/ARCHIVED, cascade delete, unique constraint on project/email, indexes on ownerId, createdAt, email, projectId+createdAt). Fixed schema.prisma output path typo (..app → ../app). lib/prisma.ts singleton branches on DATABASE_URL: prisma+postgres:// uses accelerateUrl, otherwise PrismaPg adapter. Migration 20260505010628_init_projects applied. Client generated to app/generated/prisma/. Build clean.
- Feature 06: Project APIs — GET /api/projects (list owner's projects), POST /api/projects (create, defaults name to "Untitled Project"), PATCH /api/projects/[projectId] (rename), DELETE /api/projects/[projectId] (delete). Auth via Clerk auth(): 401 for unauthenticated, 403 for non-owner mutations. Ownership verified with a findUnique before every mutation. Build clean.
- Feature 07: Wire Editor Home — app/editor/page.tsx converted to async server component; fetches owned+shared projects via lib/projects.ts (Prisma + Clerk currentUser for email lookup). EditorHome client wrapper in components/editor/editor-home.tsx. useProjectActions hook in hooks/use-project-actions.ts manages dialog state + API mutations (POST /api/projects with client-generated roomId slug+suffix, PATCH for rename, DELETE with redirect vs refresh). POST handler updated to accept optional id. CreateProjectDialog shows Room ID preview; all dialogs have isLoading state. Project interface slug field removed. Build clean.
- Feature 08: Editor Workspace Shell — app/editor/[roomId]/page.tsx is an async server component; unauthenticated users redirect to /sign-in, non-existent or unauthorized projects render AccessDenied. lib/project-access.ts exposes getCurrentIdentity() (Clerk userId + primary email) and getProjectIfAccessible() (owner or collaborator check via Prisma). components/editor/access-denied.tsx: centered lock icon + message + /editor link. components/editor/editor-workspace.tsx: client shell with sidebar toggle + AI panel toggle state, navbar showing project name + Share placeholder + AI toggle, existing ProjectSidebar with currentProjectId highlight, canvas placeholder, right AI sidebar placeholder. ProjectSidebar updated with optional currentProjectId prop; active project item renders bg-elevated persistently. Build clean.
- Feature 09: Share Dialog — GET/POST /api/projects/[projectId]/collaborators and DELETE /api/projects/[projectId]/collaborators/[email] routes. Ownership enforced server-side for all mutations. Clerk Backend API (clerkClient().users.getUserList) enriches collaborator emails with display name and avatar; falls back to email-only. components/editor/share-dialog.tsx: owners see invite form, collaborator list with remove buttons, and copy-link; collaborators see read-only list only. EditorWorkspace accepts isOwner prop; Share button opens dialog. page.tsx passes isOwner from getProjectIfAccessible result. Build clean.

## In Progress

- None.

## Next Up
- TBD (Feature 10)



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
