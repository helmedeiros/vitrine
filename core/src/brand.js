'use strict';

var ValidationError = require('./errors').ValidationError;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function requireField(value, fieldName) {
  if (!isNonEmptyString(value)) {
    throw new ValidationError('Brand requires a non-empty ' + fieldName, fieldName);
  }
}

function Brand(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new ValidationError('Brand requires a fields object');
  }
  requireField(fields.key, 'key');
  requireField(fields.name, 'name');
  requireField(fields.adapterKey, 'adapterKey');
  this.key = fields.key;
  this.name = fields.name;
  this.adapterKey = fields.adapterKey;
  this.locale = isNonEmptyString(fields.locale) ? fields.locale : null;
}

Brand.prototype.equals = function (other) {
  return other instanceof Brand && other.key === this.key;
};

module.exports = Brand;
