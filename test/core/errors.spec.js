'use strict';

var expect = require('chai').expect;
var errors = require('../../core/src/errors');
var DomainError = errors.DomainError;
var ValidationError = errors.ValidationError;

function withoutCaptureStackTrace(body) {
  var original = Error.captureStackTrace;
  Error.captureStackTrace = undefined;
  try {
    body();
  } finally {
    Error.captureStackTrace = original;
  }
}

describe('DomainError', function () {
  it('extends Error', function () {
    var e = new DomainError('boom');
    expect(e).to.be.instanceof(Error);
    expect(e).to.be.instanceof(DomainError);
  });

  it('has a name and message', function () {
    var e = new DomainError('something went wrong');
    expect(e.name).to.equal('DomainError');
    expect(e.message).to.equal('something went wrong');
  });

  it('captures a stack trace', function () {
    var e = new DomainError('boom');
    expect(e.stack).to.be.a('string');
    expect(e.stack).to.contain('DomainError');
  });

  it('is throwable and catchable', function () {
    var caught;
    try {
      throw new DomainError('failure');
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceof(DomainError);
    expect(caught.message).to.equal('failure');
  });

  it('falls back to a synthesised stack when captureStackTrace is unavailable', function () {
    withoutCaptureStackTrace(function () {
      var e = new DomainError('boom');
      expect(e.stack).to.be.a('string');
      expect(e.message).to.equal('boom');
    });
  });
});

describe('ValidationError', function () {
  it('extends DomainError and Error', function () {
    var e = new ValidationError('invalid', 'field');
    expect(e).to.be.instanceof(Error);
    expect(e).to.be.instanceof(DomainError);
    expect(e).to.be.instanceof(ValidationError);
  });

  it('has a name, message, and field', function () {
    var e = new ValidationError('must be positive', 'naturalWidth');
    expect(e.name).to.equal('ValidationError');
    expect(e.message).to.equal('must be positive');
    expect(e.field).to.equal('naturalWidth');
  });

  it('allows omitting the field name', function () {
    var e = new ValidationError('invalid');
    expect(e.field).to.equal(undefined);
  });

  it('captures a stack trace', function () {
    var e = new ValidationError('boom', 'x');
    expect(e.stack).to.be.a('string');
  });

  it('is throwable and catchable as a DomainError', function () {
    var caught;
    try {
      throw new ValidationError('bad', 'x');
    } catch (e) {
      caught = e;
    }
    expect(caught).to.be.instanceof(DomainError);
    expect(caught).to.be.instanceof(ValidationError);
  });

  it('falls back to a synthesised stack when captureStackTrace is unavailable', function () {
    withoutCaptureStackTrace(function () {
      var e = new ValidationError('boom', 'field');
      expect(e.stack).to.be.a('string');
      expect(e.field).to.equal('field');
    });
  });
});
