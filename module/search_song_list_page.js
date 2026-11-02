// 新版单曲搜索（分页）

const createOption = require('../util/option.js')
module.exports = (query, request) => {
  const data = {
    keyword: query.keyword || query.keywords || '',
    limit: query.limit || 30,
    offset: query.offset || 0,
    scene: query.scene || 'normal',
    ...(query.needCorrect === undefined ? {} : { needCorrect: query.needCorrect }),
    ...(query.channel === undefined ? {} : { channel: query.channel }),
  }
  return request(
    `/api/search/song/list/page`,
    data,
    createOption(query, 'weapi'),
  )
}
