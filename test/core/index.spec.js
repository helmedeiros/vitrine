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
});
