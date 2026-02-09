module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.expo/', 'status-server/'],
  rules: {
    // Expo/RN often uses require() for assets or dynamic imports
    '@typescript-eslint/no-require-imports': 'off',
  },
  overrides: [
    {
      files: ['status-server/**/*.js'],
      env: {
        node: true,
      },
      globals: {
        __dirname: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  ],
};
