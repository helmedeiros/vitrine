'use strict';

var CACHE_BUST_PARAMS = ['v', 'ts', 't', '_', 'ck', 'cb', 'cache', 'r', 'rnd', 'random'];

function stripFragment(url) {
  var hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.substring(0, hashIndex);
}

function lowercaseSchemeAndHost(url) {
  var schemeEnd = url.indexOf('://');
  if (schemeEnd === -1) {
    return url;
  }
  var hostEnd = schemeEnd + 3;
  while (hostEnd < url.length && '/?#'.indexOf(url.charAt(hostEnd)) === -1) {
    hostEnd++;
  }
  return url.substring(0, hostEnd).toLowerCase() + url.substring(hostEnd);
}

function splitQuery(url) {
  var queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return {base: url, params: []};
  }
  var query = url.substring(queryIndex + 1);
  var params = query === '' ? [] : query.split('&');
  return {base: url.substring(0, queryIndex), params: params};
}

function isCacheBustParam(pair) {
  var key = pair.split('=')[0];
  return CACHE_BUST_PARAMS.indexOf(key) !== -1;
}

function normalise(raw) {
  var withoutFragment = stripFragment(raw);
  var lowercased = lowercaseSchemeAndHost(withoutFragment);
  var split = splitQuery(lowercased);
  var keptParams = [];
  for (var i = 0; i < split.params.length; i++) {
    if (!isCacheBustParam(split.params[i])) {
      keptParams.push(split.params[i]);
    }
  }
  keptParams.sort();
  return keptParams.length === 0 ?
    split.base :
    split.base + '?' + keptParams.join('&');
}

function Url(raw) {
  if (typeof raw !== 'string' || raw.length === 0) {
    throw new Error('Url requires a non-empty string');
  }
  this.raw = raw;
  this.normalised = normalise(raw);
}

Url.prototype.equals = function (other) {
  return other instanceof Url && other.normalised === this.normalised;
};

Url.prototype.toString = function () {
  return this.raw;
};

Url.normalise = normalise;

module.exports = Url;
