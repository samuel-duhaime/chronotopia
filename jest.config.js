export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/*.spec.ts', '**/*.jest.spec.ts'],
    collectCoverage: false,
    coverageReporters: ['text'], // Output coverage as text instead of creating folders
    // Coverage configuration
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
