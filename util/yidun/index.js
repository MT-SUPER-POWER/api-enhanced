const crypto = require('crypto')

const PC_UA =
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.29.205117'

const PC_ID = {
  os: 'pc',
  appver: '3.1.17.204416',
  osver: 'Microsoft-Windows-10-Professional-build-19045-64bit',
  channel: 'netease',
}

const SECRETE = 'music_middleuser_pclogin'
const SCA_TTL = 3 * 60 * 1000 // 3 minutes
const TU_TTL = 10 * 60 * 1000 // 10 minutes
const SESSION_TTL = 30 * 60 * 1000 // 30 minutes
const MAX_SESSIONS = 500

const CAPTCHA_ID = {
  40: 'aefd3e6914a546a2a7263b20a5e8304f', // 滑块
  41: 'eb43b69cce7449c1b818b8a291b36f21', // 空格
}

const sessions = new Map()

function pruneSessions() {
  const now = Date.now()
  for (const [sid, item] of sessions.entries()) {
    if (now - item.updatedAt > SESSION_TTL) {
      sessions.delete(sid)
    }
  }
  if (sessions.size > MAX_SESSIONS) {
    const oldest = [...sessions.entries()].sort(
      (a, b) => a[1].updatedAt - b[1].updatedAt,
    )
    for (let i = 0; i < oldest.length - MAX_SESSIONS; i++) {
      sessions.delete(oldest[i][0])
    }
  }
}

const hex = (n) => crypto.randomBytes(n).toString('hex').toUpperCase()
const md5 = (s) => crypto.createHash('md5').update(String(s)).digest('hex')
const pick = (str, key) =>
  (String(str).match(new RegExp('(?:^|;\\s*)' + key + '=([^;]+)')) || [])[1] ||
  ''

const pairs = (str) =>
  String(str || '')
    .split(';')
    .map((s) => {
      const i = s.indexOf('=')
      return i > 0 ? [s.slice(0, i).trim(), s.slice(i + 1).trim()] : null
    })
    .filter(Boolean)

const newSessionCookie = () => {
  const now = Date.now()
  return [
    `_ntes_nuid=${hex(16)}`,
    `_ntes_nnid=${hex(16)},${now}`,
    `WNMCID=${hex(3)}.${now}.01.0`,
    'WEVNSM=1.0.0',
    `deviceId=${hex(16)}`,
    ...Object.entries(PC_ID).map(([k, v]) => `${k}=${v}`),
  ].join('; ')
}

function getSession(sid = 'default') {
  pruneSessions()
  let item = sessions.get(sid)
  if (!item) {
    item = {
      cookie: newSessionCookie(),
      updatedAt: Date.now(),
    }
    sessions.set(sid, item)
  }
  item.updatedAt = Date.now()
  return item
}

function mergeCookie(prev, list) {
  const m = new Map(pairs(prev))
  ;(list || []).forEach((c) => {
    const kv = String(c).split(';')[0]
    const i = kv.indexOf('=')
    if (i > 0) m.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim())
  })
  return [...m].map(([k, v]) => `${k}=${v}`).join('; ')
}

module.exports = {
  PC_UA,
  PC_ID,
  SECRETE,
  SCA_TTL,
  TU_TTL,
  CAPTCHA_ID,
  sessions,
  getSession,
  mergeCookie,
  pick,
  pairs,
  md5,
}
