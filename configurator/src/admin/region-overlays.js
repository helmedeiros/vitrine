'use strict';

var OVERLAY_BASE_STYLES = [
  'position:absolute',
  'border:2px solid #e95950',
  'background:rgba(233,89,80,0.18)',
  'cursor:pointer',
  'box-sizing:border-box'
];

function styleFor(region) {
  return OVERLAY_BASE_STYLES.concat([
    'left:' + region.x + 'px',
    'top:' + region.y + 'px',
    'width:' + region.width + 'px',
    'height:' + region.height + 'px'
  ]).join(';');
}

function buildRegionOverlay(documentRef, region) {
  var overlay = documentRef.createElement('div');
  overlay.setAttribute('data-vitrine-region', region.id);
  overlay.className = 'vitrine-region-overlay';
  overlay.style.cssText = styleFor(region);
  return overlay;
}

function clearRegionOverlays(container) {
  if (!container || typeof container.querySelectorAll !== 'function') {
    return;
  }
  var existing = container.querySelectorAll('[data-vitrine-region]');
  for (var i = existing.length - 1; i >= 0; i--) {
    container.removeChild(existing[i]);
  }
}

function renderRegions(documentRef, container, regions) {
  clearRegionOverlays(container);
  for (var i = 0; i < regions.length; i++) {
    container.appendChild(buildRegionOverlay(documentRef, regions[i]));
  }
}

module.exports = {
  buildRegionOverlay: buildRegionOverlay,
  clearRegionOverlays: clearRegionOverlays,
  renderRegions: renderRegions
};
