# Package Setup — New Private Package

## package.json

```json
{
  "name": "@april9au/my-package",
  "version": "0.1.0",
  "description": "Short description",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.cjs",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "scripts": {
    "build": "tsup-node",
    "lint": "eslint src/**/*.ts* --cache --cache-location .cache/.eslintcache",
    "typecheck": "tsc --noEmit",
    "prepublish": "yarn lint && yarn build"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.6.0"
  }
}
```

If the package has a test suite, include tests in `prepublish`:

```json
{
  "scripts": {
    "prepublish": "yarn lint && yarn test && yarn build"
  }
}
```

For a CLI package, add:

```json
{
  "bin": {
    "my-cli": "./dist/cli.js"
  }
}
```

## tsup.config.ts — library

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  outDir: 'dist',
  splitting: false,
})
```

## tsup.config.ts — library + CLI

```ts
import { defineConfig } from 'tsup'

export default defineConfig([
  {
    clean: true,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    outDir: 'dist',
    splitting: false,
  },
  {
    clean: false,
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    sourcemap: true,
    outDir: 'dist',
    banner: { js: '#!/usr/bin/env node' },
  },
])
```

## tsconfig.json

```json
{
  "extends": "@april9au/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

If the shared TypeScript config isn't available, use:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## Source entry point

```ts
// src/index.ts — export everything public
export { MyClass } from './my-class.js'
export type { MyOptions } from './types.js'
```

Note: use `.js` extensions in imports even for `.ts` source files (ESM + bundler moduleResolution requirement).

## Monorepo placement

```
packages/
└── my-package/
    ├── src/
    │   └── index.ts
    ├── package.json
    ├── tsup.config.ts
    └── tsconfig.json
```

Add to root `package.json` workspaces:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```
