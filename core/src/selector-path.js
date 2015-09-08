'use strict';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function SelectorPath(segments) {
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error('SelectorPath requires a non-empty array of segments');
  }
  for (var i = 0; i < segments.length; i++) {
    if (!isNonEmptyString(segments[i])) {
      throw new Error('SelectorPath segments must be non-empty strings');
    }
  }
  this.segments = segments.slice();
  this.depth = this.segments.length;
}

SelectorPath.prototype.toString = function () {
  return this.segments.join(' > ');
};

SelectorPath.prototype.equals = function (other) {
  if (!(other instanceof SelectorPath)) {
    return false;
  }
  if (other.segments.length !== this.segments.length) {
    return false;
  }
  for (var i = 0; i < this.segments.length; i++) {
    if (this.segments[i] !== other.segments[i]) {
      return false;
    }
  }
  return true;
};

SelectorPath.parse = function (selectorString) {
  if (!isNonEmptyString(selectorString)) {
    throw new Error('SelectorPath.parse requires a non-empty string');
  }
  var raw = selectorString.split('>');
  var segments = [];
  for (var i = 0; i < raw.length; i++) {
    var trimmed = raw[i].replace(/^\s+|\s+$/g, '');
    if (trimmed.length > 0) {
      segments.push(trimmed);
    }
  }
  return new SelectorPath(segments);
};

module.exports = SelectorPath;
