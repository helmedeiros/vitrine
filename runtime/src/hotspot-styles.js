'use strict';

var STYLE_ELEMENT_ID = 'vitrine-hotspot-styles';

var STYLE_RULES = [
  '[data-vitrine-hotspot] {',
  '  transition: background-color 150ms ease, outline 150ms ease;',
  '}',
  '[data-vitrine-hotspot]:hover {',
  '  background-color: rgba(233, 89, 80, 0.18);',
  '  outline: 2px solid rgba(233, 89, 80, 0.6);',
  '  outline-offset: -2px;',
  '}'
].join('\n');

function ensureStylesInstalled(documentRef) {
  if (typeof documentRef.getElementById === 'function' &&
      documentRef.getElementById(STYLE_ELEMENT_ID)) {
    return false;
  }
  var heads = documentRef.getElementsByTagName('head');
  if (!heads || heads.length === 0) {
    return false;
  }
  var head = heads[0];
  if (typeof head.appendChild !== 'function') {
    return false;
  }
  var style = documentRef.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = STYLE_RULES;
  head.appendChild(style);
  return true;
}

module.exports = {
  ensureStylesInstalled: ensureStylesInstalled,
  STYLE_ELEMENT_ID: STYLE_ELEMENT_ID
};
