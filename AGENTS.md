# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router entrypoints (`layout.tsx`, `page.tsx`) and global styles (`app/globals.css`).
- `components/`: Page/section components (e.g., `components/hero-section.tsx`) and theming/providers.
- `components/ui/`: Reusable UI primitives (shadcn/ui + Radix-based components). Prefer keeping low-level UI here.
- `hooks/`: Shared React hooks (e.g., `hooks/use-toast.ts`).
- `lib/`: Shared utilities and providers (e.g., `lib/utils.ts`, `lib/i18n.tsx`). Path alias `@/*` maps to repo root.
- `styles/`: Additional global CSS (`styles/globals.css`) when needed.

## Build, Test, and Development Commands

This repo uses `pnpm` (see `pnpm-lock.yaml`).

```bash
pnpm install        # install dependencies
pnpm dev            # start local dev server
pnpm build          # production build
pnpm start          # run the built app
pnpm lint           # run linting (ESLint)
```

## Coding Style & Naming Conventions

- Language: TypeScript + React (`.ts`/`.tsx`). Keep types strict (see `tsconfig.json`).
- Aim for a clean `pnpm build` (even though `next.config.mjs` currently ignores TypeScript build errors).
- Indentation: 2 spaces; keep files formatted consistently with nearby code.
- Components: `kebab-case` filenames (e.g., `features-section.tsx`) and `PascalCase` React component names.
- Imports: prefer aliases over relative paths, e.g. `import { Navbar } from "@/components/navbar"`.
- UI components: add/extend primitives in `components/ui/`; feature composition lives in `components/`.

## Testing Guidelines

- No automated test runner is configured in this checkout (no `__tests__/` and no `test` script in `package.json`).
- If you add tests, also add a `pnpm test` script and document the framework (e.g., Vitest/Jest) plus naming such as `*.test.ts(x)`.

## Commit & Pull Request Guidelines

- Git history is not present in this directory, so no established commit convention can be inferred here.
- Recommended: Conventional Commits (`feat: ...`, `fix: ...`, `chore: ...`) with a brief, imperative subject.
- PRs: describe the change, link related issues, and include screenshots/video for any UI changes (especially `app/` and `components/`).
