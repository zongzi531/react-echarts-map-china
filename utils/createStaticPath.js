const path = require('path')
const fs = require('fs')
const glob = require('glob')

const staticPath = path.join(__dirname, '../static/*.json')
const rootPath = path.join(__dirname, '..')
const targetPath = path.join(__dirname, '../src/getStatic.js')

const staticJsons = glob.sync(staticPath)

let data = ''

for (const filePath of staticJsons) {
  const [code] = filePath.split('/').pop().split('.')
  const [, fileName] = filePath.split(rootPath)
  data += `import CN${code} from '..${fileName}'\n`
}

data += '\n'
data += 'export default {\n'

for (const filePath of staticJsons) {
  const [code] = filePath.split('/').pop().split('.')
  data += `  ${code}: CN${code},\n`
}

data += '}\n'

fs.writeFileSync(targetPath ,data)
