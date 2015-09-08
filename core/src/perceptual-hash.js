'use strict';

var HEX_TO_NIBBLE = {
  '0': 0, '1': 1, '2': 2, '3': 3,
  '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, 'a': 10, 'b': 11,
  'c': 12, 'd': 13, 'e': 14, 'f': 15
};

var HEX_PATTERN = /^[0-9a-fA-F]+$/;

function nibbleBit(value, position) {
  return Math.floor(value / Math.pow(2, position)) % 2;
}

function nibbleHammingDistance(a, b) {
  var distance = 0;
  for (var position = 0; position < 4; position++) {
    if (nibbleBit(a, position) !== nibbleBit(b, position)) {
      distance++;
    }
  }
  return distance;
}

function PerceptualHash(hex) {
  if (typeof hex !== 'string' || hex.length === 0 || !HEX_PATTERN.test(hex)) {
    throw new Error('PerceptualHash requires a non-empty hex string');
  }
  this.hex = hex.toLowerCase();
  this.bits = hex.length * 4;
}

PerceptualHash.prototype.equals = function (other) {
  return other instanceof PerceptualHash && other.hex === this.hex;
};

PerceptualHash.prototype.hammingDistance = function (other) {
  if (!(other instanceof PerceptualHash)) {
    throw new Error('hammingDistance requires another PerceptualHash');
  }
  if (other.hex.length !== this.hex.length) {
    throw new Error('PerceptualHashes must have the same length');
  }
  var distance = 0;
  for (var i = 0; i < this.hex.length; i++) {
    var a = HEX_TO_NIBBLE[this.hex.charAt(i)];
    var b = HEX_TO_NIBBLE[other.hex.charAt(i)];
    distance += nibbleHammingDistance(a, b);
  }
  return distance;
};

PerceptualHash.prototype.similarTo = function (other, threshold) {
  return this.hammingDistance(other) <= threshold;
};

PerceptualHash.prototype.toString = function () {
  return this.hex;
};

module.exports = PerceptualHash;
