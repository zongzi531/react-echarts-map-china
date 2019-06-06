const path = require('path')
const rollup = require('rollup')
const rollupResolve = require('rollup-plugin-node-resolve')
const rollupBabel = require('rollup-plugin-babel')
const rollupCjs = require('rollup-plugin-commonjs')
const rollupJson = require('rollup-plugin-json')
const rollupAlias = require('rollup-plugin-alias')

const getInputOptions = (plugins = []) => ({
  input: 'src/index.js',
  plugins: [
    rollupResolve(),
    rollupBabel(),
    rollupCjs({
      include: 'node_modules/**',
      // https://github.com/reduxjs/react-redux/issues/643
      namedExports: {
        'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement']
      },
    }),
    rollupJson(),
    rollupAlias({
      resolve: ['.js', '.json'],
      '@': path.join(__dirname, '../../src'),
      '~': path.join(__dirname, '../../'),
    }),
    ...plugins,
  ],
  external: [
    'react',
    'prop-types',
    'echarts',
    'omit.js',
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
