'use strict';

var expect = require('chai').expect;
var core = require('../../core/src/index');

describe('core module', function () {
  it('exposes the Point value object', function () {
    expect(core.Point).to.be.a('function');
    expect(new core.Point(3, 4).x).to.equal(3);
  });

  it('exposes the Rect value object', function () {
    expect(core.Rect).to.be.a('function');
    expect(new core.Rect(0, 0, 4, 5).area()).to.equal(20);
  });

  it('exposes the Polygon value object', function () {
    expect(core.Polygon).to.be.a('function');
    var triangle = new core.Polygon([
      new core.Point(0, 0),
      new core.Point(10, 0),
      new core.Point(5, 10)
    ]);
    expect(triangle.contains(new core.Point(5, 3))).to.equal(true);
  });

  it('exposes the Mask value object', function () {
    expect(core.Mask).to.be.a('function');
    expect(new core.Mask(1, 1).coverage()).to.equal(0);
  });

  it('exposes the Url value object', function () {
    expect(core.Url).to.be.a('function');
    expect(new core.Url('http://example.com/').normalised).to.equal('http://example.com/');
  });

  it('exposes the DimensionsAndStem identity signal', function () {
    expect(core.DimensionsAndStem).to.be.a('function');
    expect(new core.DimensionsAndStem(100, 200, 'a').filenameStem).to.equal('a');
  });

  it('exposes the PerceptualHash identity signal', function () {
    expect(core.PerceptualHash).to.be.a('function');
    expect(new core.PerceptualHash('ff').bits).to.equal(8);
  });

  it('exposes the SelectorPath identity signal', function () {
    expect(core.SelectorPath).to.be.a('function');
    expect(new core.SelectorPath(['body']).depth).to.equal(1);
  });

  it('exposes the ImageIdentity aggregate', function () {
    expect(core.ImageIdentity).to.be.a('function');
    expect(new core.ImageIdentity({}).has('url')).to.equal(false);
  });

  it('exposes the matchIdentities cascade function', function () {
    expect(core.matchIdentities).to.be.a('function');
    var empty = new core.ImageIdentity({});
    expect(core.matchIdentities(empty, empty).matched).to.equal(false);
  });

  it('exposes the resolveLink function', function () {
    expect(core.resolveLink).to.be.a('function');
    var resolved = core.resolveLink({kind: 'manual', url: 'http://example.com/'});
    expect(resolved.url).to.equal('http://example.com/');
  });

  it('exposes the Funnel state machine', function () {
    expect(core.Funnel).to.be.a('function');
    expect(new core.Funnel().state).to.equal('initial');
  });

  it('exposes the DomainError type', function () {
    expect(core.DomainError).to.be.a('function');
    expect(new core.DomainError('x')).to.be.instanceof(Error);
  });

  it('exposes the ValidationError type', function () {
    expect(core.ValidationError).to.be.a('function');
    expect(new core.ValidationError('x', 'field')).to.be.instanceof(core.DomainError);
  });

  it('exposes the Brand entity', function () {
    expect(core.Brand).to.be.a('function');
    var b = new core.Brand({key: 'asos', name: 'ASOS', adapterKey: 'rest'});
    expect(b.key).to.equal('asos');
  });

  it('exposes the Page entity', function () {
    expect(core.Page).to.be.a('function');
    var p = new core.Page({url: new core.Url('http://example.com/'), ingestedAt: 1});
    expect(p.ingestedAt).to.equal(1);
  });

  it('exposes the ImageAsset entity', function () {
    expect(core.ImageAsset).to.be.a('function');
    var a = new core.ImageAsset({
      id: 'img-1',
      identity: new core.ImageIdentity({}),
      renderedWidth: 100,
      renderedHeight: 100
    });
    expect(a.id).to.equal('img-1');
  });

  it('exposes the Region entity', function () {
    expect(core.Region).to.be.a('function');
    var r = new core.Region({
      id: 'r1',
      imageAssetId: 'img-1',
      geometry: new core.Rect(0, 0, 10, 10)
    });
    expect(r.geometryKind).to.equal('rect');
  });
});
