'use strict';

var ImageIdentity = require('./image-identity');

var DEFAULT_PERCEPTUAL_THRESHOLD = 10;

var NO_MATCH = {matched: false, confidence: 0, via: null};

function matchByExactUrl(configured, candidate) {
  if (!configured.has('url') || !candidate.has('url')) {
    return null;
  }
  if (configured.url.raw !== candidate.url.raw) {
    return null;
  }
  return {matched: true, confidence: 1.0, via: 'url'};
}

function matchByNormalisedUrl(configured, candidate) {
  if (!configured.has('url') || !candidate.has('url')) {
    return null;
  }
  if (!configured.url.equals(candidate.url)) {
    return null;
  }
  return {matched: true, confidence: 0.95, via: 'normalisedUrl'};
}

function matchByDimensionsAndStem(configured, candidate) {
  if (!configured.has('dimensionsAndStem') || !candidate.has('dimensionsAndStem')) {
    return null;
  }
  if (!configured.dimensionsAndStem.equals(candidate.dimensionsAndStem)) {
    return null;
  }
  return {matched: true, confidence: 0.85, via: 'dimensionsAndStem'};
}

function matchByPerceptualHash(configured, candidate, threshold) {
  if (!configured.has('perceptualHash') || !candidate.has('perceptualHash')) {
    return null;
  }
  if (configured.perceptualHash.bits !== candidate.perceptualHash.bits) {
    return null;
  }
  var distance = configured.perceptualHash.hammingDistance(candidate.perceptualHash);
  if (distance > threshold) {
    return null;
  }
  var confidence = 1.0 - (distance / configured.perceptualHash.bits);
  return {matched: true, confidence: confidence, via: 'perceptualHash'};
}

function matchBySelectorPath(configured, candidate) {
  if (!configured.has('selectorPath') || !candidate.has('selectorPath')) {
    return null;
  }
  if (!configured.selectorPath.equals(candidate.selectorPath)) {
    return null;
  }
  return {matched: true, confidence: 0.5, via: 'selectorPath'};
}

function resolveThreshold(options) {
  if (options && typeof options.perceptualThreshold === 'number') {
    return options.perceptualThreshold;
  }
  return DEFAULT_PERCEPTUAL_THRESHOLD;
}

function matchIdentities(configured, candidate, options) {
  if (!(configured instanceof ImageIdentity)) {
    throw new Error('matchIdentities requires configured to be an ImageIdentity');
  }
  if (!(candidate instanceof ImageIdentity)) {
    throw new Error('matchIdentities requires candidate to be an ImageIdentity');
  }
  var threshold = resolveThreshold(options);

  var result = matchByExactUrl(configured, candidate);
  if (result) {
    return result;
  }
  result = matchByNormalisedUrl(configured, candidate);
  if (result) {
    return result;
  }
  result = matchByDimensionsAndStem(configured, candidate);
  if (result) {
    return result;
  }
  result = matchByPerceptualHash(configured, candidate, threshold);
  if (result) {
    return result;
  }
  result = matchBySelectorPath(configured, candidate);
  if (result) {
    return result;
  }
  return NO_MATCH;
}

module.exports = matchIdentities;
