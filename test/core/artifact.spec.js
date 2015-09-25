'use strict';

var expect = require('chai').expect;
var Artifact = require('../../core/src/artifact');
var ImageAsset = require('../../core/src/image-asset');
var ImageIdentity = require('../../core/src/image-identity');
var Region = require('../../core/src/region');
var ProductBinding = require('../../core/src/product-binding');
var Url = require('../../core/src/url');
var Point = require('../../core/src/point');
var ValidationError = require('../../core/src/errors').ValidationError;

function sampleImageAsset() {
  return new ImageAsset({
    id: 'img-1',
    identity: new ImageIdentity({url: new Url('http://example.com/a.jpg')}),
    renderedWidth: 800,
    renderedHeight: 600
  });
}

function sampleRegion() {
  return new Region({id: 'r1', imageAssetId: 'img-1', geometry: new Point(10, 10)});
}

function sampleBinding() {
  return new ProductBinding({regionId: 'r1', kind: 'manual', url: 'http://x/'});
}

function validArtifactFields() {
  return {
    pageUrl: new Url('http://example.com/article/1'),
    version: 'v1',
    imageAssets: [sampleImageAsset()],
    regions: [sampleRegion()],
    bindings: [sampleBinding()],
    createdAt: 1440000000
  };
}

describe('Artifact', function () {
  it('exposes pageUrl, version, collections, and createdAt', function () {
    var fields = validArtifactFields();
    var a = new Artifact(fields);
    expect(a.pageUrl).to.equal(fields.pageUrl);
    expect(a.version).to.equal('v1');
    expect(a.imageAssets).to.have.length(1);
    expect(a.regions).to.have.length(1);
    expect(a.bindings).to.have.length(1);
    expect(a.createdAt).to.equal(1440000000);
  });

  it('rejects a missing fields object', function () {
    expect(function () { return new Artifact(); }).to.throw(ValidationError);
  });

  it('rejects a missing pageUrl', function () {
    var fields = validArtifactFields();
    delete fields.pageUrl;
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
  });

  it('rejects a non-Url pageUrl', function () {
    var fields = validArtifactFields();
    fields.pageUrl = 'http://example.com/';
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
  });

  it('rejects an empty version', function () {
    var fields = validArtifactFields();
    fields.version = '';
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
  });

  it('rejects a non-numeric createdAt', function () {
    var fields = validArtifactFields();
    fields.createdAt = '1440';
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
  });

  it('accepts empty collections', function () {
    var fields = validArtifactFields();
    fields.imageAssets = [];
    fields.regions = [];
    fields.bindings = [];
    var a = new Artifact(fields);
    expect(a.imageAssets).to.have.length(0);
  });

  it('rejects non-array collections', function () {
    var fields = validArtifactFields();
    fields.imageAssets = sampleImageAsset();
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
  });

  it('rejects collections containing wrong types', function () {
    var fields = validArtifactFields();
    fields.imageAssets = [sampleImageAsset(), {id: 'img-2'}];
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
    fields.imageAssets = [sampleImageAsset()];
    fields.regions = [{id: 'r2'}];
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
    fields.regions = [sampleRegion()];
    fields.bindings = [{regionId: 'r1'}];
    expect(function () { return new Artifact(fields); }).to.throw(ValidationError);
  });

  it('protects against external mutation of its collections', function () {
    var fields = validArtifactFields();
    var a = new Artifact(fields);
    fields.imageAssets.push(sampleImageAsset());
    fields.regions.push(sampleRegion());
    fields.bindings.push(sampleBinding());
    expect(a.imageAssets).to.have.length(1);
    expect(a.regions).to.have.length(1);
    expect(a.bindings).to.have.length(1);
  });

  describe('equality', function () {
    it('compares equal when pageUrl and version match', function () {
      var a = new Artifact(validArtifactFields());
      var b = new Artifact(validArtifactFields());
      expect(a.equals(b)).to.equal(true);
    });

    it('does not compare equal when pageUrl differs', function () {
      var a = new Artifact(validArtifactFields());
      var fields = validArtifactFields();
      fields.pageUrl = new Url('http://example.com/article/2');
      var b = new Artifact(fields);
      expect(a.equals(b)).to.equal(false);
    });

    it('does not compare equal when version differs', function () {
      var a = new Artifact(validArtifactFields());
      var fields = validArtifactFields();
      fields.version = 'v2';
      var b = new Artifact(fields);
      expect(a.equals(b)).to.equal(false);
    });

    it('is not equal to non-Artifact objects', function () {
      var a = new Artifact(validArtifactFields());
      expect(a.equals({pageUrl: a.pageUrl, version: a.version})).to.equal(false);
    });
  });
});
