// eslint.config.js

import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import tsEslint from "@typescript-eslint/eslint-plugin";

export default defineConfig([
    {
        plugins: {
            '@typescript-eslint': tsEslint,
        },

        // Language options and parser for TypeScript files
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            parser: tsParser
        },

        rules: {
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },

        settings: {
            react: { version: 'detect' },
        },
    },
    {
        ignores: [
            'node_modules/*',
            '.next/*',
            'dist/*',
            'build/*',
            'coverage/*',
            'public/*',
            '**/*.min.js',
        ]
    }
])