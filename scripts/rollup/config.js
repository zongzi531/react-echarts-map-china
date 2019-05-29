const rollup = require('rollup')
const rollupResolve = require('rollup-plugin-node-resolve')
const rollupBabel = require('rollup-plugin-babel')
const rollupCjs = require('rollup-plugin-commonjs')
const rollupJson = require('rollup-plugin-json')

const getInputOptions = (plugins = []) => ({
  input: 'src/index.js',
  plugins: [
    rollupResolve(),
    rollupBabel({
      exclude: 'node_modules/**', // only transpile our source code
      presets: [['@babel/env', { 'modules': false }], '@babel/react'],
      plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-syntax-dynamic-import'
      ]
    }),
    rollupCjs({
      include: 'node_modules/**',
      // https://github.com/reduxjs/react-redux/issues/643
      namedExports: {
        'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement']
      },
    }),
    rollupJson(),
    ...plugins,
  ],
  external: [
    'react',
    'prop-types',
    'echarts',
  ],
  inlineDynamicImports: true,
})

const outputOptions = {
  file: 'esm/index.js',
  format: 'esm',
  sourcemap: true,
}

function createBuild (plugins = [], isDev = false) {
  const inputOptions = getInputOptions(plugins)
  return async function build () {
    const bundle = await rollup.rollup(inputOptions)

    await bundle.write(outputOptions)

    isDev && rollup.watch({
      ...inputOptions,
      output: [outputOptions],
    })
  }
}

module.exports = {
  createBuild,
}
