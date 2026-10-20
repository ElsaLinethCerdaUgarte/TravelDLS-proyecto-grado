import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const buildDir = path.join(root, 'build')
const files = ['swagger.json', 'swagger.yml']

for (const file of files) {
  const source = path.join(root, file)
  const destination = path.join(buildDir, file)

  if (!fs.existsSync(source)) {
    throw new Error(`Missing ${file}. Run "node ace docs:generate" before copying Swagger files.`)
  }

  fs.copyFileSync(source, destination)
}

console.log('Swagger OpenAPI files copied to build/')