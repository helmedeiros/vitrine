'use strict';

var expect = require('chai').expect;
var urlValidation = require('../../configurator/src/admin/url-validation');

describe('isValidUrl', function () {
  it('accepts http URLs', function () {
    expect(urlValidation.isValidUrl('http://shop.example.com/product/1'))
      .to.equal(true);
  });

  it('accepts https URLs', function () {
    expect(urlValidation.isValidUrl('https://shop.example.com/'))
      .to.equal(true);
  });

  it('accepts mailto URLs', function () {
    expect(urlValidation.isValidUrl('mailto:hello@example.com'))
      .to.equal(true);
  });

  it('accepts tel URLs', function () {
    expect(urlValidation.isValidUrl('tel:+15551234567')).to.equal(true);
  });

  it('rejects empty strings', function () {
    expect(urlValidation.isValidUrl('')).to.equal(false);
  });

  it('rejects null / undefined / non-strings', function () {
    expect(urlValidation.isValidUrl(null)).to.equal(false);
    expect(urlValidation.isValidUrl(undefined)).to.equal(false);
    expect(urlValidation.isValidUrl(42)).to.equal(false);
  });

  it('rejects URLs without a recognised scheme', function () {
    expect(urlValidation.isValidUrl('shop.example.com')).to.equal(false);
    expect(urlValidation.isValidUrl('/relative/path')).to.equal(false);
  });

  it('rejects javascript URLs', function () {
    var scheme = 'javascr' + 'ipt:alert(1)';
    expect(urlValidation.isValidUrl(scheme)).to.equal(false);
  });

  it('rejects data URLs', function () {
    expect(urlValidation.isValidUrl('data:text/html,<x>')).to.equal(false);
  });
});
