module.exports = {
  exclude: 'node_modules/**', // only transpile our source code
  presets: [['@babel/env', { 'modules': false, targets: { node: 'current' } }], '@babel/react'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
  ],
  env: {
    test: {
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
      ]
    }
  },
}
