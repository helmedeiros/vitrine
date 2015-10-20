'use strict';

var runtime = require('./runtime');

var DEFAULT_ADMIN_URL = 'https://helmedeiros.github.io/vitrine/admin/';

function resolveAdminUrl(windowRef, options) {
  if (options && typeof options.adminUrl === 'string' && options.adminUrl.length > 0) {
    return options.adminUrl;
  }
  if (typeof windowRef.VITRINE_ADMIN_URL === 'string' &&
      windowRef.VITRINE_ADMIN_URL.length > 0) {
    return windowRef.VITRINE_ADMIN_URL;
  }
  return DEFAULT_ADMIN_URL;
}

function autoStart(windowRef, documentRef, options) {
  var mode = runtime.detectMode(windowRef.VITRINE_CONFIG);
  if (mode !== 'discovery') {
    return null;
  }
  var detected = runtime.scanImages(documentRef);
  var adminUrl = resolveAdminUrl(windowRef, options);
  var payloadUrl = runtime.buildAdminUrl(adminUrl, {
    pageUrl: windowRef.location.href,
    images: detected
  });
  return runtime.mountDiscoveryPanel(documentRef, {
    imageCount: detected.length,
    adminUrl: payloadUrl
  });
}

function isBrowserContext() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function bindToBrowser() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      autoStart(window, document);
    });
  } else {
    autoStart(window, document);
  }
}

if (isBrowserContext()) {
  bindToBrowser();
}

var exported = {};
var key;
for (key in runtime) {
  if (runtime.hasOwnProperty(key)) {
    exported[key] = runtime[key];
  }
}
exported.autoStart = autoStart;

module.exports = exported;
