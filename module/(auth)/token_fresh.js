const createOption = require('../../util/option.js')

module.exports = (query, request) => {
  const data = {}
  return request(`/api/login/token/refresh`, data, createOption(query, 'weapi'))
}
