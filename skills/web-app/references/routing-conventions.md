# Routing Conventions — React Router v7

## File naming

| File | Route |
|---|---|
| `routes/_index.tsx` | `/` |
| `routes/users.tsx` | `/users` |
| `routes/users.$id.tsx` | `/users/:id` |
| `routes/users_.new.tsx` | `/users/new` (no layout nesting) |
| `routes/_layout.tsx` | Layout wrapper (no URL segment) |
| `routes/_layout.users.tsx` | `/users` inside `_layout` |

Prefix with `_` to create pathless layouts. Use `$` for dynamic segments.

## Route module exports

Every route module can export these named exports:

```tsx
import type { Route } from './+types/users.$id'

export async function loader({ params, request, context }: Route.LoaderArgs) {
  return { user: await getUser(params.id) }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData()
  // handle mutation
  return redirect('/users')
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.user.name ?? 'User' },
    { name: 'description', content: 'User profile page' },
  ]
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <div>Something went wrong: {error.message}</div>
}

export default function UserPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  return <div>{user.name}</div>
}
```

## Layout nesting

```tsx
// routes/_layout.tsx — shared chrome
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Nav />
      <main>{children}</main>
    </div>
  )
}
```

Child routes render into the parent's `<Outlet />`:

```tsx
import { Outlet } from 'react-router'

export default function UsersLayout() {
  return (
    <section>
      <h1>Users</h1>
      <Outlet />
    </section>
  )
}
```

## Navigation

```tsx
import { Link, NavLink, useNavigate } from 'react-router'

// Declarative
<Link to="/users/123">View user</Link>

// Active styling
<NavLink to="/dashboard" className={({ isActive }) => cn('nav-link', isActive && 'active')}>
  Dashboard
</NavLink>

// Programmatic
const navigate = useNavigate()
navigate('/users', { replace: true })
```

## Pending navigation state

```tsx
import { useNavigation } from 'react-router'

export default function Page() {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'
  
  return <div className={cn(isLoading && 'opacity-50')}>...</div>
}
```

## File-based routing config (vite.config.ts)

```ts
import { reactRouter } from '@react-router/dev/vite'
import { flatRoutes } from '@react-router/fs-routes'

export default defineConfig({
  plugins: [
    reactRouter({
      future: { v3_singleFetch: true },
      async routes() {
        return flatRoutes()
      },
    }),
  ],
})
```

## Redirects

```tsx
import { redirect } from 'react-router'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request)
  if (!session) throw redirect('/login')
  return { user: session.user }
}
```
