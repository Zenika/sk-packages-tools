import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, 'e2e/**'],
        silent: true,
        deps: {
            inline: ['vuetify'],
        },
        coverage: {
            provider: 'istanbul',
            reporter: ['lcov'],
        },
    },
})
