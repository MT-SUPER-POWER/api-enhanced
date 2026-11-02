// PC 端推荐播客声音列表

const createOption = require('../util/option.js')

module.exports = (query, request) => {
  const data = {
    limit: query.limit || '12',
  }

  return request('/api/pc/voicelist/rcmd/list', data, createOption(query))
}
