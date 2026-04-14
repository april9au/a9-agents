---
name: github-packages
description: Publish and consume private npm packages via the GitHub package registry. Covers new package setup, .yarnrc.yml auth, Lerna versioning, GitHub Actions CI, and consumer configuration.
user-invocable: false
---

Use this skill when creating a new publishable package or wiring an existing project to consume `@april9au/*` private packages.

## Feature decomposition

```
Task
  └─ New package in a monorepo?       → references/package-setup.md
  └─ Auth / token / .yarnrc.yml?      → references/registry-auth.md
  └─ Versioning and publishing?       → references/publishing-workflow.md
  └─ GitHub Actions CI setup?         → references/ci-setup.md
  └─ Consuming a private package?     → references/registry-auth.md (consumer section)
```

## Load the relevant reference

| Task | Reference file |
|---|---|
| New package — package.json, tsup, TypeScript | [references/package-setup.md](references/package-setup.md) |
| Auth — .yarnrc.yml, token, .env.local | [references/registry-auth.md](references/registry-auth.md) |
| Versioning and publishing with Lerna | [references/publishing-workflow.md](references/publishing-workflow.md) |
| GitHub Actions CI and publish workflows | [references/ci-setup.md](references/ci-setup.md) |

## Critical rules

- Package `name` must be scoped: `@april9au/<package-name>`
- Always set `"publishConfig": { "registry": "https://npm.pkg.github.com" }` in `package.json`
- Never commit tokens — use `PACKAGES_GITHUB_TOKEN` env var injected from `.env.local` (gitignored) or GitHub Actions secrets
- Root monorepo `package.json` must be `"private": true`
- Run `prepublish` script before publishing: lint + build (add tests if package has a test suite)
- Consumers need `PACKAGES_GITHUB_TOKEN` with `read:packages` scope to install

## Delivery checklist

- [ ] Package `name` is `@april9au/<name>` and has `publishConfig` pointing to GitHub registry
- [ ] `tsup.config.ts` builds to `dist/` with `dts: true`
- [ ] `package.json` `main`/`types`/`exports` point to `dist/`
- [ ] `.yarnrc.yml` has `npmScopes.april9au` configured with `PACKAGES_GITHUB_TOKEN`
- [ ] `.env.local` is gitignored and contains developer token
- [ ] `prepublish` runs lint + build (+ test if applicable)
- [ ] GitHub Actions workflow publishes on `release/**` branch push
- [ ] `PACKAGES_GITHUB_TOKEN` secret is set in GitHub repository settings
