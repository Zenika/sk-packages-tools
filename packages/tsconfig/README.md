# @znk-sk-tools/tsconfig

Shared TypeScript configurations for Vue 3 projects.

## Install

```bash
pnpm add -D @znk-sk-tools/tsconfig
```

## Usage

### tsconfig.app.json

```json
{
  "extends": "@znk-sk-tools/tsconfig/tsconfig.app.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

### tsconfig.vitest.json

```json
{
  "extends": "@znk-sk-tools/tsconfig/tsconfig.vitest.json",
  "include": ["src/**/*.ts"]
}
```
