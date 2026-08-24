# Service Patterns — ServicesFactory

## ServicesFactory

Services are **never instantiated directly in loaders**. All service construction goes through `ServicesFactory`, which builds a context-aware collection based on auth state.

```ts
// app/services/servicesFactory.ts

export class ServicesFactory {
  static forAnonymous(request?: Request): BaseServices {
    const logger = new AppLogger()
    const productService = new ProductService(logger)
    const contentService = new ContentService(logger)

    return { logger, productService, contentService }
  }

  static forAuthenticated(user: User, session: Session, request: Request): AuthenticatedServices {
    const base = ServicesFactory.forAnonymous(request)
    const accountService = new AccountService(user, session)
    return { ...base, accountService }
  }
}
```

**Conditional type** selects the right interface at compile time:

```ts
type ServicesFor<T extends 'authenticated' | 'anonymous'> =
  T extends 'authenticated' ? AuthenticatedServices : BaseServices
```

## Usage in loaders and actions

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const { productService } = ServicesFactory.forAnonymous(request)
  const products = await productService.list()
  return { products }
}
```

For authenticated routes:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireSession(request)
  const { accountService } = ServicesFactory.forAuthenticated(session.user, session, request)
  const account = await accountService.getCurrent()
  return { account }
}
```

## Service class conventions

- Accept dependencies as constructor arguments — no global singletons, no service locators
- Expensive one-time init (SDK, API client) is lazy — initialized on first call, cached in a `Promise`

```ts
export class ProductService {
  private clientPromise: Promise<ProductApiClient> | null = null

  constructor(private logger: ILogger) {}

  private getClient(): Promise<ProductApiClient> {
    if (!this.clientPromise) {
      this.clientPromise = ProductApiClient.init()
    }
    return this.clientPromise
  }

  async list(): Promise<Product[]> {
    const client = await this.getClient()
    return client.getProducts()
  }
}
```

## In-flight deduplication

Prevent duplicate API calls for the same resource within a single request cycle:

```ts
export class ConfigService {
  private inFlight = new Map<string, Promise<AppConfig>>()

  async getConfig(key: string): Promise<AppConfig> {
    if (!this.inFlight.has(key)) {
      this.inFlight.set(key, this.fetchConfig(key))
    }
    return this.inFlight.get(key)!
  }

  private async fetchConfig(key: string): Promise<AppConfig> {
    const cached = await cache.get(key)
    if (cached) return cached

    const config = await api.getConfig(key)
    await cache.set(key, config, { ttl: 900 })
    return config
  }
}
```
