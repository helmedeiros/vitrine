'use strict';

var scanImages = require('./image-scanner');

function detectMode(globalConfig) {
  if (globalConfig === null || globalConfig === undefined) {
    return 'discovery';
  }
  if (typeof globalConfig !== 'object') {
    return 'discovery';
  }
  return 'config';
}

function boot(globalConfig) {
  return {mode: detectMode(globalConfig)};
}

module.exports = {
  version: '0.0.0',
  detectMode: detectMode,
  boot: boot,
  scanImages: scanImages
};
