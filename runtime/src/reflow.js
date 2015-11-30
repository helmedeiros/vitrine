'use strict';

var HOTSPOT_BASE_STYLES = [
  'position:absolute',
  'background:transparent',
  'box-sizing:border-box',
  'text-decoration:none',
  'cursor:pointer'
].join(';');

function findImageInWrapper(wrapper) {
  if (!wrapper || !wrapper.children) {
    return null;
  }
  for (var i = 0; i < wrapper.children.length; i++) {
    if (wrapper.children[i].tagName === 'IMG') {
      return wrapper.children[i];
    }
  }
  return null;
}

function readNumberAttribute(element, name) {
  var raw = element.getAttribute(name);
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }
  var value = Number(raw);
  return isFinite(value) ? value : null;
}

function readOriginalGeometry(hotspot) {
  return {
    x: readNumberAttribute(hotspot, 'data-vitrine-x') || 0,
    y: readNumberAttribute(hotspot, 'data-vitrine-y') || 0,
    width: readNumberAttribute(hotspot, 'data-vitrine-width') || 0,
    height: readNumberAttribute(hotspot, 'data-vitrine-height') || 0
  };
}

function readRecordedDimensions(hotspot) {
  var width = readNumberAttribute(hotspot, 'data-vitrine-recorded-width');
  var height = readNumberAttribute(hotspot, 'data-vitrine-recorded-height');
  if (!width || !height) {
    return null;
  }
  return {width: width, height: height};
}

function computeScale(imageElement, recordedDimensions) {
  var identity = {x: 1, y: 1};
  if (!recordedDimensions) {
    return identity;
  }
  if (typeof imageElement.getBoundingClientRect !== 'function') {
    return identity;
  }
  var rect = imageElement.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) {
    return identity;
  }
  return {
    x: rect.width / recordedDimensions.width,
    y: rect.height / recordedDimensions.height
  };
}

function applyScaledStyle(hotspot, region, scale) {
  hotspot.style.cssText = HOTSPOT_BASE_STYLES + ';' +
    'left:' + (region.x * scale.x) + 'px;' +
    'top:' + (region.y * scale.y) + 'px;' +
    'width:' + (region.width * scale.x) + 'px;' +
    'height:' + (region.height * scale.y) + 'px';
}

function reflowOne(hotspot) {
  var imageElement = findImageInWrapper(hotspot.parentNode);
  if (!imageElement) {
    return;
  }
  var region = readOriginalGeometry(hotspot);
  var scale = computeScale(imageElement, readRecordedDimensions(hotspot));
  applyScaledStyle(hotspot, region, scale);
}

function reflowAll(documentRef) {
  if (typeof documentRef.querySelectorAll !== 'function') {
    return;
  }
  var hotspots = documentRef.querySelectorAll('[data-vitrine-hotspot]');
  for (var i = 0; i < hotspots.length; i++) {
    reflowOne(hotspots[i]);
  }
}

function attachReflow(windowRef, documentRef) {
  if (typeof windowRef.addEventListener !== 'function') {
    return;
  }
  windowRef.addEventListener('resize', function () {
    reflowAll(documentRef);
  });
}

module.exports = {
  reflowAll: reflowAll,
  attachReflow: attachReflow
};
