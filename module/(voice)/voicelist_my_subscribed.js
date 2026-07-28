// 我订阅的播客声音

const createOption = require('../../util/option.js')

module.exports = (query, request) => {
  const data = {
    e_r: true,
    limit: query.limit || 200,
  }

  return request(
    '/api/social/my/subscribed/voicelist/v1',
    data,
    createOption(query, 'eapi'),
  )
}
