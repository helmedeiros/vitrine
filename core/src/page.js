'use strict';

var Url = require('./url');
var ValidationError = require('./errors').ValidationError;

function Page(fields) {
  if (!fields || typeof fields !== 'object') {
    throw new ValidationError('Page requires a fields object');
  }
  if (!(fields.url instanceof Url)) {
    throw new ValidationError('Page requires a Url for url', 'url');
  }
  if (typeof fields.ingestedAt !== 'number') {
    throw new ValidationError('Page requires a numeric ingestedAt', 'ingestedAt');
  }
  this.url = fields.url;
  this.ingestedAt = fields.ingestedAt;
}

Page.prototype.equals = function (other) {
  return other instanceof Page && this.url.equals(other.url);
};

module.exports = Page;
