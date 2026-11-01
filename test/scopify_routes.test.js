const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { getModulesDefinitions } = require('../server')

const consumedRoutes = [
  '/dj/program/v6',
  '/djradio/my/radio/recommend',
  '/search/pc/complex/page/v3',
  '/content/my/liked/voice',
  '/voicelist/my/subscribed',
  '/artist/songs/v2',
  '/pc/voicelist/rcmd/list',
  '/search/album/v1',
  '/search/artist/v1',
  '/search/playlist/v1',
  '/search/default/pc'
]

describe('Scopify consumed backend routes', () => {
  it('exports each public module with a matching interface declaration', () => {
    const api = require('../main')
    const declarations = fs.readFileSync(path.join(__dirname, '../interface.d.ts'), 'utf8')
    for (const route of [...consumedRoutes, '/search/song/list/page']) {
      const identifier = route.slice(1).replaceAll('/', '_')
      assert.strictEqual(typeof api[identifier], 'function', 'Missing export: ' + identifier)
      assert.ok(declarations.includes('export function ' + identifier + '('), 'Missing declaration: ' + identifier)
    }
  })

  it('documents every migrated public route', () => {
    const documentation = fs.readFileSync(path.join(__dirname, '../public/docs/home.md'), 'utf8')
    for (const route of [...consumedRoutes, '/search/song/list/page']) {
      assert.ok(documentation.includes('**接口地址 :** `' + route + '`'), 'Missing documentation: ' + route)
    }
  })

  it('uses the V2 artist endpoint and pagination defaults', async () => {
    let captured
    await require('../module/artist_songs_v2')(
      { id: '6452' },
      (...args) => { captured = args; return Promise.resolve() },
    )
    assert.strictEqual(captured[0], '/api/v2/artist/songs')
    assert.deepStrictEqual(captured[1], { id: '6452', limit: '100', offset: '0' })
  })

  it('registers every migrated route using the native flat module loader', async () => {
    const definitions = await getModulesDefinitions(path.join(__dirname, '../module'), undefined, false)
    const routes = new Set(definitions.map(({ route }) => route))
    for (const route of consumedRoutes) {
      assert.ok(routes.has(route), 'Missing route: ' + route)
    }
    assert.strictEqual(routes.size, definitions.length, 'Duplicate route registration')
    assert.ok(routes.has('/search/song/list/page'))
    assert.ok(!routes.has('/v1/search/song/pc'))
    assert.ok(!routes.has('/token/fresh'))
    assert.ok(!routes.has('/v1/pc/page/rcmd/block/resource/refresh'))
    assert.ok(!routes.has('/v1/search/suggest/pc'))
  })

  it('preserves the PC song-search request expected by the frontend', async () => {
    let captured
    await require('../module/search_song_list_page')(
      { keyword: 'fixture', limit: 15, offset: 30, needCorrect: true, channel: 'typing' },
      (...args) => { captured = args; return Promise.resolve() },
    )
    const [endpoint, data, options] = captured
    assert.strictEqual(endpoint, '/api/search/song/list/page')
    assert.deepStrictEqual(data, {
      keyword: 'fixture', scene: 'normal', limit: 15, offset: 30,
      needCorrect: true, channel: 'typing',
    })
    assert.strictEqual(options.crypto, 'weapi')
  })

  it('keeps native song-search defaults when optional PC parameters are absent', async () => {
    let captured
    await require('../module/search_song_list_page')(
      { keywords: 'fixture' },
      (...args) => { captured = args; return Promise.resolve() },
    )
    assert.deepStrictEqual(captured[1], {
      keyword: 'fixture', limit: 30, offset: 0, scene: 'normal',
    })
  })

  for (const kind of ['album', 'artist', 'playlist']) {
    it('preserves the PC ' + kind + ' search parameters', async () => {
      let captured
      await require('../module/search_' + kind + '_v1')(
        { s: 'fixture', limit: 15, offset: 30 },
        (...args) => { captured = args; return Promise.resolve() },
      )
      assert.strictEqual(captured[0], '/api/v1/search/' + kind + '/get')
      assert.deepStrictEqual(captured[1], { s: 'fixture', limit: 15, offset: 30, queryCorrect: true })
      assert.strictEqual(captured[2].crypto, 'weapi')
    })
  }
})
