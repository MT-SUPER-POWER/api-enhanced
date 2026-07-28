// 我喜欢的播客声音

const createOption = require('../../util/option.js')

module.exports = (query, request) => {
  const data = {
    e_r: true,
    limit: query.limit || 200,
    offset: query.offset || 0,
  }

  return request(
    '/api/content/my/liked/voice',
    data,
    createOption(query, 'eapi'),
  )
}
