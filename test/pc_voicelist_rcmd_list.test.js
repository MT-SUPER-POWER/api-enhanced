const assert = require('assert')
const path = require('path')
const recommendedVoiceLists = require('../module/pc_voicelist_rcmd_list')
const { getModulesDefinitions } = require('../server')

function captureRequest() {
  let args
  return {
    request: (...requestArgs) => {
      args = requestArgs
      return Promise.resolve()
    },
    getArgs: () => args,
  }
}

describe('PC voice-list recommendations', () => {
  it('maps the module to the public PC route', async () => {
    const definitions = await getModulesDefinitions(path.join(__dirname, '../module'), undefined, false)
    const definition = definitions.find(({ identifier }) => identifier === 'pc_voicelist_rcmd_list')
    assert.strictEqual(definition?.route, '/pc/voicelist/rcmd/list')
  })

  it('requests twelve recommended voice lists by default', async () => {
    const capture = captureRequest()
    await recommendedVoiceLists({}, capture.request)
    const [requestPath, data] = capture.getArgs()
    assert.strictEqual(requestPath, '/api/pc/voicelist/rcmd/list')
    assert.deepStrictEqual(data, { limit: '12' })
  })

  it('accepts a custom recommended voice-list limit', async () => {
    const capture = captureRequest()
    await recommendedVoiceLists({ limit: '24' }, capture.request)
    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, { limit: '24' })
  })
})
