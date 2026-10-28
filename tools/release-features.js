'use strict';

const TRUE_VALUES = new Set(['1', 'true', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'off']);

function resolveBoolean(name, value) {
  const normalized = String(value).trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  throw new Error(`${name} must be one of: 1, 0, true, false, on, off`);
}

function resolveReleaseFeatures({ env = process.env, argv = process.argv.slice(2) } = {}) {
  let mockAudience;
  if (Object.prototype.hasOwnProperty.call(env, 'TS_ENABLE_MOCK_AUDIENCE')) {
    mockAudience = resolveBoolean('TS_ENABLE_MOCK_AUDIENCE', env.TS_ENABLE_MOCK_AUDIENCE);
  } else {
    mockAudience = env.VERCEL_ENV === 'preview' || argv.includes('--mock-audience');
  }
  return Object.freeze({ mockAudience });
}

module.exports = { resolveReleaseFeatures };
