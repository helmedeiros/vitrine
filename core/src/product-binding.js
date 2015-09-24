'use strict';

var ValidationError = require('./errors').ValidationError;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function applyManualFields(target, fields) {
  if (!isNonEmptyString(fields.url)) {
    throw new ValidationError(
      'Manual ProductBinding requires a non-empty url', 'url');
  }
  target.kind = 'manual';
  target.url = fields.url;
  target.catalogProductId = null;
  target.brandKey = null;
}

function applyCatalogFields(target, fields) {
  if (!isNonEmptyString(fields.catalogProductId)) {
    throw new ValidationError(
      'Catalog ProductBinding requires a non-empty catalogProductId',
      'catalogProductId');
  }
  if (!isNonEmptyString(fields.brandKey)) {
    throw new ValidationError(
      'Catalog ProductBinding requires a non-empty brandKey', 'brandKey');
  }
  target.kind = 'catalog';
  target.url = null;
  target.catalogProductId = fields.catalogProductId;
  target.brandKey = fields.brandKey;
}

function ProductBinding(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new ValidationError('ProductBinding requires a fields object');
  }
  if (!isNonEmptyString(fields.regionId)) {
    throw new ValidationError(
      'ProductBinding requires a non-empty regionId', 'regionId');
  }
  if (fields.kind === 'manual') {
    applyManualFields(this, fields);
  } else if (fields.kind === 'catalog') {
    applyCatalogFields(this, fields);
  } else {
    throw new ValidationError(
      'ProductBinding kind must be "manual" or "catalog"', 'kind');
  }
  this.regionId = fields.regionId;
  this.notes = isNonEmptyString(fields.notes) ? fields.notes : null;
}

ProductBinding.prototype.equals = function (other) {
  return other instanceof ProductBinding && other.regionId === this.regionId;
};

module.exports = ProductBinding;
