# CI Setup — GitHub Actions

## Lint and type check (PRs + main)

```yaml
# .github/workflows/lint-ts-check.yml
name: Lint and TS check

on:
  push:
    branches:
      - main
      - "release/**"
  pull_request:
    branches:
      - main
      - "release/**"

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'

      - name: Install dependencies
        env:
          PACKAGES_GITHUB_TOKEN: ${{ secrets.PACKAGES_GITHUB_TOKEN }}
        run: yarn --immutable

      - run: yarn lint

  "notify_on_discord":
    runs-on: ubuntu-latest
    needs:
      - eslint
    if: ${{ failure() }}

    steps:
      - name: Test Failure
        uses: rjstone/discord-webhook-notify@v1
        with:
          severity: error
          details: GitHub build failed
          webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
```

## Publish on release branch (using shared CI workflows)

```yaml
# .github/workflows/ci-multi-job-workflow.yml
name: CI Multi Job Workflow

on:
  push:
    branches:
      - "release/**"
  release:
    types:
      - published
  workflow_dispatch:
    inputs:
      branch:
        description: "Name of the GitHub branch to create release off."
        required: true
        default: "main"

concurrency:
  group: ${{ github.ref }}

jobs:
  "generate_version":
    uses: april9au/a9-ci-workflows/.github/workflows/generate-version.yml@v1.0.0

  "publish_github_packages":
    uses: april9au/a9-ci-workflows/.github/workflows/publish-github-packages.yml@v1.0.0
    needs: generate_version
    with:
      PACKAGE_VERSION: ${{ needs.generate_version.outputs.PACKAGE_VERSION }}
    secrets:
      PACKAGES_GITHUB_TOKEN: ${{ secrets.PACKAGES_GITHUB_TOKEN }}

  "notify_on_discord":
    runs-on: ubuntu-latest
    needs:
      - generate_version
      - publish_github_packages
    if: ${{ failure() }}

    steps:
      - name: Test Failure
        uses: rjstone/discord-webhook-notify@v1
        with:
          severity: error
          details: GitHub build failed
          webhookUrl: ${{ secrets.DISCORD_WEBHOOK }}
```

Key points:
- Job names in quotes to match the company convention
- `PACKAGE_VERSION` is uppercase — this is the key passed to `publish-github-packages.yml`
- `concurrency: group: ${{ github.ref }}` prevents duplicate runs on the same branch
- `release: types: [published]` also triggers on GitHub release events

## Required GitHub secrets

Set these under repository Settings → Secrets and variables → Actions:

| Secret | Description |
|---|---|
| `PACKAGES_GITHUB_TOKEN` | PAT with `read:packages` + `write:packages` + `contents:write` scopes |
| `DISCORD_WEBHOOK` | Discord webhook URL for failure notifications |

## .nvmrc

Pin the Node version used in CI:

```
22
```

## Permissions note

The workflow needs `contents: write` to push version tags and `packages: write` to publish. For organisation repos, the `PACKAGES_GITHUB_TOKEN` must belong to a user with write access to the repo.
