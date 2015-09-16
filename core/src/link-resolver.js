'use strict';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function resolveManual(binding) {
  if (!isNonEmptyString(binding.url)) {
    throw new Error('Manual binding requires a non-empty url');
  }
  return {kind: 'manual', url: binding.url};
}

function resolveCatalog() {
  throw new Error('Catalog binding resolution is not yet implemented');
}

var STRATEGIES = {
  manual: resolveManual,
  catalog: resolveCatalog
};

function resolveLink(binding) {
  if (!binding || typeof binding !== 'object') {
    throw new Error('resolveLink requires a binding object');
  }
  if (typeof binding.kind !== 'string') {
    throw new Error('Binding must have a kind');
  }
  var strategy = STRATEGIES[binding.kind];
  if (!strategy) {
    throw new Error('No resolver strategy registered for kind: ' + binding.kind);
  }
  return strategy(binding);
}

module.exports = resolveLink;
