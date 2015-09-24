'use strict';

var expect = require('chai').expect;
var Region = require('../../core/src/region');
var Point = require('../../core/src/point');
var Rect = require('../../core/src/rect');
var Polygon = require('../../core/src/polygon');
var Mask = require('../../core/src/mask');
var ValidationError = require('../../core/src/errors').ValidationError;

describe('Region', function () {
  it('exposes id, imageAssetId, geometry, and geometryKind', function () {
    var rect = new Rect(0, 0, 100, 100);
    var r = new Region({id: 'r1', imageAssetId: 'img-1', geometry: rect});
    expect(r.id).to.equal('r1');
    expect(r.imageAssetId).to.equal('img-1');
    expect(r.geometry).to.equal(rect);
    expect(r.geometryKind).to.equal('rect');
  });

  it('infers point geometryKind from a Point geometry', function () {
    var r = new Region({id: 'r1', imageAssetId: 'img-1', geometry: new Point(5, 5)});
    expect(r.geometryKind).to.equal('point');
  });

  it('infers polygon geometryKind from a Polygon geometry', function () {
    var poly = new Polygon([new Point(0, 0), new Point(10, 0), new Point(0, 10)]);
    var r = new Region({id: 'r1', imageAssetId: 'img-1', geometry: poly});
    expect(r.geometryKind).to.equal('polygon');
  });

  it('infers mask geometryKind from a Mask geometry', function () {
    var r = new Region({id: 'r1', imageAssetId: 'img-1', geometry: new Mask(4, 4)});
    expect(r.geometryKind).to.equal('mask');
  });

  it('rejects a missing fields object', function () {
    expect(function () { return new Region(); }).to.throw(ValidationError);
  });

  it('rejects an empty id', function () {
    expect(function () {
      return new Region({id: '', imageAssetId: 'img-1', geometry: new Point(0, 0)});
    }).to.throw(ValidationError);
  });

  it('rejects an empty imageAssetId', function () {
    expect(function () {
      return new Region({id: 'r1', imageAssetId: '', geometry: new Point(0, 0)});
    }).to.throw(ValidationError);
  });

  it('rejects geometry that is not Point, Rect, Polygon, or Mask', function () {
    expect(function () {
      return new Region({id: 'r1', imageAssetId: 'img-1', geometry: {x: 1, y: 2}});
    }).to.throw(ValidationError);
    expect(function () {
      return new Region({id: 'r1', imageAssetId: 'img-1', geometry: null});
    }).to.throw(ValidationError);
  });

  it('compares equal to another Region with the same id', function () {
    var a = new Region({id: 'r1', imageAssetId: 'img-1', geometry: new Point(0, 0)});
    var b = new Region({id: 'r1', imageAssetId: 'img-other', geometry: new Point(5, 5)});
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal to a Region with a different id', function () {
    var a = new Region({id: 'r1', imageAssetId: 'img-1', geometry: new Point(0, 0)});
    var b = new Region({id: 'r2', imageAssetId: 'img-1', geometry: new Point(0, 0)});
    expect(a.equals(b)).to.equal(false);
  });

  it('is not equal to non-Region objects', function () {
    var a = new Region({id: 'r1', imageAssetId: 'img-1', geometry: new Point(0, 0)});
    expect(a.equals({id: 'r1'})).to.equal(false);
  });
});
