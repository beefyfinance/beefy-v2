import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooks from 'eslint-plugin-react-hooks';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';
import globals from 'globals';
import noBarrelFiles from 'eslint-plugin-no-barrel-files';
import imports from 'eslint-plugin-import';

export default tseslint.config(
  {
    ignores: [
      '.git/',
      '.github/',
      '.idea/',
      '.vscode/',
      '.cache/',
      'build/',
      'node_modules/',
      'public/',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json', './tsconfig.scripts.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-x': reactX,
      'react-dom': reactDom,
      'no-barrel-files': noBarrelFiles,
      import: imports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactX.configs['recommended-typescript'].rules,
      ...reactDom.configs.recommended.rules,
      // so react-refresh can work (without having to refresh whole page)
      'react-refresh/only-export-components': 'error',
      // faster dev build/refresh
      'no-barrel-files/no-barrel-files': 'error',
      // faster dev build/refresh
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          checkTypeImports: true,
          pathGroupOverrides: [
            {
              pattern: '#/styles/**/*',
              patternOptions: { nocomment: true },
              action: 'ignore',
            },
          ],
        },
      ],
      // you can disable this inline if exporting as default for React.lazy
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
              allowImportNames: ['default'],
              message: 'There is only a default export for bignumber.js now',
            },
            {
              name: '@floating-ui/react-dom',
              message: 'Use @floating-ui/react instead',
            },
            {
              name: 'react-redux',
              importNames: ['connect'],
              message: 'Use useAppSelector hook, not connect',
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
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            { from: 'file', name: ['ThunkDispatch', 'BeefyDispatchFn', 'NavigateFunction'] },
          ],
        },
      ],
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/require-await': 'off', // Some interfaces require a promise to be returned, didn't want to wrap them all in Promise.resolve
      '@typescript-eslint/unbound-method': 'off', // Breaks destructuring of RTK APIs
      '@typescript-eslint/no-unsafe-member-access': 'off', // TODO try to enable this after viem migration
      '@typescript-eslint/no-unsafe-call': 'off', // TODO try to enable this after viem migration
      '@typescript-eslint/no-unsafe-assignment': 'off', // TODO try to enable this after viem migration
      '@typescript-eslint/no-unsafe-argument': 'off', // TODO try to enable this after viem migration
      'react-dom/no-missing-iframe-sandbox': 'off', // TODO investigate what each onramp provider needs
      'react-dom/no-unsafe-target-blank': 'off', // noopener is implicit now when target="_blank"
      'react-x/no-array-index-key': 'off', // sometimes there is no alternative
      // 'react-x/display-name': 'warn',
      // 'react-x/prop-types': 'off',
      // 'react-x/react-in-jsx-scope': 'off',
      // 'react-x/no-children-prop': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
