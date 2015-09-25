'use strict';

var Url = require('./url');
var ImageAsset = require('./image-asset');
var Region = require('./region');
var ProductBinding = require('./product-binding');
var ValidationError = require('./errors').ValidationError;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function requireArrayOf(arr, Type, fieldName) {
  if (!Array.isArray(arr)) {
    throw new ValidationError(
      'Artifact requires ' + fieldName + ' to be an array', fieldName);
  }
  for (var i = 0; i < arr.length; i++) {
    if (!(arr[i] instanceof Type)) {
      throw new ValidationError(
        'Artifact ' + fieldName + '[' + i + '] must be a ' + Type.name, fieldName);
    }
  }
}

function Artifact(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new ValidationError('Artifact requires a fields object');
  }
  if (!(fields.pageUrl instanceof Url)) {
    throw new ValidationError('Artifact requires a Url for pageUrl', 'pageUrl');
  }
  if (!isNonEmptyString(fields.version)) {
    throw new ValidationError('Artifact requires a non-empty version', 'version');
  }
  if (typeof fields.createdAt !== 'number') {
    throw new ValidationError(
      'Artifact requires a numeric createdAt', 'createdAt');
  }
  requireArrayOf(fields.imageAssets, ImageAsset, 'imageAssets');
  requireArrayOf(fields.regions, Region, 'regions');
  requireArrayOf(fields.bindings, ProductBinding, 'bindings');
  this.pageUrl = fields.pageUrl;
  this.version = fields.version;
  this.imageAssets = fields.imageAssets.slice();
  this.regions = fields.regions.slice();
  this.bindings = fields.bindings.slice();
  this.createdAt = fields.createdAt;
}

Artifact.prototype.equals = function (other) {
  return other instanceof Artifact &&
    this.pageUrl.equals(other.pageUrl) &&
    this.version === other.version;
};

module.exports = Artifact;
