const fs = require("fs");
const path = require("path");
const { register_anonimous } = require("./main");
const { cookieToJson, generateRandomChineseIP, generateDeviceId } = require("./util/index");
const { getXeapiPublicKey } = require("./util/xeapiKey");
const tmpPath = require("os").tmpdir();

async function generateConfig() {
  global.cnIp = generateRandomChineseIP();
  global.deviceId = global.deviceId || generateDeviceId();

  // 1. Fetch and store the public key first
  try {
    let currentPublicKey = {};
    try {
      currentPublicKey = JSON.parse(
        fs.readFileSync(path.resolve(tmpPath, "xeapi_public_key"), "utf-8"),
      );
    } catch (_) {}
    const publicKey = await getXeapiPublicKey(currentPublicKey, global.deviceId);
    fs.writeFileSync(path.resolve(tmpPath, "xeapi_public_key"), JSON.stringify(publicKey), "utf-8");
  } catch (error) {
    console.error("[Backend] Failed to load/store xeapi public key:", error);
  }

  // 2. Register anonymous token
  try {
    const res = await register_anonimous();
    const cookie = res.body.cookie;
    if (cookie) {
      const cookieObj = cookieToJson(cookie);
      fs.writeFileSync(path.resolve(tmpPath, "anonymous_token"), cookieObj.MUSIC_A, "utf-8");
    }
  } catch (error) {
    console.error("[Backend] Failed to register anonymous token:", error);
  }
}
module.exports = generateConfig;
