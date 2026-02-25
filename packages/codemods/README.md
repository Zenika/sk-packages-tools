# @znk-sk-tools/codemods

CLI tools and codemods for znk-sk-tools.

## Usage

```bash
npx @znk-sk-tools/codemods <command>
```

## Commands

### check

Check which znk-sk-tools packages are installed in the current project.

```bash
npx @znk-sk-tools/codemods check
```

### vitest

Migrate an existing `vitest.config.ts` to use `@znk-sk-tools/vitest-config`.

```bash
npx @znk-sk-tools/codemods vitest
```

- Parses the existing config with ts-morph
- Preserves plugins, resolve, and other non-test properties
- Identifies custom test overrides (anything not in the shared defaults)
- Rewrites the config using `mergeConfig` with only the custom parts
- Installs `@znk-sk-tools/vitest-config` automatically

**Before:**

```ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        silent: true,
        globals: true,
    },
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
})
```

**After:**

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import configShared from '@znk-sk-tools/vitest-config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default mergeConfig(
    configShared,
    defineConfig({
        plugins: [vue()],
        resolve: {
            alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        },
        test: {
            globals: true,
        },
    })
)
```
