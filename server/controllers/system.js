const yapi = require('../yapi.js');
const baseController = require('./base.js');
const axiosPkg = require('axios');

const axios = axiosPkg.default || axiosPkg;

const DEFAULT_SOURCE_URL =
  'https://www.fastmock.site/mock/1529fa78fa4c4880ad153d115084a940/yapi/versions';
const DEFAULT_CHANGELOG_URL = 'https://github.com/YMFE/yapi/blob/master/CHANGELOG.md';
const REQUEST_TIMEOUT = 5000;
const CACHE_TTL = 10 * 60 * 1000;

const versionCache = new Map();

function normalizeVersionNotifyConfig(rawConfig) {
  if (rawConfig === true) {
    return {
      enable: true,
      sourceUrl: DEFAULT_SOURCE_URL,
      changelogUrl: DEFAULT_CHANGELOG_URL
    };
  }

  if (rawConfig && typeof rawConfig === 'object') {
    return {
      enable: rawConfig.enable === true,
      sourceUrl: rawConfig.sourceUrl || DEFAULT_SOURCE_URL,
      changelogUrl: rawConfig.changelogUrl || DEFAULT_CHANGELOG_URL
    };
  }

  return {
    enable: false,
    sourceUrl: DEFAULT_SOURCE_URL,
    changelogUrl: DEFAULT_CHANGELOG_URL
  };
}

function pickLatestVersion(payload) {
  if (payload == null) return null;

  if (typeof payload === 'string') return payload;

  if (Array.isArray(payload)) {
    const first = payload[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof first.version === 'string') return first.version;
    return null;
  }

  if (typeof payload === 'object') {
    if (typeof payload.version === 'string') return payload.version;
    if (typeof payload.latestVersion === 'string') return payload.latestVersion;
    if (typeof payload.data === 'string') return payload.data;
    if (Array.isArray(payload.data)) {
      const first = payload.data[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && typeof first.version === 'string') return first.version;
    }
  }

  return null;
}

async function fetchLatestVersion(sourceUrl) {
  const res = await axios.get(sourceUrl, { timeout: REQUEST_TIMEOUT });
  return pickLatestVersion(res && res.data);
}

async function getLatestVersionCached(sourceUrl) {
  const now = Date.now();
  const existing = versionCache.get(sourceUrl);

  if (existing && existing.latestVersion && existing.expiresAt > now) {
    return existing.latestVersion;
  }

  if (existing && existing.inFlight) {
    return existing.inFlight;
  }

  const inFlight = (async () => {
    try {
      const latestVersion = await fetchLatestVersion(sourceUrl);
      versionCache.set(sourceUrl, {
        latestVersion: latestVersion || (existing && existing.latestVersion) || null,
        expiresAt: Date.now() + CACHE_TTL,
        inFlight: null
      });
      return latestVersion || (existing && existing.latestVersion) || null;
    } catch (err) {
      versionCache.set(sourceUrl, {
        latestVersion: (existing && existing.latestVersion) || null,
        expiresAt: Date.now() + CACHE_TTL,
        inFlight: null
      });
      return (existing && existing.latestVersion) || null;
    }
  })();

  versionCache.set(sourceUrl, {
    latestVersion: existing ? existing.latestVersion : null,
    expiresAt: existing ? existing.expiresAt : 0,
    inFlight
  });

  return inFlight;
}

class systemController extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  async version(ctx) {
    if ((await this.checkLogin(ctx)) !== true) {
      ctx.body = yapi.commons.resReturn(null, 40011, '请登录...');
      return;
    }

    if (this.getRole() !== 'admin') {
      ctx.body = yapi.commons.resReturn(null, 405, '没有权限');
      return;
    }

    const config = normalizeVersionNotifyConfig(yapi.WEBCONFIG.versionNotify);

    if (!config.enable) {
      ctx.body = yapi.commons.resReturn({ enable: false, changelogUrl: config.changelogUrl });
      return;
    }

    const latestVersion = await getLatestVersionCached(config.sourceUrl);

    ctx.body = yapi.commons.resReturn({
      enable: true,
      latestVersion,
      changelogUrl: config.changelogUrl
    });
  }
}

module.exports = systemController;
