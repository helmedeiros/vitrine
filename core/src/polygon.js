'use strict';

function Polygon(vertices) {
  if (!vertices || vertices.length < 3) {
    throw new Error('Polygon requires at least three vertices');
  }
  this.vertices = vertices.slice();
}

Polygon.prototype.contains = function (point) {
  var inside = false;
  var vertices = this.vertices;
  var n = vertices.length;
  var previous = n - 1;
  for (var current = 0; current < n; current++) {
    var vi = vertices[current];
    var vj = vertices[previous];
    var straddles = (vi.y > point.y) !== (vj.y > point.y);
    var crossesRayAtPoint = straddles &&
      point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x;
    if (crossesRayAtPoint) {
      inside = !inside;
    }
    previous = current;
  }
  return inside;
};

Polygon.prototype.equals = function (other) {
  if (!(other instanceof Polygon)) {
    return false;
  }
  if (other.vertices.length !== this.vertices.length) {
    return false;
  }
  for (var i = 0; i < this.vertices.length; i++) {
    if (!this.vertices[i].equals(other.vertices[i])) {
      return false;
    }
  }
  return true;
};

module.exports = Polygon;
