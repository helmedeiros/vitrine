'use strict';

var expect = require('chai').expect;
var Brand = require('../../core/src/brand');
var ValidationError = require('../../core/src/errors').ValidationError;

describe('Brand', function () {
  it('exposes key, name, adapterKey, and locale', function () {
    var b = new Brand({
      key: 'asos',
      name: 'ASOS',
      adapterKey: 'rest-search',
      locale: 'en-GB'
    });
    expect(b.key).to.equal('asos');
    expect(b.name).to.equal('ASOS');
    expect(b.adapterKey).to.equal('rest-search');
    expect(b.locale).to.equal('en-GB');
  });

  it('defaults locale to null when not provided', function () {
    var b = new Brand({key: 'asos', name: 'ASOS', adapterKey: 'rest-search'});
    expect(b.locale).to.equal(null);
  });

  it('defaults locale to null when empty string is provided', function () {
    var b = new Brand({key: 'asos', name: 'ASOS', adapterKey: 'rest-search', locale: ''});
    expect(b.locale).to.equal(null);
  });

  it('rejects a missing fields argument', function () {
    expect(function () { return new Brand(); }).to.throw(ValidationError);
    expect(function () { return new Brand(null); }).to.throw(ValidationError);
    expect(function () { return new Brand('asos'); }).to.throw(ValidationError);
  });

  it('rejects a missing key', function () {
    expect(function () {
      return new Brand({name: 'ASOS', adapterKey: 'rest-search'});
    }).to.throw(ValidationError);
    expect(function () {
      return new Brand({key: '', name: 'ASOS', adapterKey: 'rest-search'});
    }).to.throw(ValidationError);
  });

  it('rejects a missing name', function () {
    expect(function () {
      return new Brand({key: 'asos', adapterKey: 'rest-search'});
    }).to.throw(ValidationError);
  });

  it('rejects a missing adapterKey', function () {
    expect(function () {
      return new Brand({key: 'asos', name: 'ASOS'});
    }).to.throw(ValidationError);
  });

  it('compares equal to another Brand with the same key', function () {
    var a = new Brand({key: 'asos', name: 'ASOS', adapterKey: 'rest-search'});
    var b = new Brand({key: 'asos', name: 'A Different Name', adapterKey: 'feed'});
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal to a Brand with a different key', function () {
    var a = new Brand({key: 'asos', name: 'ASOS', adapterKey: 'rest-search'});
    var b = new Brand({key: 'zalando', name: 'Zalando', adapterKey: 'rest-search'});
    expect(a.equals(b)).to.equal(false);
  });

  it('is not equal to non-Brand objects', function () {
    var a = new Brand({key: 'asos', name: 'ASOS', adapterKey: 'rest-search'});
    expect(a.equals({key: 'asos'})).to.equal(false);
  });
});
