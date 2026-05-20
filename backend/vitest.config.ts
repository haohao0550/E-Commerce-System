import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup.ts'],
        fileParallelism: false,
        maxWorkers: 1,
    },
});
