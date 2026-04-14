# Registry Auth — .yarnrc.yml, Tokens, Consumer Setup

## Publisher setup (.yarnrc.yml)

Scoped registry config so `@april9au/*` packages resolve to GitHub, not public npm:

```yaml
# .yarnrc.yml (root of monorepo)
npmScopes:
  april9au:
    npmAlwaysAuth: true
    npmAuthToken: '${PACKAGES_GITHUB_TOKEN:-}'
    npmRegistryServer: 'https://npm.pkg.github.com'
injectEnvironmentFiles:
  - '.env.local?'
```

The `?` suffix makes `.env.local` optional — CI uses the env var directly, local dev uses the file.

## Local developer token (.env.local)

```bash
# .env.local — gitignored, never committed
PACKAGES_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

Ensure `.env.local` is in `.gitignore`:

```
.env.local
```

The token needs `read:packages` scope for installing, `write:packages` scope for publishing. Generate at GitHub → Settings → Developer settings → Personal access tokens.

## Consumer setup — Yarn monorepo

Same `.yarnrc.yml` config as above. The consuming project only needs `read:packages` scope.

Install the package:

```bash
yarn add @april9au/my-package
```

Yarn automatically routes `@april9au/*` to the GitHub registry using `PACKAGES_GITHUB_TOKEN`.

## Consumer setup — npm project

Add `.npmrc` to the project root:

```
@april9au:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${PACKAGES_GITHUB_TOKEN}
```

Then install normally:

```bash
npm install @april9au/my-package
```

## Consumer setup — global CLI install

```bash
npm install -g @april9au/my-cli \
  --registry=https://npm.pkg.github.com \
  --//npm.pkg.github.com/:_authToken=${PACKAGES_GITHUB_TOKEN}
```

## CI authentication

Pass `PACKAGES_GITHUB_TOKEN` as an environment variable during install — never hardcode:

```yaml
- name: Install dependencies
  env:
    PACKAGES_GITHUB_TOKEN: ${{ secrets.PACKAGES_GITHUB_TOKEN }}
  run: yarn --immutable
```

The secret must be added to the GitHub repository under Settings → Secrets and variables → Actions.
