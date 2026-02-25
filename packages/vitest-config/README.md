# @znk-sk-tools/vitest-config

Shared Vitest configuration for Vue 3 projects.

## Install

```bash
pnpm add -D @znk-sk-tools/vitest-config vitest vite
```

## Usage

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import configShared from '@znk-sk-tools/vitest-config'

export default mergeConfig(
    configShared,
    defineConfig({
        test: {
            root: import.meta.dirname,
        },
    })
)
```

## Setup file

A shared setup file is available at `@znk-sk-tools/vitest-config/setup`.

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import configShared from '@znk-sk-tools/vitest-config'

export default mergeConfig(
    configShared,
    defineConfig({
        test: {
            setupFiles: ['@znk-sk-tools/vitest-config/setup'],
        },
    })
)
```
