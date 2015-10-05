'use strict';

function encodeUtf8ToBase64(jsonString) {
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(jsonString)));
  }
  return new Buffer(jsonString, 'utf8').toString('base64');
}

function encodePayload(payload) {
  return encodeUtf8ToBase64(JSON.stringify(payload));
}

function buildAdminUrl(adminUrl, payload) {
  if (typeof adminUrl !== 'string' || adminUrl.length === 0) {
    throw new Error('buildAdminUrl requires a non-empty adminUrl');
  }
  if (payload === undefined || payload === null) {
    throw new Error('buildAdminUrl requires a payload');
  }
  return adminUrl + '#data=' + encodePayload(payload);
}

module.exports = {
  encodePayload: encodePayload,
  buildAdminUrl: buildAdminUrl
};
