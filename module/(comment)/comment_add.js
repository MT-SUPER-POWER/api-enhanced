const { APP_CONF } = require('../../util/config.json')

// 对某一首歌曲发表评论
const createOption = require('../../util/option.js')
module.exports = (query, request) => {
  const data = {
    threadId: 'R_SO_4_' + query.id,
    content: query.content,
    resourceType: '0',
    resourceId: '0',
    expressionPicId: '-1',
    bubbleId: '-1',
    checkToken: query.checkToken || APP_CONF.checkToken,
  }

  return request(
    '/api/resource/comments/add',
    data,
    createOption(query, 'weapi'),
  )
}
