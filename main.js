const fs = require('fs')
const path = require('path')
const tmpPath = require('os').tmpdir()
const { cookieToJson } = require('./util')

const anonymousTokenPath = path.resolve(tmpPath, 'anonymous_token')
if (!fs.existsSync(anonymousTokenPath)) {
  fs.writeFileSync(anonymousTokenPath, '', 'utf-8')
}

/** @type {Record<string, any>} */
let obj = {}

const modulePath = path.join(__dirname, 'module')

function walkModuleDir(dir) {
  const result = []
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      result.push(...walkModuleDir(fullPath))
    } else if (file.endsWith('.js')) {
      result.push(fullPath)
    }
  }
  return result
}

const moduleFiles = walkModuleDir(modulePath).reverse()

let requestModule = null

moduleFiles.forEach((filePath) => {
  const file = path.basename(filePath)
  let fileModule = require(filePath)
  let fn = file.split('.').shift() || ''

  obj[fn] = function (data = {}) {
    const cookie =
      typeof data.cookie === 'string'
        ? cookieToJson(data.cookie)
        : data.cookie || {}

    return fileModule(
      {
        ...data,
        cookie,
      },
      async (...args) => {
        if (!requestModule) {
          requestModule = require('./util/request')
        }

        return requestModule(...args)
      },
    )
  }
})

let serverModule = null

/**
 * @type {Record<string, any> & import("./server")}
 */
module.exports = {
  get server() {
    if (!serverModule) {
      serverModule = require('./server')
    }
    return serverModule
  },
  ...obj,
}

Object.assign(module.exports, require('./server'))
