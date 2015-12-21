'use strict';

var urlValidation = require('./url-validation');

function regionForExport(region) {
  return {
    x: region.x,
    y: region.y,
    width: region.width,
    height: region.height,
    url: region.url || ''
  };
}

function exportableImage(image, regions, dimensions) {
  var exported = {src: image.src};
  if (dimensions && dimensions.width && dimensions.height) {
    exported.recordedWidth = dimensions.width;
    exported.recordedHeight = dimensions.height;
  }
  exported.regions = [];
  for (var i = 0; i < regions.length; i++) {
    exported.regions.push(regionForExport(regions[i]));
  }
  return exported;
}

function buildExportConfig(state, payload) {
  if (!state || !state.regionsByIndex ||
      !payload || !Array.isArray(payload.images)) {
    return {images: []};
  }
  var images = [];
  var byIndex = state.regionsByIndex;
  var byDims = state.imageDimensions || {};
  for (var indexStr in byIndex) {
    if (!byIndex.hasOwnProperty(indexStr)) {
      continue;
    }
    var index = Number(indexStr);
    var regions = byIndex[indexStr];
    if (!regions || regions.length === 0) {
      continue;
    }
    var image = payload.images[index];
    if (!image) {
      continue;
    }
    images.push(exportableImage(image, regions, byDims[indexStr]));
  }
  return {images: images};
}

function buildExportSnippet(config) {
  return '<script>window.VITRINE_CONFIG = ' + JSON.stringify(config) + ';</script>';
}

function hasInvalidRegionUrls(state) {
  if (!state || !state.regionsByIndex) {
    return false;
  }
  var byIndex = state.regionsByIndex;
  for (var indexStr in byIndex) {
    if (!byIndex.hasOwnProperty(indexStr)) {
      continue;
    }
    var regions = byIndex[indexStr];
    for (var i = 0; i < regions.length; i++) {
      if (!urlValidation.isValidUrl(regions[i].url)) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  buildExportConfig: buildExportConfig,
  buildExportSnippet: buildExportSnippet,
  hasInvalidRegionUrls: hasInvalidRegionUrls
};
