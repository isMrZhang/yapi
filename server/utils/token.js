const yapi = require('../yapi')

const crypto = require('crypto');

/*
 下面是使用加密算法
*/

// token v2 格式：v2.{base64url(iv|tag|ciphertext)}，用于在 Node 22/24 + OpenSSL 3 下避免历史 crypto API
const tokenV2Prefix = 'v2.';

// 旧 token 兼容：历史实现使用 `createCipher('aes192', password)`，其底层等价于 EVP_BytesToKey(md5)
// 这里显式实现同样的派生方式，仅用于解析旧 token；新 token 均使用 v2 方案签发
const evpBytesToKey = function(password, keyLen, ivLen) {
  let data = Buffer.alloc(0);
  let prev = Buffer.alloc(0);
  const pass = Buffer.from(String(password), 'utf8');
  while (data.length < keyLen + ivLen) {
    const hash = crypto.createHash('md5');
    hash.update(Buffer.concat([prev, pass]));
    prev = hash.digest();
    data = Buffer.concat([data, prev]);
  }
  return {
    key: data.subarray(0, keyLen),
    iv: data.subarray(keyLen, keyLen + ivLen)
  };
};

const legacyAseDecode = function(data, password) {
  const { key, iv } = evpBytesToKey(password, 24, 16);
  const decipher = crypto.createDecipheriv('aes192', key, iv);
  let decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};

// v2：AES-256-GCM + scrypt 派生 key；兼容性与安全性都优于历史 API（显式 IV + AEAD tag）
const tokenV2Encode = function(data, password) {
  const key = crypto.scryptSync(String(password), 'yapi.token', 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(data), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return tokenV2Prefix + Buffer.concat([iv, tag, encrypted]).toString('base64url');
};

const tokenV2Decode = function(token, password) {
  const payload = token.startsWith(tokenV2Prefix) ? token.slice(tokenV2Prefix.length) : token;
  const buf = Buffer.from(payload, 'base64url');
  if (buf.length < 12 + 16 + 1) throw new Error('invalid token');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const key = crypto.scryptSync(String(password), 'yapi.token', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};

const defaultSalt = 'abcde';

exports.getToken = function getToken(token, uid){
  if(!token)throw new Error('token 不能为空')
  yapi.WEBCONFIG.passsalt = yapi.WEBCONFIG.passsalt || defaultSalt;
  return tokenV2Encode(uid + '|' + token, yapi.WEBCONFIG.passsalt)
}

exports.parseToken = function parseToken(token){
  if(!token)throw new Error('token 不能为空')
  yapi.WEBCONFIG.passsalt = yapi.WEBCONFIG.passsalt || defaultSalt;
  let tokens;
  try{
    if (String(token).startsWith(tokenV2Prefix)) {
      tokens = tokenV2Decode(token, yapi.WEBCONFIG.passsalt)
    } else {
      tokens = legacyAseDecode(token, yapi.WEBCONFIG.passsalt)
    }
  }catch(e){
    // 兼容回退：允许 v2 token 在少数情况下缺少前缀或格式异常时，仍尝试按 v2 解码
    try{
      tokens = tokenV2Decode(token, yapi.WEBCONFIG.passsalt)
    }catch(err){}
  }
  if(tokens && typeof tokens === 'string' && tokens.indexOf('|') > 0){
    tokens = tokens.split('|')
    return {
      uid: tokens[0],
      projectToken: tokens[1]
    }
  }
  return false;
  
}
