const test = require('ava');
const crypto = require('crypto');
const yapi = require('../../server/yapi');
const { getToken, parseToken } = require('../../server/utils/token');

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

const legacyAseEncode = function(data, password) {
  const { key, iv } = evpBytesToKey(password, 24, 16);
  const cipher = crypto.createCipheriv('aes192', key, iv);
  let crypted = cipher.update(String(data), 'utf-8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

test.beforeEach(() => {
  yapi.WEBCONFIG.passsalt = 'unit-test-passsalt';
});

test('token v2 roundtrip', t => {
  const token = getToken('project-token', '1');
  t.true(token.startsWith('v2.'));
  t.deepEqual(parseToken(token), {
    uid: '1',
    projectToken: 'project-token'
  });
});

test('token legacy roundtrip', t => {
  const token = legacyAseEncode('1|project-token', yapi.WEBCONFIG.passsalt);
  t.deepEqual(parseToken(token), {
    uid: '1',
    projectToken: 'project-token'
  });
});

test('token invalid returns false', t => {
  t.false(parseToken('deadbeef'));
});

