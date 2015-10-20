'use strict';

var PANEL_STYLES = [
  'position:fixed', 'top:12px', 'right:12px',
  'background:#1f1f1f', 'color:#ffffff',
  'padding:10px 14px', 'border-radius:4px',
  'font-family:Helvetica,Arial,sans-serif', 'font-size:13px',
  'line-height:1.4', 'z-index:2147483647',
  'box-shadow:0 2px 8px rgba(0,0,0,0.4)',
  'display:inline-block'
].join(';');

var BUTTON_STYLES = [
  'display:inline-block', 'margin-left:12px',
  'padding:5px 10px', 'background:#e95950', 'color:#ffffff',
  'text-decoration:none', 'border-radius:3px',
  'font-weight:bold'
].join(';');

function validateDocument(documentRef) {
  if (!documentRef || typeof documentRef.createElement !== 'function') {
    throw new Error('discovery-panel requires a document with createElement');
  }
}

function validateOptions(options) {
  if (!options || typeof options.imageCount !== 'number') {
    throw new Error('discovery-panel requires options.imageCount');
  }
  if (typeof options.adminUrl !== 'string' || options.adminUrl.length === 0) {
    throw new Error('discovery-panel requires options.adminUrl');
  }
}

function pluralise(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function buildLabel(documentRef, imageCount) {
  var label = documentRef.createElement('span');
  label.textContent = 'Vitrine: ' + imageCount + ' ' +
    pluralise(imageCount, 'image', 'images') + ' detected';
  return label;
}

function buildButton(documentRef, adminUrl) {
  var button = documentRef.createElement('a');
  button.textContent = 'Open in Vitrine';
  button.href = adminUrl;
  button.target = '_blank';
  button.style.cssText = BUTTON_STYLES;
  return button;
}

function buildPanel(documentRef, options) {
  validateDocument(documentRef);
  validateOptions(options);
  var container = documentRef.createElement('div');
  container.setAttribute('data-vitrine', 'discovery-panel');
  container.style.cssText = PANEL_STYLES;
  container.appendChild(buildLabel(documentRef, options.imageCount));
  container.appendChild(buildButton(documentRef, options.adminUrl));
  return container;
}

function mountPanel(documentRef, options) {
  var panel = buildPanel(documentRef, options);
  documentRef.body.appendChild(panel);
  return panel;
}

module.exports = {
  buildPanel: buildPanel,
  mountPanel: mountPanel
};
