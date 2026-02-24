# @znk-sk-tools/eslint-config

Shared ESLint flat config for Vue 3 + TypeScript projects.

## Install

```bash
pnpm add -D @znk-sk-tools/eslint-config eslint
```

## Usage

```js
// eslint.config.js
import config from '@znk-sk-tools/eslint-config'
export default config
```

With custom rules:

```js
import config from '@znk-sk-tools/eslint-config'
export default [...config, { rules: { 'no-console': 'off' } }]
```
