# Publishing Workflow — Lerna + Versioning

## Lerna setup

```bash
yarn add -D lerna@^8.1.8 -W   # -W installs at workspace root
```

`lerna.json` at the monorepo root:

```json
{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "0.1.0",
  "npmClient": "yarn"
}
```

Root `package.json` scripts:

```json
{
  "private": true,
  "scripts": {
    "version:packages": "lerna version",
    "publish:packages": "lerna run test && lerna publish"
  }
}
```

## Versioning

Lerna reads conventional commits to determine version bumps:

| Commit prefix | Version bump |
|---|---|
| `fix:` | patch (0.0.x) |
| `feat:` | minor (0.x.0) |
| `feat!:` or `BREAKING CHANGE` | major (x.0.0) |

Bump versions manually (creates git tags):

```bash
yarn version:packages
# or for a specific bump:
lerna version patch --yes
lerna version minor --yes
lerna version major --yes
```

Lerna will:
1. Determine the new version
2. Update all `package.json` files
3. Create a git commit and tag
4. Push to remote

## Publishing

```bash
yarn publish:packages
```

This runs `lerna run test` across all packages first, then `lerna publish` which:
1. Builds each package via its `prepublish` script (lint + build)
2. Publishes to `https://npm.pkg.github.com` using `PACKAGES_GITHUB_TOKEN`
3. Tags the release in git

## Release branch workflow

1. Create a release branch from main:
   ```bash
   git checkout -b release/X.Y.Z
   ```

2. Push to trigger the GitHub Actions publish workflow (see `ci-setup.md`)

3. The CI job generates the version from git history and publishes automatically

## GitVersion (optional)

If using GitVersion for automatic semantic versioning from branch names:

```yaml
# GitVersion.yml
mode: ContinuousDelivery
branches:
  release:
    tag: 'rc'
```

Release branches (`release/1.0.0`) produce release candidate versions (e.g., `1.0.0-rc.1`). Merging to main produces the final version.

## Conventional commits enforcement

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional -W
```

`commitlint.config.js`:

```js
export default {
  extends: ['@commitlint/config-conventional'],
}
```

`package.json` (root):

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

`.husky/commit-msg`:

```bash
#!/bin/sh
npx --no -- commitlint --edit "$1"
```
