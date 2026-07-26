// pc 端默认搜索结果（综合页面）

const createOption = require('../../util/option.js')
module.exports = (query, request) => {
  const data = {
    keyword: query.keyword || '',
    scene: query.scene || 'normal',
    needCorrect: query.needCorrect || 'true',
    channel: query.channel || 'typing',
    bizQueryInfo: query.bizQueryInfo || '',
  }
  return request(`/api/search/pc/complex/page/v3`, data, createOption(query))
}
