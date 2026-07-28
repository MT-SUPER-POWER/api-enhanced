const assert = require('assert')
const path = require('path')
const likedVoices = require('../module/(voice)/content_my_liked_voice')
const { getModulesDefinitions } = require('../server')

function captureRequest() {
  let args

  return {
    getArgs: () => args,
    request: (...requestArgs) => {
      args = requestArgs
      return Promise.resolve()
    },
  }
}

describe('liked voice module', function () {
  this.timeout(10000)

  it('maps to the public liked-voice route', async () => {
    const moduleDefinitions = await getModulesDefinitions(
      path.join(__dirname, '../module'),
      undefined,
      false,
    )
    const definition = moduleDefinitions.find(
      ({ identifier }) => identifier === 'content_my_liked_voice',
    )

    assert.strictEqual(definition?.route, '/content/my/liked/voice')
  })

  it('uses the EAPI endpoint and defaults', async () => {
    const capture = captureRequest()

    await likedVoices({}, capture.request)

    const [requestPath, data, options] = capture.getArgs()
    assert.strictEqual(requestPath, '/api/content/my/liked/voice')
    assert.deepStrictEqual(data, { e_r: true, limit: 200, offset: 0 })
    assert.strictEqual(options.crypto, 'eapi')
  })

  it('accepts custom pagination', async () => {
    const capture = captureRequest()

    await likedVoices({ limit: '50', offset: '20' }, capture.request)

    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, { e_r: true, limit: '50', offset: '20' })
  })
})
