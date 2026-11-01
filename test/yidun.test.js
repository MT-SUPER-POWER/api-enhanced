const assert = require('assert')
const main = require('../main')

describe('yidun module tests', () => {
  it('yidun_login validation requires phone', async () => {
    const res = await main.yidun_login({})
    assert.strictEqual(res.status, 400)
    assert.strictEqual(res.body.code, 400)
    assert.strictEqual(res.body.msg, '缺少 phone')
  })

  it('yidun_login validation requires password or captcha', async () => {
    const res = await main.yidun_login({ phone: '13800000000' })
    assert.strictEqual(res.status, 400)
    assert.strictEqual(res.body.code, 400)
  })

  it('yidun_send validation requires phone', async () => {
    const res = await main.yidun_send({})
    assert.strictEqual(res.status, 400)
    assert.strictEqual(res.body.code, 400)
    assert.strictEqual(res.body.msg, '缺少 phone')
  })

  it('yidun_sca validates and caches validate token', async () => {
    const sid = 'test-sid-' + Date.now()
    const invalidRes = await main.yidun_sca({ sid, sca: 'too-short' })
    assert.strictEqual(invalidRes.status, 400)

    const validValidate = 'A'.repeat(120)
    const validRes = await main.yidun_sca({ sid, sca: validValidate })
    assert.strictEqual(validRes.status, 200)
    assert.strictEqual(validRes.body.code, 200)

    const stateRes = await main.yidun_state({ sid })
    assert.strictEqual(stateRes.status, 200)
    assert.strictEqual(stateRes.body.sca.has, true)
    assert.strictEqual(stateRes.body.sca.len, 120)
  })

  it('yidun_verify_check validation requires validate', async () => {
    const res = await main.yidun_verify_check({
      challenge: { verifyType: 40, verifyToken: 'test' },
    })
    assert.strictEqual(res.status, 400)
    assert.strictEqual(res.body.msg, '缺少 validate')
  })
})
