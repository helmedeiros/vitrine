'use strict';

function DomainError(message) {
  Error.call(this, message);
  this.name = 'DomainError';
  this.message = message;
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, DomainError);
  } else {
    this.stack = new Error(message).stack;
  }
}

DomainError.prototype = Object.create(Error.prototype);
DomainError.prototype.constructor = DomainError;

function ValidationError(message, field) {
  DomainError.call(this, message);
  this.name = 'ValidationError';
  this.field = field;
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, ValidationError);
  } else {
    this.stack = new Error(message).stack;
  }
}

ValidationError.prototype = Object.create(DomainError.prototype);
ValidationError.prototype.constructor = ValidationError;

module.exports = {
  DomainError: DomainError,
  ValidationError: ValidationError
};
