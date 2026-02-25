#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const script = resolve(__dirname, 'cli.ts')

execFileSync('npx', ['tsx', script, ...process.argv.slice(2)], { stdio: 'inherit' })
