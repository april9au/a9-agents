# Auth Patterns — Cognito + React Router v7

## Setup

Uses `@april9au/react-router-cognito-auth` for AWS Cognito OAuth 2.0 / OIDC flows with Redis session storage.

## Route protection (loader guard)

Redirect unauthenticated users in the loader — never in the component:

```tsx
import { getSession } from '~/services/auth.server'
import { redirect } from 'react-router'
import type { Route } from './+types/dashboard'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request)
  if (!session) throw redirect('/login')
  return { user: session.user }
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  return <div>Welcome, {user.name}</div>
}
```

## Auth service (server-only)

```ts
// app/services/auth.server.ts
import { CognitoAuth } from '@april9au/react-router-cognito-auth'

const auth = new CognitoAuth({
  clientId: process.env.COGNITO_CLIENT_ID!,
  clientSecret: process.env.COGNITO_CLIENT_SECRET!,
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  redirectUri: process.env.COGNITO_REDIRECT_URI!,
  sessionSecret: process.env.SESSION_SECRET!,
})

export async function getSession(request: Request) {
  return auth.getSession(request)
}

export async function requireSession(request: Request) {
  const session = await getSession(request)
  if (!session) throw redirect('/login')
  return session
}

export { auth }
```

## Login route

```tsx
// app/routes/auth.login.tsx
import { auth } from '~/services/auth.server'
import type { Route } from './+types/auth.login'

export async function loader({ request }: Route.LoaderArgs) {
  return auth.handleLogin(request)
}
```

## Callback route (OAuth redirect)

```tsx
// app/routes/auth.callback.tsx
import { auth } from '~/services/auth.server'
import type { Route } from './+types/auth.callback'

export async function loader({ request }: Route.LoaderArgs) {
  return auth.handleCallback(request)
}
```

## Logout route

```tsx
// app/routes/auth.logout.tsx
import { auth } from '~/services/auth.server'
import type { Route } from './+types/auth.logout'

export async function action({ request }: Route.ActionArgs) {
  return auth.handleLogout(request)
}

export async function loader({ request }: Route.LoaderArgs) {
  return auth.handleLogout(request)
}
```

## Accessing user in components

Pass user data through loader, never fetch client-side:

```tsx
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request)
  return { user: session.user }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  return <UserMenu name={user.name} email={user.email} />
}
```

## Role-based access

Check roles in the loader, not the component:

```tsx
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request)
  
  if (!session.user.roles.includes('admin')) {
    throw new Response('Forbidden', { status: 403 })
  }
  
  return { users: await db.user.findMany() }
}
```

## Environment variables required

```bash
COGNITO_CLIENT_ID=
COGNITO_CLIENT_SECRET=
COGNITO_USER_POOL_ID=
COGNITO_REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=
REDIS_URL=redis://localhost:6379
```

## Token refresh

The Cognito auth library handles token refresh automatically via middleware. Ensure the middleware is registered in `app/root.tsx` or via React Router middleware:

```tsx
// react-router.config.ts
import type { Config } from '@react-router/dev/config'

export default {
  middleware: ['~/middleware/auth.server'],
} satisfies Config
```

```ts
// app/middleware/auth.server.ts
import { auth } from '~/services/auth.server'
import type { unstable_MiddlewareFunction } from 'react-router'

export const unstable_middleware: unstable_MiddlewareFunction = async ({ request, next }) => {
  await auth.refreshTokenIfExpired(request)
  return next()
}
```
