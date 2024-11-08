import js from '@eslint/js';
import ts from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import prettierConfigPlugin from 'eslint-config-prettier';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default ts.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      // recommended rules for JavaScript
      js.configs.recommended,
      // recommended rules for TypeScript, overrides some of the recommended rules for JavaScript
      ...ts.configs.recommended,
      // recommended rules for React
      reactPlugin.configs.flat.recommended,
      // supports (ES6+) import/ export syntax (e.g. query strings
      importPlugin.flatConfigs.recommended,
      // disables rules that conflict with Prettier formatting
      prettierConfigPlugin,
    ],
    plugins: {
      // JSX parsing
      react: reactPlugin,
      // ensure all hook dependencies are listed in the dependency array
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      paths: ['src'],
      files: ['src/**/*.{ts,tsx}'],
      react: {
        version: '18.3.1',
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports only',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lodash',
              message: 'Use lodash-es instead',
            },
            {
              name: 'react',
              importNames: ['default'],
              message: 'Use named imports only for React',
            },
            {
              name: 'bignumber.js',
              importNames: ['default'],
              message: 'Use named imports only for bignumber.js',
            },
          ],
          patterns: [
            {
              group: ['lodash/*'],
              message: 'Use lodash-es instead',
            },
          ],
        },
      ],
      'no-mixed-operators': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'react/jsx-no-target-blank': [
        'error',
        {
          allowReferrer: true,
        },
      ],
      'react/display-name': 'warn',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-children-prop': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: [
      '.git/',
      '.github/',
      '.idea/',
      '.vscode/',
      'build/',
      'node_modules/',
      'public/',
      'scripts/',
      '*.*',
    ],
  }
);
