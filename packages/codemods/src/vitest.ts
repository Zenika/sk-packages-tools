import { Project, SyntaxKind, type ObjectLiteralExpression, type PropertyAssignment, type SourceFile } from 'ts-morph'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const SHARED_DEFAULTS: Record<string, unknown> = {
    environment: 'jsdom',
    silent: true,
}

const SHARED_NESTED: Record<string, Record<string, unknown>> = {
    deps: { inline: ['vuetify'] },
    coverage: { provider: 'istanbul', reporter: ['lcov'] },
}

const SHARED_EXCLUDE_EXTRA = 'e2e/**'

const IMPORTS_TO_REMOVE = ['vitest/config', 'vitest']

function getPropertyValue(prop: PropertyAssignment): unknown {
    const init = prop.getInitializer()
    if (!init) return undefined

    if (init.isKind(SyntaxKind.StringLiteral)) return init.getLiteralValue()
    if (init.isKind(SyntaxKind.NumericLiteral)) return init.getLiteralValue()
    if (init.isKind(SyntaxKind.TrueKeyword)) return true
    if (init.isKind(SyntaxKind.FalseKeyword)) return false
    if (init.isKind(SyntaxKind.ArrayLiteralExpression)) {
        return init.getElements().map((el) => {
            if (el.isKind(SyntaxKind.StringLiteral)) return el.getLiteralValue()
            return el.getText()
        })
    }
    return init.getText()
}

function arraysEqual(a: unknown, b: unknown): boolean {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    if (a.length !== b.length) return false
    return a.every((val, i) => val === b[i])
}

function isSharedDefault(key: string, value: unknown): boolean {
    return key in SHARED_DEFAULTS && SHARED_DEFAULTS[key] === value
}

function isSharedExclude(prop: PropertyAssignment): boolean {
    const init = prop.getInitializer()
    if (!init) return false
    const text = init.getText()
    return text.includes('configDefaults.exclude') && text.includes(SHARED_EXCLUDE_EXTRA)
}

function extractCustomTestProperties(testObject: ObjectLiteralExpression): string[] {
    const customProps: string[] = []

    for (const prop of testObject.getProperties()) {
        if (!prop.isKind(SyntaxKind.PropertyAssignment)) {
            customProps.push(prop.getText())
            continue
        }

        const name = prop.getName()

        if (name === 'exclude' && isSharedExclude(prop)) continue
        if (isSharedDefault(name, getPropertyValue(prop))) continue

        if (name in SHARED_NESTED) {
            const nested = prop.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
            if (nested) {
                const customNested = extractCustomFromNested(name, nested)
                if (customNested) customProps.push(customNested)
                continue
            }
        }

        customProps.push(prop.getText())
    }

    return customProps
}

function extractCustomFromNested(parentKey: string, obj: ObjectLiteralExpression): string | null {
    const defaults = SHARED_NESTED[parentKey]
    const customProps: string[] = []

    for (const prop of obj.getProperties()) {
        if (!prop.isKind(SyntaxKind.PropertyAssignment)) {
            customProps.push(prop.getText())
            continue
        }

        const name = prop.getName()
        const value = getPropertyValue(prop)

        if (name in defaults) {
            const def = defaults[name]
            if (value === def) continue
            if (arraysEqual(value, def)) continue
        }

        customProps.push(prop.getText())
    }

    if (customProps.length === 0) return null
    return `${parentKey}: {\n            ${customProps.join(',\n            ')},\n        }`
}

function extractNonTestProperties(configObject: ObjectLiteralExpression): string[] {
    const props: string[] = []

    for (const prop of configObject.getProperties()) {
        const name = prop.isKind(SyntaxKind.PropertyAssignment) ? prop.getName() : null
        if (name === 'test') continue
        props.push(prop.getText())
    }

    return props
}

function extractExistingImports(sourceFile: SourceFile): string[] {
    const imports: string[] = []

    for (const decl of sourceFile.getImportDeclarations()) {
        const moduleSpecifier = decl.getModuleSpecifierValue()
        if (IMPORTS_TO_REMOVE.includes(moduleSpecifier)) continue
        imports.push(decl.getText())
    }

    return imports
}

function findConfigObject(sourceFile: SourceFile): ObjectLiteralExpression | null {
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)

    for (const call of calls) {
        const expr = call.getExpression()
        if (expr.getText() === 'defineConfig' || expr.getText() === 'mergeConfig') {
            const args = call.getArguments()
            for (const arg of args) {
                if (arg.isKind(SyntaxKind.ObjectLiteralExpression)) {
                    return arg
                }
            }
        }
    }

    return null
}

function indent(text: string, spaces: number): string {
    const pad = ' '.repeat(spaces)
    return text.split('\n').map((line) => line.trim() ? pad + line.trim() : line).join('\n')
}

function buildNewConfig(
    existingImports: string[],
    nonTestProps: string[],
    customTestProps: string[],
): string {
    const lines: string[] = []

    lines.push(`import { defineConfig, mergeConfig } from 'vitest/config'`)
    lines.push(`import configShared from '@znk-sk-tools/vitest-config'`)
    for (const imp of existingImports) {
        lines.push(imp)
    }
    lines.push('')

    const hasOverrides = nonTestProps.length > 0 || customTestProps.length > 0

    if (!hasOverrides) {
        lines.push(`export default configShared`)
    } else {
        const configProps: string[] = []

        for (const prop of nonTestProps) {
            configProps.push(indent(prop, 8))
        }

        if (customTestProps.length > 0) {
            const testInner = customTestProps.map((p) => indent(p, 12)).join(',\n')
            configProps.push(`        test: {\n${testInner},\n        }`)
        }

        lines.push(`export default mergeConfig(`)
        lines.push(`    configShared,`)
        lines.push(`    defineConfig({`)
        lines.push(configProps.join(',\n') + ',')
        lines.push(`    })`)
        lines.push(`)`)
    }

    lines.push('')
    return lines.join('\n')
}

export async function migrateVitest(): Promise<void> {
    const configPath = resolve(process.cwd(), 'vitest.config.ts')

    if (!existsSync(configPath)) {
        console.error('No vitest.config.ts found in current directory.')
        process.exit(1)
    }

    console.log('Analyzing vitest.config.ts...')

    const project = new Project()
    const sourceFile = project.addSourceFileAtPath(configPath)

    const configObject = findConfigObject(sourceFile)
    if (!configObject) {
        console.error('Could not find configuration object in vitest.config.ts')
        process.exit(1)
    }

    const existingImports = extractExistingImports(sourceFile)
    const nonTestProps = extractNonTestProperties(configObject)
    const testProp = configObject.getProperty('test')
    let customTestProps: string[] = []

    if (testProp?.isKind(SyntaxKind.PropertyAssignment)) {
        const testObject = testProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)
        if (testObject) {
            customTestProps = extractCustomTestProperties(testObject)
        }
    }

    console.log(`Found ${nonTestProps.length} non-test property(ies) to preserve.`)
    console.log(`Found ${customTestProps.length} custom test override(s) to preserve.`)

    const newContent = buildNewConfig(existingImports, nonTestProps, customTestProps)
    sourceFile.replaceWithText(newContent)
    await sourceFile.save()

    console.log('Rewritten vitest.config.ts')

    console.log('Installing @znk-sk-tools/vitest-config...')
    execSync('pnpm add -D @znk-sk-tools/vitest-config', { stdio: 'inherit', cwd: process.cwd() })

    console.log('\nMigration complete!')
}
