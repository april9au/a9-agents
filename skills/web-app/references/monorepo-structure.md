# Monorepo Structure — React Router v7 Apps

## Workspace layout

```
project-root/
├── apps/
│   └── my-web-app/           # React Router v7 app
│       ├── app/
│       │   ├── routes/       # File-based routes
│       │   ├── services/     # ServicesFactory + service classes
│       │   │   └── slice/    # SliceDataResolver + slice resolvers
│       │   ├── components/
│       │   ├── lib/
│       │   ├── hooks/
│       │   ├── types/
│       │   └── root.tsx
│       ├── public/
│       ├── package.json
│       ├── react-router.config.ts
│       └── vite.config.ts
├── packages/
│   └── vehicle-search-sdk/   # Internal SDK published to GitHub package registry
│       ├── src/
│       ├── package.json       # name: @april9au/vehicle-search-sdk
│       └── tsup.config.ts
├── package.json               # Yarn workspaces root
└── nx.json                    # Nx task orchestration
```

## Package manager

Yarn workspaces (v4+) with Nx for task orchestration.

```bash
# Run in app context
yarn workspace my-web-app dev
yarn workspace my-web-app build

# Run across all workspaces
yarn nx run-many --target=build
```

## Internal packages

Internal SDKs live in `packages/` and are published to the GitHub package registry:

```json
{
  "name": "@april9au/vehicle-search-sdk",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

Build with `tsup`:

```ts
// packages/my-sdk/tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```

Reference from the app:

```json
{
  "dependencies": {
    "@april9au/vehicle-search-sdk": "workspace:*"
  }
}
```

## Common internal packages used

| Package | Purpose |
|---|---|
| `@april9au/react-router-cognito-auth` | AWS Cognito OAuth flows + session management |
| `@april9au/connectors-library` | `A9Logger`, API connectors |
| `@april9au/react-common` | Shared React utilities, env helpers |
| `@april9au/vehicle-search-sdk` | Vehicle search SDK (domain-specific) |

## App entry points

```
app/
├── root.tsx              # Root layout, global providers, root loader/action
├── entry.server.tsx      # SSR entry: Sentry init, CSP nonce, cache warm-up, streaming
├── entry.client.tsx      # Hydration entry
├── app.css               # Global styles (Tailwind imports + @layer components)
└── react-router.config.ts
```

### `entry.server.tsx` responsibilities

- Initialize Sentry before anything else
- Pre-warm website config cache (`websiteConfigService.init(domain)`)
- Inject CSP nonce for inline scripts
- Use `onAllReady` (wait for full render) for bots, `onShellReady` (streaming) for browsers
- Set global `ENV` variable for client-side access

```ts
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  const nonce = crypto.randomUUID()
  const isBot = /bot|crawler|spider/i.test(request.headers.get('user-agent') ?? '')

  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} nonce={nonce} />,
      {
        [isBot ? 'onAllReady' : 'onShellReady']() {
          const body = new PassThrough()
          resolve(new Response(Readable.toWeb(body) as ReadableStream, {
            status: responseStatusCode,
            headers: responseHeaders,
          }))
          pipe(body)
        },
        onShellError: reject,
      },
    )
    setTimeout(abort, 5000)
  })
}
```

## Config management

Centralise all environment variables with Zod validation at startup. **Never** access `process.env` directly outside `config.server.ts`:

```ts
// app/config.server.ts
import { z } from 'zod'

const ConfigSchema = z.object({
  REDIS_URL: z.string().url(),
  COGNITO_CLIENT_ID: z.string().min(1),
  COGNITO_CLIENT_SECRET: z.string().min(1),
  API_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const config = ConfigSchema.parse(process.env)

export function getPublicEnv() {
  return {
    NODE_ENV: config.NODE_ENV,
  }
}
```

## Nx task configuration

```json
// nx.json
{
  "targetDefaults": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "dependsOn": ["^build"] }
  }
}
```

```json
// apps/my-web-app/package.json
{
  "scripts": {
    "dev": "react-router dev",
    "build": "react-router build",
    "start": "react-router-serve ./build/server/index.js",
    "lint": "eslint app/",
    "typecheck": "tsc --noEmit"
  }
}
```

