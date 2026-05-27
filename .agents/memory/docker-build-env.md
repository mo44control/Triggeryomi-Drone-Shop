---
name: Docker Build Environment
description: Why Docker builds must use Debian (glibc) node images, not Alpine
---

# Docker Build Environment

## Rule
Dockerfiles must use `node:24-slim` (Debian/glibc), never `node:24-alpine` (musl).

**Why:** `pnpm-workspace.yaml` overrides exclude all musl-specific platform binaries (e.g. `rollup>@rollup/rollup-linux-x64-musl`, `lightningcss>lightningcss-linux-x64-musl`, `@tailwindcss/oxide>@tailwindcss/oxide-linux-x64-musl`). These exclusions were added to keep Replit's glibc environment lean. Alpine uses musl libc and needs those packages — they're gone, so builds fail with "Cannot find module @rollup/rollup-linux-x64-musl".

**How to apply:** Any Dockerfile that runs `pnpm install` must use a glibc-based image for the builder stage. The final nginx or other non-node stages can still use alpine.

## pnpm build-script approval
`onlyBuiltDependencies` must be declared in BOTH `pnpm-workspace.yaml` AND `package.json` under `"pnpm": { "onlyBuiltDependencies": [...] }`. Newer pnpm versions (10.x) check `package.json` first and may not fall back to `pnpm-workspace.yaml` alone. Packages that need it: `esbuild`, `@swc/core`, `msw`, `unrs-resolver`.

Also pin pnpm to a specific version in Dockerfiles (`pnpm@10.11.0`) rather than `@latest` to avoid version-drift breaking the build.
