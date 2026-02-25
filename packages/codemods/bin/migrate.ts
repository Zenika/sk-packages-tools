#!/usr/bin/env npx tsx

import { migrateVitest } from '../src/vitest.js'

const CODEMODS: Record<string, { description: string; run: () => Promise<void> }> = {
    vitest: {
        description: 'Migrate vitest.config.ts to use @znk-sk-tools/vitest-config',
        run: migrateVitest,
    },
}

const command = process.argv[2]

if (!command || command === '--help' || command === '-h') {
    console.log('\nsk-migrate - Migration codemods for znk-sk-tools\n')
    console.log('Usage: sk-migrate <codemod>\n')
    console.log('Available codemods:\n')
    for (const [name, { description }] of Object.entries(CODEMODS)) {
        console.log(`  ${name.padEnd(15)} ${description}`)
    }
    console.log()
    process.exit(0)
}

const codemod = CODEMODS[command]
if (!codemod) {
    console.error(`Unknown codemod: "${command}". Run sk-migrate --help to see available codemods.`)
    process.exit(1)
}

await codemod.run()
