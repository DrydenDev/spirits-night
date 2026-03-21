import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignore built output and generated files
  {
    ignores: ['build/', 'public/build/', 'node_modules/', '.cache/'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules (applied to all .ts/.tsx files)
  tseslint.configs.recommended,

  // React app source
  {
    files: ['app/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      // Not needed with React 17+ automatic JSX transform
      'react/react-in-jsx-scope': 'off',
      // TypeScript handles prop types
      'react/prop-types': 'off',
      // Named function components don't need explicit displayName
      'react/display-name': 'off',
      ...reactHooksPlugin.configs.recommended.rules,
      // Ignore intentionally unused variables/params prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // Prisma seed files (Node.js only, no browser globals)
  {
    files: ['prisma/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Prettier last — disables all rules that conflict with formatting
  prettier
);
