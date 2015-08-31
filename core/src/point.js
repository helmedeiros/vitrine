'use strict';

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.equals = function (other) {
  return other instanceof Point && other.x === this.x && other.y === this.y;
};

Point.prototype.translate = function (dx, dy) {
  return new Point(this.x + dx, this.y + dy);
};

module.exports = Point;
