module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.expo/'],
  rules: {
    // Expo/RN often uses require() for assets or dynamic imports
    '@typescript-eslint/no-require-imports': 'off',
  },
};
