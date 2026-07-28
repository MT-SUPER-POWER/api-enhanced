const assert = require('assert')
const path = require('path')
const recommendedRadios = require('../module/(dj)/djradio_my_radio_recommend')
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

describe('my radio recommendation module', function () {
  this.timeout(10000)

  it('maps to the public radio recommendation route', async () => {
    const moduleDefinitions = await getModulesDefinitions(
      path.join(__dirname, '../module'),
      undefined,
      false,
    )
    const definition = moduleDefinitions.find(
      ({ identifier }) => identifier === 'djradio_my_radio_recommend',
    )

    assert.strictEqual(definition?.route, '/djradio/my/radio/recommend')
  })

  it('uses the eapi recommendation endpoint and defaults', async () => {
    const capture = captureRequest()

    await recommendedRadios({}, capture.request)

    const [requestPath, data, options] = capture.getArgs()
    assert.strictEqual(requestPath, '/api/djradio/my/radio/recommend')
    assert.deepStrictEqual(data, { e_r: true, limit: 6 })
    assert.strictEqual(options.crypto, 'eapi')
  })

  it('accepts a custom recommendation limit', async () => {
    const capture = captureRequest()

    await recommendedRadios({ limit: '12' }, capture.request)

    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, { e_r: true, limit: '12' })
  })
})
