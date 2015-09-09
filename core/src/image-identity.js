'use strict';

var Url = require('./url');
var DimensionsAndStem = require('./dimensions-and-stem');
var PerceptualHash = require('./perceptual-hash');
var SelectorPath = require('./selector-path');

function requireOptionalInstance(value, Constructor, fieldName) {
  if (value === undefined || value === null) {
    return null;
  }
  if (!(value instanceof Constructor)) {
    throw new Error(
      'ImageIdentity.' + fieldName + ' must be an instance of ' + Constructor.name);
  }
  return value;
}

function signalsEqual(a, b) {
  if (a === null && b === null) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  return a.equals(b);
}

function ImageIdentity(signals) {
  if (!signals || typeof signals !== 'object') {
    throw new Error('ImageIdentity requires a signals object');
  }
  this.url = requireOptionalInstance(signals.url, Url, 'url');
  this.dimensionsAndStem = requireOptionalInstance(
    signals.dimensionsAndStem, DimensionsAndStem, 'dimensionsAndStem');
  this.perceptualHash = requireOptionalInstance(
    signals.perceptualHash, PerceptualHash, 'perceptualHash');
  this.selectorPath = requireOptionalInstance(
    signals.selectorPath, SelectorPath, 'selectorPath');
}

ImageIdentity.prototype.has = function (signalName) {
  return this[signalName] !== null && this[signalName] !== undefined;
};

ImageIdentity.prototype.equals = function (other) {
  if (!(other instanceof ImageIdentity)) {
    return false;
  }
  return signalsEqual(this.url, other.url) &&
    signalsEqual(this.dimensionsAndStem, other.dimensionsAndStem) &&
    signalsEqual(this.perceptualHash, other.perceptualHash) &&
    signalsEqual(this.selectorPath, other.selectorPath);
};

module.exports = ImageIdentity;
