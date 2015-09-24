'use strict';

var expect = require('chai').expect;
var ImageAsset = require('../../core/src/image-asset');
var ImageIdentity = require('../../core/src/image-identity');
var Url = require('../../core/src/url');
var ValidationError = require('../../core/src/errors').ValidationError;

function validFields() {
  return {
    id: 'img-1',
    identity: new ImageIdentity({url: new Url('http://example.com/a.jpg')}),
    renderedWidth: 800,
    renderedHeight: 600
  };
}

describe('ImageAsset', function () {
  it('exposes id, identity, and rendered dimensions', function () {
    var fields = validFields();
    var a = new ImageAsset(fields);
    expect(a.id).to.equal('img-1');
    expect(a.identity).to.equal(fields.identity);
    expect(a.renderedWidth).to.equal(800);
    expect(a.renderedHeight).to.equal(600);
    expect(a.workingCopyUrl).to.equal(null);
  });

  it('accepts an optional workingCopyUrl', function () {
    var fields = validFields();
    fields.workingCopyUrl = new Url('http://s3.example.com/cache/img-1.jpg');
    var a = new ImageAsset(fields);
    expect(a.workingCopyUrl).to.be.instanceof(Url);
  });

  it('rejects a missing fields object', function () {
    expect(function () { return new ImageAsset(); }).to.throw(ValidationError);
  });

  it('rejects a missing id', function () {
    var fields = validFields();
    delete fields.id;
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
  });

  it('rejects an empty id', function () {
    var fields = validFields();
    fields.id = '';
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
  });

  it('rejects a non-ImageIdentity identity', function () {
    var fields = validFields();
    fields.identity = {url: 'http://x'};
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
  });

  it('rejects non-positive rendered dimensions', function () {
    var fields = validFields();
    fields.renderedWidth = 0;
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
    fields.renderedWidth = 800;
    fields.renderedHeight = -1;
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
  });

  it('rejects non-integer rendered dimensions', function () {
    var fields = validFields();
    fields.renderedWidth = 800.5;
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
  });

  it('rejects a non-Url workingCopyUrl', function () {
    var fields = validFields();
    fields.workingCopyUrl = 'http://s3.example.com/cache/img-1.jpg';
    expect(function () { return new ImageAsset(fields); }).to.throw(ValidationError);
  });

  it('compares equal to another ImageAsset with the same id', function () {
    var a = new ImageAsset(validFields());
    var fields2 = validFields();
    fields2.renderedWidth = 1024;
    var b = new ImageAsset(fields2);
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal to an ImageAsset with a different id', function () {
    var a = new ImageAsset(validFields());
    var fields2 = validFields();
    fields2.id = 'img-2';
    var b = new ImageAsset(fields2);
    expect(a.equals(b)).to.equal(false);
  });

  it('is not equal to non-ImageAsset objects', function () {
    var a = new ImageAsset(validFields());
    expect(a.equals({id: 'img-1'})).to.equal(false);
  });
});
