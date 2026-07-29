// 电台节目列表（V6，包含登录用户的节目收听记录）
const { toBoolean } = require('../../util')
const createOption = require('../../util/option.js')

module.exports = (query, request) => {
  const data = {
    radioId: query.radioId || query.rid,
    limit: query.limit || 30,
    offset: query.offset || 0,
    asc: toBoolean(query.asc),
    updateOrder:
      query.updateOrder === undefined ? true : toBoolean(query.updateOrder),
  }

  return request('/api/v6/dj/program/byradio', data, createOption(query))
}
