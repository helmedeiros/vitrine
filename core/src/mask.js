'use strict';

function emptyData(width, height) {
  var data = new Array(width * height);
  for (var i = 0; i < data.length; i++) {
    data[i] = 0;
  }
  return data;
}

function Mask(width, height, data) {
  if (width <= 0 || height <= 0) {
    throw new Error('Mask requires positive width and height');
  }
  if (data && data.length !== width * height) {
    throw new Error('Mask data length must equal width × height');
  }
  this.width = width;
  this.height = height;
  this.data = data ? data.slice() : emptyData(width, height);
}

Mask.prototype.isInsideBounds = function (point) {
  var x = Math.floor(point.x);
  var y = Math.floor(point.y);
  return x >= 0 && x < this.width && y >= 0 && y < this.height;
};

Mask.prototype.indexOf = function (point) {
  var x = Math.floor(point.x);
  var y = Math.floor(point.y);
  return y * this.width + x;
};

Mask.prototype.contains = function (point) {
  if (!this.isInsideBounds(point)) {
    return false;
  }
  return Boolean(this.data[this.indexOf(point)]);
};

Mask.prototype.paint = function (point, value) {
  if (!this.isInsideBounds(point)) {
    return this;
  }
  var data = this.data.slice();
  data[this.indexOf(point)] = value ? 1 : 0;
  return new Mask(this.width, this.height, data);
};

Mask.prototype.coverage = function () {
  var count = 0;
  for (var i = 0; i < this.data.length; i++) {
    if (this.data[i]) {
      count++;
    }
  }
  return count / this.data.length;
};

Mask.prototype.equals = function (other) {
  if (!(other instanceof Mask)) {
    return false;
  }
  if (other.width !== this.width || other.height !== this.height) {
    return false;
  }
  for (var i = 0; i < this.data.length; i++) {
    if (Boolean(this.data[i]) !== Boolean(other.data[i])) {
      return false;
    }
  }
  return true;
};

module.exports = Mask;
