// 易盾 -462 weapi 滑块校验接口
const createOption = require('../util/option.js')
const { PC_UA, CAPTCHA_ID } = require('../util/yidun/index.js')

module.exports = async (query, request) => {
  const challenge =
    typeof query.challenge === 'string'
      ? JSON.parse(query.challenge)
      : query.challenge || {}
  const validate = query.validate
  if (!validate) {
    return {
      status: 400,
      body: { code: 400, msg: '缺少 validate' },
    }
  }

  const captchaId =
    query.captchaId || CAPTCHA_ID[challenge.verifyType] || CAPTCHA_ID[40]
  const data = {
    captchaId,
    challenge: challenge.verifyToken,
    validate,
    token: challenge.verifyToken,
    type: challenge.verifyType,
  }

  const q = new URLSearchParams({
    params: JSON.stringify(challenge.params || {}),
    verifyType: String(challenge.verifyType || '40'),
    verifyId: String(challenge.verifyId || '2001'),
    verifyToken: challenge.verifyToken || '',
  })
  const referer = 'https://st.music.163.com/encrypt-pages?' + q.toString()

  const options = createOption(query, 'weapi')
  options.headers = {
    ...options.headers,
    Referer: referer,
  }
  if (!options.ua) {
    options.ua = PC_UA
  }

  let r
  try {
    r = await request(
      'https://st.music.163.com/weapi/frontrisk/verify/check',
      data,
      options,
    )
  } catch (e) {
    if (!e || !e.body) throw e
    r = e
  }

  return {
    status: r.status || 200,
    body: r.body,
    cookie: r.cookie,
  }
}
