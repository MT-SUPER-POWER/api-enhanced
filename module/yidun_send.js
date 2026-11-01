// 易盾发码
const createOption = require('../util/option.js')
const {
  PC_UA,
  SECRETE,
  SCA_TTL,
  getSession,
  mergeCookie,
} = require('../util/yidun/index.js')

module.exports = async (query, request) => {
  const { phone, ctcode = '86', sid = 'default' } = query
  if (!phone) {
    return {
      status: 400,
      body: { code: 400, msg: '缺少 phone' },
    }
  }

  const session = getSession(sid)

  let sca = ''
  const inputSca = String(query.sca || '').trim()
  if (inputSca) {
    session.sca = inputSca
    session.scaAt = Date.now()
    sca = inputSca
  } else if (
    session.sca &&
    session.scaAt &&
    Date.now() - session.scaAt < SCA_TTL
  ) {
    sca = session.sca
  }

  const data = {
    ctcode: String(ctcode),
    secrete: SECRETE,
    cellphone: String(phone),
    scene: '0',
  }
  if (sca) data.secureCaptcha = sca

  const options = createOption(query, 'eapi', 'v2')
  options.cookie = session.cookie
  options.ua = PC_UA

  let r
  try {
    r = await request('/api/middle/captcha/sent/v1', data, options)
  } catch (e) {
    if (!e || !e.body) throw e
    r = e
  }

  session.cookie = mergeCookie(session.cookie, r.cookie)
  const body = r.body || {}
  return {
    status: r.status || 200,
    body: {
      code: body.code,
      msg: body.message || body.msg || '',
      body,
      cookie: session.cookie,
      cookieLen: session.cookie.length,
    },
    cookie: r.cookie,
  }
}
