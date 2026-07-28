const assert = require('assert')
const path = require('path')
const subscribedVoiceLists = require('../module/(voice)/voicelist_my_subscribed')
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

describe('subscribed voice-list module', function () {
  this.timeout(10000)
  it('maps to the public subscribed voice-list route', async () => {
    const moduleDefinitions = await getModulesDefinitions(
      path.join(__dirname, '../module'),
      undefined,
      false,
    )
    const definition = moduleDefinitions.find(
      ({ identifier }) => identifier === 'voicelist_my_subscribed',
    )

    assert.strictEqual(definition?.route, '/voicelist/my/subscribed')
  })

  it('uses the PC eapi endpoint and defaults', async () => {
    const capture = captureRequest()

    await subscribedVoiceLists({}, capture.request)

    const [requestPath, data, options] = capture.getArgs()
    assert.strictEqual(requestPath, '/api/social/my/subscribed/voicelist/v1')
    assert.deepStrictEqual(data, { e_r: true, limit: 200 })
    assert.strictEqual(options.crypto, 'eapi')
  })

  it('accepts a custom limit', async () => {
    const capture = captureRequest()

    await subscribedVoiceLists({ limit: '50' }, capture.request)

    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, { e_r: true, limit: '50' })
  })
})
