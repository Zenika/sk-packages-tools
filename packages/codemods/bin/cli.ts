#!/usr/bin/env npx tsx

import { migrateVitest } from '../src/vitest.js'
import { checkTools } from '../src/check.js'

const COMMANDS: Record<string, { description: string; run: () => Promise<void> }> = {
    check: {
        description: 'Check which znk-sk-tools are installed in the current project',
        run: checkTools,
    },
    vitest: {
        description: 'Migrate vitest.config.ts to use @znk-sk-tools/vitest-config',
        run: migrateVitest,
    },
}

const command = process.argv[2]

if (!command || command === '--help' || command === '-h') {
    console.log('\nsk-tools - CLI for znk-sk-tools\n')
    console.log('Usage: sk-tools <command>\n')
    console.log('Commands:\n')
    for (const [name, { description }] of Object.entries(COMMANDS)) {
        console.log(`  ${name.padEnd(15)} ${description}`)
    }
    console.log()
    process.exit(0)
}

const cmd = COMMANDS[command]
if (!cmd) {
    console.error(`Unknown command: "${command}". Run sk-tools --help to see available commands.`)
    process.exit(1)
}

await cmd.run()
