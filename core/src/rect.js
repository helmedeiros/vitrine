'use strict';

function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Rect.prototype.area = function () {
  return this.width * this.height;
};

Rect.prototype.contains = function (point) {
  return point.x >= this.x &&
    point.x <= this.x + this.width &&
    point.y >= this.y &&
    point.y <= this.y + this.height;
};

Rect.prototype.intersects = function (other) {
  return this.x <= other.x + other.width &&
    this.x + this.width >= other.x &&
    this.y <= other.y + other.height &&
    this.y + this.height >= other.y;
};

Rect.prototype.equals = function (other) {
  return other instanceof Rect &&
    other.x === this.x &&
    other.y === this.y &&
    other.width === this.width &&
    other.height === this.height;
};

module.exports = Rect;
