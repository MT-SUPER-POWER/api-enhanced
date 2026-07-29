const assert = require('assert')
const path = require('path')
const refreshRecommendedPlaylists = require('../module/v1/pc/page_rcmd_block_resource_refresh')
const recommendedVoiceLists = require('../module/v1/pc/voicelist_rcmd_list')
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

describe('v1 PC recommendation modules', () => {
  it('maps both modules to the public v1 PC routes', async () => {
    const moduleDefinitions = await getModulesDefinitions(
      path.join(__dirname, '../module'),
      undefined,
      false,
    )
    const routeByIdentifier = new Map(
      moduleDefinitions.map(({ identifier, route }) => [identifier, route]),
    )

    assert.strictEqual(
      routeByIdentifier.get('page_rcmd_block_resource_refresh'),
      '/v1/pc/page/rcmd/block/resource/refresh',
    )
    assert.strictEqual(
      routeByIdentifier.get('voicelist_rcmd_list'),
      '/v1/pc/voicelist/rcmd/list',
    )
  })

  it('refreshes the playlist block with the PC client defaults', async () => {
    const capture = captureRequest()

    await refreshRecommendedPlaylists({}, capture.request)

    const [path, data] = capture.getArgs()
    assert.strictEqual(path, '/api/pc/page/rcmd/block/resource/refresh')
    assert.deepStrictEqual(data, {
      blockCode: 'HOMEPAGE_BLOCK_PLAYLIST_RCMD',
      extJson: '',
      blockRequestParam:
        '{"HOMEPAGE_BLOCK_PLAYLIST_RCMD":{"cursor":"{\\"offset\\":0,\\"blockCodeOrderList\\":[\\"HOMEPAGE_BLOCK_PLAYLIST_RCMD\\"]}","extInfo":"{\\"abInfo\\":{\\"hp-new-homepageV3.1\\":\\"t3\\"}}","newStyle":true}}',
    })
  })

  it('allows a playlist refresh request to override its defaults', async () => {
    const capture = captureRequest()
    const blockRequestParam = '{"custom":true}'

    await refreshRecommendedPlaylists(
      {
        blockCode: 'CUSTOM_BLOCK',
        blockRequestParam,
        extJson: '{"experiment":"control"}',
      },
      capture.request,
    )

    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, {
      blockCode: 'CUSTOM_BLOCK',
      blockRequestParam,
      extJson: '{"experiment":"control"}',
    })
  })

  it('requests twelve recommended voice lists by default', async () => {
    const capture = captureRequest()

    await recommendedVoiceLists({}, capture.request)

    const [path, data] = capture.getArgs()
    assert.strictEqual(path, '/api/pc/voicelist/rcmd/list')
    assert.deepStrictEqual(data, { limit: '12' })
  })

  it('accepts a custom recommended voice-list limit', async () => {
    const capture = captureRequest()

    await recommendedVoiceLists({ limit: '24' }, capture.request)

    const [, data] = capture.getArgs()
    assert.deepStrictEqual(data, { limit: '24' })
  })
})
