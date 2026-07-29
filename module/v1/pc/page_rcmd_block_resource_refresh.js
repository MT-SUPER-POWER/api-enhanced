const createOption = require('../../../util/option.js')

const DEFAULT_BLOCK_CODE = 'HOMEPAGE_BLOCK_PLAYLIST_RCMD'
const DEFAULT_BLOCK_REQUEST_PARAM =
  '{"HOMEPAGE_BLOCK_PLAYLIST_RCMD":{"cursor":"{\\"offset\\":0,\\"blockCodeOrderList\\":[\\"HOMEPAGE_BLOCK_PLAYLIST_RCMD\\"]}","extInfo":"{\\"abInfo\\":{\\"hp-new-homepageV3.1\\":\\"t3\\"}}","newStyle":true}}'

module.exports = (query, request) => {
  const data = {
    blockCode: query.blockCode || DEFAULT_BLOCK_CODE,
    extJson: query.extJson || '',
    blockRequestParam: query.blockRequestParam || DEFAULT_BLOCK_REQUEST_PARAM,
  }

  return request(
    '/api/pc/page/rcmd/block/resource/refresh',
    data,
    createOption(query),
  )
}
