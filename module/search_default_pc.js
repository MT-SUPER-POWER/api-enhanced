// PC 端默认搜索关键词

const createOption = require('../util/option.js')

module.exports = (query, request) => {
  const data = {}

  return request(
    '/api/search/pc/rcmd/keyword/get',
    data,
    createOption(query, 'weapi'),
  )
}
