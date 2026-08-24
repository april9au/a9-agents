# React Patterns — React 19 + React Router v7

## React 19 hooks

### useActionState

Manage form action state with built-in pending tracking:

```tsx
import { useActionState } from 'react'

async function submitForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const result = await saveData(formData)
  if (!result.ok) return { error: result.message }
  return { success: true }
}

function MyForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null)

  return (
    <form action={formAction}>
      {state?.error && <p className="text-red-600">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### useOptimistic

Instant UI updates before server confirmation:

```tsx
import { useOptimistic, useTransition } from 'react'

function MessageList({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  )
  const [isPending, startTransition] = useTransition()

  const send = (text: string) => {
    startTransition(async () => {
      addOptimisticMessage({ id: crypto.randomUUID(), text, pending: true })
      await sendMessage(text)
    })
  }

  return <ul>{optimisticMessages.map(m => <li key={m.id}>{m.text}</li>)}</ul>
}
```

### useTransition

Defer non-urgent state updates to keep UI responsive:

```tsx
import { useTransition } from 'react'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setQuery(value) // immediate
    startTransition(async () => {
      const data = await searchAPI(value)
      setResults(data) // deferred
    })
  }

  return (
    <div>
      <input value={query} onChange={e => handleSearch(e.target.value)} />
      <div className={cn(isPending && 'opacity-50')}>
        {results.map(r => <Result key={r.id} data={r} />)}
      </div>
    </div>
  )
}
```

## Suspense patterns

```tsx
import { Suspense } from 'react'

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UserDashboard />
    </Suspense>
  )
}
```

Keep Suspense boundaries close to the async component. Avoid single root Suspense for the whole app.

## Error boundaries

```tsx
import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
```

In React Router v7, prefer route-level `ErrorBoundary` exports over class boundaries.

## Custom hooks

Extract reusable logic into hooks in `app/hooks/`:

```tsx
// app/hooks/use-disclosure.ts
import { useState, useCallback } from 'react'

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])
  return { isOpen, open, close, toggle }
}
```

## Performance patterns

**React.memo** — prevent re-renders when props haven't changed:

```tsx
const Row = React.memo(function Row({ user }: { user: User }) {
  return <tr><td>{user.name}</td></tr>
})
```

**useMemo** — memoize expensive computations:

```tsx
const sortedUsers = useMemo(
  () => users.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [users]
)
```

**useCallback** — stable function references for child props:

```tsx
const handleDelete = useCallback(async (id: string) => {
  await deleteUser(id)
  revalidator.revalidate()
}, [revalidator])
```

**useDeferredValue** — keep search input responsive:

```tsx
const deferredQuery = useDeferredValue(query)
const results = useMemo(() => filter(items, deferredQuery), [items, deferredQuery])
```

## Context pattern (avoid prop drilling)

```tsx
// app/context/theme-context.tsx
import { createContext, useContext, useState } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```
