// 易盾密码 / 验证码登录
const createOption = require('../util/option.js')
const {
  PC_UA,
  SECRETE,
  SCA_TTL,
  TU_TTL,
  getSession,
  mergeCookie,
  pick,
  md5,
} = require('../util/yidun/index.js')

module.exports = async (query, request) => {
  const {
    phone,
    captcha,
    password,
    countrycode = '86',
    sid = 'default',
  } = query

  if (!phone) {
    return {
      status: 400,
      body: { code: 400, msg: '缺少 phone' },
    }
  }
  if (!captcha && !password) {
    return {
      status: 400,
      body: { code: 400, msg: 'captcha / password 至少填一个' },
    }
  }

  const session = getSession(sid)
  const restart = query.restart === true || query.restart === 'true'

  if (restart) {
    delete session.tu
    delete session.tuLoginType
    delete session.tuAt
    delete session.sca
    delete session.scaAt
  }

  let sca = ''
  if (!restart) {
    const inputSca = String(query.sca || '').trim()
    if (inputSca) {
      if (!/^\S{100,}$/.test(inputSca)) {
        return {
          status: 400,
          body: {
            code: 400,
            msg: `sca 不是有效 validate（长度 ${inputSca.length}，要求 ≥100 且不含空白）`,
          },
        }
      }
      session.sca = inputSca
      session.scaAt = Date.now()
      sca = inputSca
    } else if (
      session.sca &&
      session.scaAt &&
      Date.now() - session.scaAt < SCA_TTL
    ) {
      sca = session.sca
    } else {
      delete session.sca
      delete session.scaAt
    }
  }

  let tu = ''
  if (!restart) {
    const inputTu = String(query.tu || '').trim()
    if (inputTu) {
      tu = inputTu
    } else if (
      session.tu &&
      session.tuAt &&
      Date.now() - session.tuAt < TU_TTL
    ) {
      tu = session.tu
    } else {
      delete session.tu
      delete session.tuAt
      delete session.tuLoginType
    }
  }

  if (tu && !captcha) {
    return {
      status: 400,
      body: {
        code: 400,
        msg: '该会话正处于二阶段验证，请先填短信验证码再登录',
        hint: 'MUSIC_TU 只能用一次；要放弃二阶段重回密码登录，带 restart:true',
        hasTu: true,
      },
    }
  }

  const data = {
    type: '1',
    https: 'true',
    phone: String(phone),
    countrycode: String(countrycode),
    remember: 'true',
    secrete: SECRETE,
  }
  if (sca) data.secureCaptcha = sca
  if (tu) {
    data.captcha = String(captcha)
    data.MUSIC_TU = tu
  } else if (password) {
    data.password = md5(password)
  } else {
    data.captcha = String(captcha || '')
  }

  const options = createOption(query, 'eapi', 'v2')
  options.cookie = session.cookie
  options.ua = PC_UA

  let r
  try {
    r = await request('/api/w/login/cellphone', data, options)
  } catch (e) {
    if (!e || !e.body) throw e
    r = e
  }

  session.cookie = mergeCookie(session.cookie, r.cookie)
  const body = r.body || {}
  const code = Number(body.code)

  if (code === 8830 && body.MUSIC_TU) {
    session.tu = String(body.MUSIC_TU)
    session.tuLoginType = body.loginType || ''
    session.tuAt = Date.now()
  } else if (code === 200) {
    delete session.tu
    delete session.tuAt
    delete session.tuLoginType
  }
  delete session.sca
  delete session.scaAt

  const musicU = pick(session.cookie, 'MUSIC_U')
  const csrf = pick(session.cookie, '__csrf')

  return {
    status: r.status || 200,
    body: {
      code: body.code,
      msg: body.message || body.msg || '',
      kind: tu ? 'stage2-captcha' : password ? 'password' : 'captcha',
      body,
      cookie: session.cookie,
      cookieLen: session.cookie.length,
      loginCookie: musicU
        ? `MUSIC_U=${musicU}` + (csrf ? `; __csrf=${csrf}` : '')
        : '',
    },
    cookie: r.cookie,
  }
}
