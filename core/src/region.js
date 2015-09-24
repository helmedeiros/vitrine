'use strict';

var Point = require('./point');
var Rect = require('./rect');
var Polygon = require('./polygon');
var Mask = require('./mask');
var ValidationError = require('./errors').ValidationError;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function geometryKindOf(geometry) {
  if (geometry instanceof Point) {
    return 'point';
  }
  if (geometry instanceof Rect) {
    return 'rect';
  }
  if (geometry instanceof Polygon) {
    return 'polygon';
  }
  if (geometry instanceof Mask) {
    return 'mask';
  }
  return null;
}

function Region(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new ValidationError('Region requires a fields object');
  }
  if (!isNonEmptyString(fields.id)) {
    throw new ValidationError('Region requires a non-empty id', 'id');
  }
  if (!isNonEmptyString(fields.imageAssetId)) {
    throw new ValidationError(
      'Region requires a non-empty imageAssetId', 'imageAssetId');
  }
  var kind = geometryKindOf(fields.geometry);
  if (kind === null) {
    throw new ValidationError(
      'Region requires geometry to be a Point, Rect, Polygon, or Mask', 'geometry');
  }
  this.id = fields.id;
  this.imageAssetId = fields.imageAssetId;
  this.geometry = fields.geometry;
  this.geometryKind = kind;
}

Region.prototype.equals = function (other) {
  return other instanceof Region && other.id === this.id;
};

module.exports = Region;
