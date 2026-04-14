---
name: web-app
description: React Router v7 full-stack web application patterns — routing, loaders, actions, forms, styling, auth. Use when building React Router v7 web apps (not Stack9 frontend).
user-invocable: false
---

Think in **full vertical slices** — own the route, loader, action, form, and UI together. Never split a feature across partial layers.

## Feature decomposition

```
Feature Request
  └─ New page or route?          → app/routes/
  └─ Server data needed?         → loader in route module
  └─ Mutation or form submit?    → action in route module
  └─ Reusable UI element?        → app/components/
  └─ Auth guard needed?          → middleware or loader redirect
  └─ Form with validation?       → Conform + Zod
  └─ Shared business logic?      → app/lib/ or app/services/
```

## Load the relevant reference

Read only what the current task requires:

| Building | Reference file |
|---|---|
| Routes, file structure, navigation | [references/routing-conventions.md](references/routing-conventions.md) |
| Loaders, actions, data fetching, optimistic UI | [references/loaders-actions.md](references/loaders-actions.md) |
| React 19 hooks, Suspense, error boundaries | [references/react-patterns.md](references/react-patterns.md) |
| Tailwind 4, Radix UI, CVA, cn() | [references/styling-components.md](references/styling-components.md) |
| Conform, Zod, form validation | [references/forms-validation.md](references/forms-validation.md) |
| Cognito auth, session, route protection | [references/auth-patterns.md](references/auth-patterns.md) |
| ServicesFactory, slice resolvers, service classes | [references/service-patterns.md](references/service-patterns.md) |
| Monorepo layout, entry points, config, Nx | [references/monorepo-structure.md](references/monorepo-structure.md) |

## Critical rules

**Services:**
- Never instantiate services directly in loaders — always use `ServicesFactory.forAnonymous(request)` or `ServicesFactory.forAuthenticated(user, session, request)`
- Business logic lives in service classes, not in loaders/actions — keep routes thin

**Routing:**
- Use file-based routing with `@react-router/fs-routes`
- Always export `loader`, `action`, `meta`, `ErrorBoundary` from route modules as needed
- Prefer nested layouts over repeated UI

**Data:**
- Fetch data in `loader` — never in `useEffect`
- Mutations go in `action` — never in event handlers calling fetch/axios
- Use `useOptimistic` for instant feedback on mutations

**Forms:**
- Always use Conform + Zod for form handling
- Implement progressive enhancement — forms must work without JS
- Validate on both client and server

**Styling:**
- Use `cn()` from `~/lib/utils` for conditional classes
- Use CVA for component variants, not inline ternaries
- Never use inline styles

**Types:**
- Never use `any` — always type loaders, actions, and component props
- Use `Route.LoaderArgs`, `Route.ActionArgs` from generated route types

## File structure

```
app/
├── routes/               # File-based routes
│   ├── _index.tsx       # Index route (/)
│   ├── _layout.tsx      # Root layout
│   ├── users/
│   │   ├── $id.tsx      # Dynamic param
│   │   └── new.tsx
├── components/
│   ├── ui/              # Radix-based primitives
│   └── forms/           # Form components
├── lib/
│   └── utils.ts         # cn() and helpers
├── hooks/               # Custom React hooks
├── services/            # API / business logic
├── types/               # Shared TypeScript types
└── assets/
    └── icons/           # SVG sprite icons
```

## Delivery checklist

- [ ] Route file created in `app/routes/` following file naming conventions
- [ ] `loader` typed with `Route.LoaderArgs`, returns typed data
- [ ] `action` handles mutation, returns typed result or redirect
- [ ] `meta` export set for SEO
- [ ] `ErrorBoundary` exported from route for error states
- [ ] Form uses Conform + Zod with server-side validation
- [ ] Loading/pending states handled (`navigation.state`, `useOptimistic`)
- [ ] Components use `cn()` and CVA for styling
- [ ] No `any` types — strict TypeScript throughout
- [ ] Auth guard in loader if route is protected
