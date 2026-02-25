import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const REGISTRY = 'https://registry.npmjs.org'

const PACKAGES = [
    '@znk-sk-tools/eslint-config',
    '@znk-sk-tools/tsconfig',
    '@znk-sk-tools/vitest-config',
    '@znk-sk-tools/build',
]

interface PackageInfo {
    name: string
    version: string
}

async function fetchLatestVersion(name: string): Promise<string | null> {
    try {
        const res = await fetch(`${REGISTRY}/${name}/latest`)
        if (!res.ok) return null
        const data = await res.json() as { version: string }
        return data.version
    } catch {
        return null
    }
}

function readPackageJson(cwd: string): Record<string, unknown> | null {
    const path = resolve(cwd, 'package.json')
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf-8'))
}

function getInstalledVersion(cwd: string, pkg: string): string | null {
    try {
        const pkgJsonPath = resolve(cwd, 'node_modules', ...pkg.split('/'), 'package.json')
        if (!existsSync(pkgJsonPath)) return null
        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
        return pkgJson.version ?? null
    } catch {
        return null
    }
}

function isDeclaredDependency(packageJson: Record<string, unknown>, pkg: string): boolean {
    const deps = packageJson.dependencies as Record<string, string> | undefined
    const devDeps = packageJson.devDependencies as Record<string, string> | undefined
    return !!(deps?.[pkg] || devDeps?.[pkg])
}

export async function checkTools(): Promise<void> {
    const cwd = process.cwd()
    const packageJson = readPackageJson(cwd)

    if (!packageJson) {
        console.error('No package.json found in current directory.')
        process.exit(1)
    }

    console.log('\nFetching latest versions...\n')

    const results = await Promise.all(
        PACKAGES.map(async (name) => ({
            name,
            installed: isDeclaredDependency(packageJson, name),
            localVersion: getInstalledVersion(cwd, name),
            latestVersion: await fetchLatestVersion(name),
        }))
    )

    const nameWidth = Math.max(...results.map((r) => r.name.length)) + 2

    for (const r of results) {
        const icon = r.installed ? '✅' : '❌'
        const info = r.installed ? (r.localVersion ? `v${r.localVersion}` : 'declared') : 'not installed'
        const outdated = r.installed && r.localVersion && r.latestVersion && r.localVersion !== r.latestVersion
            ? ` (latest: v${r.latestVersion})`
            : ''
        console.log(`  ${icon}  ${r.name.padEnd(nameWidth)} ${info}${outdated}`)
    }

    const missing = results.filter((r) => !r.installed)
    console.log()

    if (missing.length === 0) {
        console.log('All tools are installed!')
    } else {
        console.log(`${missing.length} tool(s) not installed. To add them:\n`)
        for (const r of missing) {
            console.log(`  pnpm add -D ${r.name}`)
        }
    }

    console.log()
}
