// 查询易盾会话状态
const {
  SCA_TTL,
  TU_TTL,
  sessions,
  pick,
  pairs,
} = require('../util/yidun/index.js')

module.exports = (query) => {
  const { sid = '' } = query
  if (!sid) {
    return {
      status: 400,
      body: { code: 400, msg: '缺少 sid' },
    }
  }
  const session = sessions.get(sid)
  let sca = { has: false, len: 0, ageSec: 0, ttlSec: SCA_TTL / 1e3 }
  if (
    session &&
    session.sca &&
    session.scaAt &&
    Date.now() - session.scaAt < SCA_TTL
  ) {
    sca = {
      has: true,
      len: session.sca.length,
      ageSec: Math.round((Date.now() - session.scaAt) / 1e3),
      ttlSec: SCA_TTL / 1e3,
    }
  }

  let tu = { has: false, loginType: '', ageSec: 0, ttlSec: TU_TTL / 1e3 }
  if (
    session &&
    session.tu &&
    session.tuAt &&
    Date.now() - session.tuAt < TU_TTL
  ) {
    tu = {
      has: true,
      loginType: session.tuLoginType || '',
      ageSec: Math.round((Date.now() - session.tuAt) / 1e3),
      ttlSec: TU_TTL / 1e3,
    }
  }

  const cookie = (session && session.cookie) || ''
  const nmtid = pick(cookie, 'NMTID')

  return {
    status: 200,
    body: {
      code: 200,
      sid,
      sca,
      stage: tu,
      nmtid: { len: nmtid.length, real: nmtid.length >= 36 },
      cookieKeys: pairs(cookie).map(([k]) => k),
      cookieLen: cookie.length,
    },
  }
}
