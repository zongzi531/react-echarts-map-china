module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    'jest/globals': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'jest'
  ],
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    'no-useless-escape': 0,
    'no-useless-return': 0,
    'no-new-func': 0,
    'eqeqeq': 0,
    'no-console': ['error', { allow: ['warn'] }],
  },
}
