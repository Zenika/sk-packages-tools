# @znk-sk-tools/codemods

Migration codemods to update existing projects to use znk-sk-tools shared configs.

## Usage

Run from the root of the project to migrate:

```bash
npx @znk-sk-tools/codemods vitest
```

## Available codemods

### vitest

Migrates an existing `vitest.config.ts` to use `@znk-sk-tools/vitest-config`.

- Parses the existing config with ts-morph
- Identifies custom overrides (anything not already in the shared defaults)
- Rewrites the config using `createVitestConfig()` with only the custom parts
- Installs `@znk-sk-tools/vitest-config` automatically

**Before:**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        silent: true,
        deps: { inline: ['vuetify'] },
        coverage: { provider: 'istanbul', reporter: ['lcov'] },
        setupFiles: ['./tests/unit/setup.ts'],
        globals: true,
    },
})
```

**After:**

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import configShared from '@znk-sk-tools/vitest-config'

export default mergeConfig(
    configShared,
    defineConfig({
        test: {
            setupFiles: ['@znk-sk-tools/vitest-config/setup'],
            globals: true,
        },
    })
)
```
