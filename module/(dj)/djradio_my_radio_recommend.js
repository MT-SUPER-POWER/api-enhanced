// 我的播客推荐

const createOption = require('../../util/option.js')

module.exports = (query, request) => {
  const data = {
    e_r: true,
    limit: query.limit || 6,
  }

  return request(
    '/api/djradio/my/radio/recommend',
    data,
    createOption(query, 'eapi'),
  )
}
