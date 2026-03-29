const createOption = require('../../../util/option.js')
module.exports = (query, request) => {
  return request(
    `/api/v2/artist/songs`,
    {
      id: query.id,
      limit: query.limit || '100',
      offset: query.offset || '0',
    },
    createOption(query),
  )
}
