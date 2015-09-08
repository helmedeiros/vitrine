'use strict';

function isPositiveInteger(value) {
  return typeof value === 'number' && value > 0 && value % 1 === 0;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function extractStemFromUrl(rawUrl) {
  var withoutQueryOrFragment = rawUrl.split(/[?#]/)[0];
  var lastSlash = withoutQueryOrFragment.lastIndexOf('/');
  var basename = lastSlash === -1 ?
    withoutQueryOrFragment :
    withoutQueryOrFragment.substring(lastSlash + 1);
  var lastDot = basename.lastIndexOf('.');
  return lastDot === -1 ? basename : basename.substring(0, lastDot);
}

function DimensionsAndStem(naturalWidth, naturalHeight, filenameStem) {
  if (!isPositiveInteger(naturalWidth) || !isPositiveInteger(naturalHeight)) {
    throw new Error('DimensionsAndStem requires positive integer dimensions');
  }
  if (!isNonEmptyString(filenameStem)) {
    throw new Error('DimensionsAndStem requires a non-empty filename stem');
  }
  this.naturalWidth = naturalWidth;
  this.naturalHeight = naturalHeight;
  this.filenameStem = filenameStem;
}

DimensionsAndStem.prototype.equals = function (other) {
  return other instanceof DimensionsAndStem &&
    other.naturalWidth === this.naturalWidth &&
    other.naturalHeight === this.naturalHeight &&
    other.filenameStem === this.filenameStem;
};

DimensionsAndStem.fromUrl = function (rawUrl, naturalWidth, naturalHeight) {
  return new DimensionsAndStem(naturalWidth, naturalHeight, extractStemFromUrl(rawUrl));
};

module.exports = DimensionsAndStem;
