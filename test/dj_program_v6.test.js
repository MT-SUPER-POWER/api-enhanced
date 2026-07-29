const assert = require('assert')
const path = require('path')
const getDjProgramsV6 = require('../module/(dj)/dj_program_v6')
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

describe('dj program v6 module', function () {
  this.timeout(10000)

  it('maps to the public v6 radio program route', async () => {
    const moduleDefinitions = await getModulesDefinitions(
      path.join(__dirname, '../module'),
      undefined,
      false,
    )
    const definition = moduleDefinitions.find(({ identifier }) => identifier === 'dj_program_v6')

    assert.strictEqual(definition?.route, '/dj/program/v6')
  })

  it('uses the v6 upstream route and forwards playback-record options', async () => {
    const capture = captureRequest()

    await getDjProgramsV6(
      {
        asc: 'true',
        limit: '100',
        offset: '0',
        rid: '986120434',
        updateOrder: 'true',
      },
      capture.request,
    )

    const [requestPath, data, options] = capture.getArgs()
    assert.strictEqual(requestPath, '/api/v6/dj/program/byradio')
    assert.deepStrictEqual(data, {
      asc: true,
      limit: '100',
      offset: '0',
      radioId: '986120434',
      updateOrder: true,
    })
    assert.strictEqual(options.crypto, '')
  })

  it('includes playback records by default and accepts radioId directly', async () => {
    const capture = captureRequest()

    await getDjProgramsV6({ radioId: '986120434' }, capture.request)

    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, {
      asc: false,
      limit: 30,
      offset: 0,
      radioId: '986120434',
      updateOrder: true,
    })
  })
})
