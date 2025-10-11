import js from '@eslint/js'

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      '.playwright-mcp',
      '**/*.svelte',
      '**/*.tsx',
      '**/*.ts',
      'voces-reference/**',
      'src/components/**',
      'src/pages/**',
      'src/lib/**',
      'scripts/**',
      'public/**',
      'server.js',
      '.svelte-kit/**',
      'build/**',
      'static/worker.js'
    ]
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },
]