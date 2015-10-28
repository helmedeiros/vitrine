'use strict';

function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

function validatePoint(point, label) {
  if (!point || typeof point !== 'object') {
    throw new Error(label + ' must be a point object');
  }
  if (!isFiniteNumber(point.x) || !isFiniteNumber(point.y)) {
    throw new Error(label + ' requires finite numeric x and y');
  }
}

function rectangleFromDrag(startPoint, currentPoint, bounds) {
  validatePoint(startPoint, 'startPoint');
  validatePoint(currentPoint, 'currentPoint');
  var x1 = Math.min(startPoint.x, currentPoint.x);
  var y1 = Math.min(startPoint.y, currentPoint.y);
  var x2 = Math.max(startPoint.x, currentPoint.x);
  var y2 = Math.max(startPoint.y, currentPoint.y);
  if (bounds) {
    x1 = Math.max(x1, 0);
    y1 = Math.max(y1, 0);
    x2 = Math.min(x2, bounds.width);
    y2 = Math.min(y2, bounds.height);
  }
  return {x: x1, y: y1, width: x2 - x1, height: y2 - y1};
}

module.exports = rectangleFromDrag;
