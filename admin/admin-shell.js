'use strict';

var HASH_DATA_PATTERN = /^#data=(.+)$/;

function readHashFragment(hash) {
  if (typeof hash !== 'string') {
    return null;
  }
  var match = hash.match(HASH_DATA_PATTERN);
  return match ? match[1] : null;
}

function decodeBase64ToUtf8(base64) {
  if (typeof atob === 'function') {
    return decodeURIComponent(escape(atob(base64)));
  }
  return new Buffer(base64, 'base64').toString('utf8');
}

function decodePayload(base64) {
  if (typeof base64 !== 'string' || base64.length === 0) {
    throw new Error('decodePayload requires a non-empty base64 string');
  }
  return JSON.parse(decodeBase64ToUtf8(base64));
}

function buildImageCard(documentRef, image) {
  var card = documentRef.createElement('li');
  card.className = 'vitrine-image-card';

  var thumb = documentRef.createElement('img');
  thumb.src = image.src;
  thumb.className = 'vitrine-image-thumb';
  card.appendChild(thumb);

  var caption = documentRef.createElement('span');
  caption.textContent = image.src;
  caption.className = 'vitrine-image-url';
  card.appendChild(caption);

  return card;
}

function renderImageList(documentRef, payload, options) {
  var settings = options || {};
  var containerId = settings.containerId || 'vitrine-image-list';
  var list = documentRef.getElementById(containerId);
  if (!list) {
    return 0;
  }
  if (!payload || !Array.isArray(payload.images)) {
    return 0;
  }
  for (var i = 0; i < payload.images.length; i++) {
    list.appendChild(buildImageCard(documentRef, payload.images[i]));
  }
  return payload.images.length;
}

var adminShell = {
  readHashFragment: readHashFragment,
  decodePayload: decodePayload,
  renderImageList: renderImageList
};

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = adminShell;
}

if (typeof window !== 'undefined') {
  window.vitrineAdminShell = adminShell;
}
