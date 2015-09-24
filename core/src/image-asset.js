'use strict';

var ImageIdentity = require('./image-identity');
var Url = require('./url');
var ValidationError = require('./errors').ValidationError;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isPositiveInteger(value) {
  return typeof value === 'number' && value > 0 && value % 1 === 0;
}

function ImageAsset(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new ValidationError('ImageAsset requires a fields object');
  }
  if (!isNonEmptyString(fields.id)) {
    throw new ValidationError('ImageAsset requires a non-empty id', 'id');
  }
  if (!(fields.identity instanceof ImageIdentity)) {
    throw new ValidationError('ImageAsset requires an ImageIdentity', 'identity');
  }
  if (!isPositiveInteger(fields.renderedWidth)) {
    throw new ValidationError(
      'ImageAsset requires a positive integer renderedWidth', 'renderedWidth');
  }
  if (!isPositiveInteger(fields.renderedHeight)) {
    throw new ValidationError(
      'ImageAsset requires a positive integer renderedHeight', 'renderedHeight');
  }
  if (fields.workingCopyUrl !== undefined &&
      fields.workingCopyUrl !== null &&
      !(fields.workingCopyUrl instanceof Url)) {
    throw new ValidationError(
      'ImageAsset.workingCopyUrl must be a Url', 'workingCopyUrl');
  }
  this.id = fields.id;
  this.identity = fields.identity;
  this.renderedWidth = fields.renderedWidth;
  this.renderedHeight = fields.renderedHeight;
  this.workingCopyUrl = fields.workingCopyUrl || null;
}

ImageAsset.prototype.equals = function (other) {
  return other instanceof ImageAsset && other.id === this.id;
};

module.exports = ImageAsset;
