// 暂存滑块 validate
const { SCA_TTL, getSession } = require('../util/yidun/index.js')

module.exports = (query) => {
  const { sid = 'default', sca = '' } = query
  const trimmed = String(sca || '').trim()
  if (!trimmed) {
    return {
      status: 400,
      body: { code: 400, msg: '缺少 sca（滑块的 validate）' },
    }
  }
  if (!/^\S{100,}$/.test(trimmed)) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: `sca 不是有效 validate（长度 ${trimmed.length}，要求 ≥100 且不含空白）`,
      },
    }
  }

  const session = getSession(sid)
  session.sca = trimmed
  session.scaAt = Date.now()

  return {
    status: 200,
    body: {
      code: 200,
      msg: 'sca 已缓存，3 分钟内登录可省略该字段',
      len: trimmed.length,
      ttlSec: SCA_TTL / 1e3,
    },
  }
}
