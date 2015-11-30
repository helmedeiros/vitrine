'use strict';

var hotspotStyles = require('./hotspot-styles');

var WRAPPER_STYLES = 'position:relative;display:inline-block';

var HOTSPOT_BASE_STYLES = [
  'position:absolute',
  'background:transparent',
  'box-sizing:border-box',
  'text-decoration:none',
  'cursor:pointer'
].join(';');

function findImages(documentRef, src) {
  var imgs = documentRef.getElementsByTagName('img');
  var matched = [];
  for (var i = 0; i < imgs.length; i++) {
    if (imgs[i].src === src) {
      matched.push(imgs[i]);
    }
  }
  return matched;
}

function isVitrineWrapper(element) {
  if (!element || typeof element.getAttribute !== 'function') {
    return false;
  }
  return element.getAttribute('data-vitrine-wrapper') === 'config';
}

function wrapImageElement(documentRef, imgElement) {
  var existingParent = imgElement.parentNode;
  if (!existingParent) {
    return null;
  }
  if (isVitrineWrapper(existingParent)) {
    return existingParent;
  }
  var wrapper = documentRef.createElement('div');
  wrapper.setAttribute('data-vitrine-wrapper', 'config');
  wrapper.style.cssText = WRAPPER_STYLES;
  existingParent.insertBefore(wrapper, imgElement);
  wrapper.appendChild(imgElement);
  return wrapper;
}

function buildHotspot(documentRef, region) {
  var hotspot = documentRef.createElement('a');
  hotspot.href = region.url || '#';
  hotspot.setAttribute('data-vitrine-hotspot', '');
  hotspot.style.cssText = HOTSPOT_BASE_STYLES + ';' +
    'left:' + region.x + 'px;' +
    'top:' + region.y + 'px;' +
    'width:' + region.width + 'px;' +
    'height:' + region.height + 'px';
  return hotspot;
}

function computeScale(imgElement, imageConfig) {
  var identity = {x: 1, y: 1};
  if (!imageConfig.recordedWidth || !imageConfig.recordedHeight) {
    return identity;
  }
  if (typeof imgElement.getBoundingClientRect !== 'function') {
    return identity;
  }
  var rect = imgElement.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) {
    return identity;
  }
  return {
    x: rect.width / imageConfig.recordedWidth,
    y: rect.height / imageConfig.recordedHeight
  };
}

function scaleRegion(region, scale) {
  return {
    x: region.x * scale.x,
    y: region.y * scale.y,
    width: region.width * scale.x,
    height: region.height * scale.y,
    url: region.url
  };
}

function mountHotspots(documentRef, imgElement, regions, imageConfig) {
  var wrapper = wrapImageElement(documentRef, imgElement);
  if (!wrapper) {
    return [];
  }
  var scale = computeScale(imgElement, imageConfig || {});
  var mounted = [];
  for (var i = 0; i < regions.length; i++) {
    var hotspot = buildHotspot(documentRef, scaleRegion(regions[i], scale));
    wrapper.appendChild(hotspot);
    mounted.push(hotspot);
  }
  return mounted;
}

function mountConfig(documentRef, config) {
  if (!config || !Array.isArray(config.images)) {
    return [];
  }
  hotspotStyles.ensureStylesInstalled(documentRef);
  var allMounted = [];
  for (var i = 0; i < config.images.length; i++) {
    var imageConfig = config.images[i];
    var matched = findImages(documentRef, imageConfig.src);
    for (var j = 0; j < matched.length; j++) {
      var hotspots = mountHotspots(documentRef, matched[j],
        imageConfig.regions || [], imageConfig);
      allMounted = allMounted.concat(hotspots);
    }
  }
  return allMounted;
}

module.exports = {
  mountConfig: mountConfig
};
