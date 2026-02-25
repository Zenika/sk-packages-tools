# sk-packages-tools

Shared packages and tools for Zenika starter-kit projects.

## Packages

| Package | Description |
|---------|-------------|
| [`@znk-sk-tools/eslint-config`](./packages/eslint-config) | Shared ESLint flat config for Vue 3 + TypeScript |
| [`@znk-sk-tools/tsconfig`](./packages/tsconfig) | Shared TypeScript configurations |
| [`@znk-sk-tools/vitest-config`](./packages/vitest-config) | Shared Vitest configuration |
| [`@znk-sk-tools/build`](./packages/build) | Shared build script |
| [`@znk-sk-tools/codemods`](./packages/codemods) | CLI tools and migration codemods |

## Renovate preset

Projects can extend the shared Renovate config:

```json
{
  "extends": ["github>Zenika/sk-packages-tools//packages/renovate"]
}
```

## Quick check

Run from any project to see which tools are installed:

```bash
npx @znk-sk-tools/codemods check
```

## Publishing

```bash
pnpm -r publish --access public
```
