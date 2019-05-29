const { createBuild } = require('./config')
const rollupTerser = require('rollup-plugin-terser')

createBuild([
  rollupTerser.terser(),
])()
