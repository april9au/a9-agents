# Loaders & Actions — React Router v7

## Loaders (data fetching)

Always fetch data in `loader`, never in `useEffect`.

```tsx
import type { Route } from './+types/users'

export async function loader({ request, params }: Route.LoaderArgs) {
  const users = await db.user.findMany()
  return { users }
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

## Actions (mutations)

Handle form submissions and mutations in `action`.

```tsx
import { redirect } from 'react-router'
import type { Route } from './+types/users.new'

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  
  const user = await db.user.create({ data: { name } })
  return redirect(`/users/${user.id}`)
}
```

Return data (not redirect) when you need to show results in the same route:

```tsx
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const result = await processForm(formData)
  
  if (!result.success) {
    return { errors: result.errors }
  }
  
  return redirect('/success')
}

export default function Page({ actionData }: Route.ComponentProps) {
  return (
    <div>
      {actionData?.errors && <ErrorList errors={actionData.errors} />}
      <form method="post">...</form>
    </div>
  )
}
```

## useFetcher (non-navigating mutations)

For mutations that should NOT navigate (inline edits, toggles, sub-forms):

```tsx
import { useFetcher } from 'react-router'

function ToggleFavorite({ userId }: { userId: string }) {
  const fetcher = useFetcher()
  const isSaving = fetcher.state !== 'idle'

  return (
    <fetcher.Form method="post" action={`/users/${userId}/favorite`}>
      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Toggle Favorite'}
      </button>
    </fetcher.Form>
  )
}
```

## Optimistic UI

Show instant feedback before the server confirms:

```tsx
import { useOptimistic } from 'react'
import { useFetcher } from 'react-router'

function TodoItem({ todo }: { todo: Todo }) {
  const fetcher = useFetcher()
  const [optimisticDone, setOptimisticDone] = useOptimistic(todo.done)

  return (
    <fetcher.Form
      method="post"
      action={`/todos/${todo.id}/toggle`}
      onSubmit={() => setOptimisticDone(d => !d)}
    >
      <input type="checkbox" checked={optimisticDone} readOnly />
      <button type="submit">Toggle</button>
    </fetcher.Form>
  )
}
```

## Streaming with Suspense (defer)

For slow data that shouldn't block the page render:

```tsx
import { defer, Await } from 'react-router'
import { Suspense } from 'react'

export async function loader() {
  const fastData = await getFastData()
  const slowData = getSlowData() // NOT awaited
  
  return defer({ fastData, slowData })
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { fastData, slowData } = loaderData
  
  return (
    <div>
      <FastSection data={fastData} />
      <Suspense fallback={<Skeleton />}>
        <Await resolve={slowData}>
          {(data) => <SlowSection data={data} />}
        </Await>
      </Suspense>
    </div>
  )
}
```

## Error handling in loaders

Throw `Response` objects for HTTP errors:

```tsx
export async function loader({ params }: Route.LoaderArgs) {
  const user = await db.user.findUnique({ where: { id: params.id } })
  
  if (!user) {
    throw new Response('Not Found', { status: 404 })
  }
  
  return { user }
}
```

The route's `ErrorBoundary` catches these:

```tsx
import { isRouteErrorResponse, useRouteError } from 'react-router'

export function ErrorBoundary() {
  const error = useRouteError()
  
  if (isRouteErrorResponse(error)) {
    return <div>{error.status} — {error.data}</div>
  }
  
  return <div>Unexpected error</div>
}
```

## Revalidation after mutations

After an action, React Router automatically revalidates all active loaders. To skip specific loaders:

```tsx
export function shouldRevalidate({ actionResult, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (actionResult?.skipRevalidation) return false
  return defaultShouldRevalidate
}
```
