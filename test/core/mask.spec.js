'use strict';

var expect = require('chai').expect;
var Point = require('../../core/src/point');
var Mask = require('../../core/src/mask');

describe('Mask', function () {
  it('exposes width and height', function () {
    var m = new Mask(4, 3);
    expect(m.width).to.equal(4);
    expect(m.height).to.equal(3);
  });

  it('requires positive width and height', function () {
    expect(function () { return new Mask(0, 5); }).to.throw();
    expect(function () { return new Mask(5, 0); }).to.throw();
    expect(function () { return new Mask(-1, 5); }).to.throw();
  });

  it('rejects data that does not match width times height', function () {
    expect(function () { return new Mask(2, 2, [1]); }).to.throw();
    expect(function () { return new Mask(2, 2, [1, 0, 1, 0, 1]); }).to.throw();
  });

  it('starts empty by default', function () {
    var m = new Mask(2, 2);
    expect(m.coverage()).to.equal(0);
    expect(m.contains(new Point(0, 0))).to.equal(false);
  });

  it('paints a pixel returning a new Mask', function () {
    var original = new Mask(2, 2);
    var painted = original.paint(new Point(0, 0), true);
    expect(painted).to.not.equal(original);
    expect(painted.contains(new Point(0, 0))).to.equal(true);
    expect(original.contains(new Point(0, 0))).to.equal(false);
  });

  it('clears a pixel by painting false', function () {
    var m = new Mask(2, 2, [1, 1, 1, 1]).paint(new Point(0, 0), false);
    expect(m.contains(new Point(0, 0))).to.equal(false);
    expect(m.contains(new Point(1, 0))).to.equal(true);
  });

  it('returns false for points outside its bounds', function () {
    var m = new Mask(2, 2, [1, 1, 1, 1]);
    expect(m.contains(new Point(-1, 0))).to.equal(false);
    expect(m.contains(new Point(2, 0))).to.equal(false);
    expect(m.contains(new Point(0, -1))).to.equal(false);
    expect(m.contains(new Point(0, 2))).to.equal(false);
  });

  it('ignores paint calls outside its bounds', function () {
    var m = new Mask(2, 2).paint(new Point(5, 5), true);
    expect(m.coverage()).to.equal(0);
  });

  it('computes coverage as the fraction of painted pixels', function () {
    expect(new Mask(2, 2, [1, 1, 0, 0]).coverage()).to.equal(0.5);
    expect(new Mask(2, 2, [1, 1, 1, 1]).coverage()).to.equal(1);
    expect(new Mask(2, 2, [0, 0, 0, 0]).coverage()).to.equal(0);
  });

  it('compares equal to another Mask with same dimensions and pixels', function () {
    expect(new Mask(2, 2, [1, 0, 0, 1]).equals(new Mask(2, 2, [1, 0, 0, 1]))).to.equal(true);
    expect(new Mask(2, 2, [1, 0, 0, 1]).equals(new Mask(2, 2, [1, 0, 0, 0]))).to.equal(false);
  });

  it('is not equal to a Mask of different dimensions', function () {
    expect(new Mask(2, 2).equals(new Mask(2, 3))).to.equal(false);
  });

  it('is not equal to non-Mask objects', function () {
    expect(new Mask(1, 1, [1]).equals({width: 1, height: 1, data: [1]})).to.equal(false);
  });

  it('protects against external mutation of its data array', function () {
    var data = [1, 0, 0, 1];
    var m = new Mask(2, 2, data);
    data[0] = 0;
    expect(m.contains(new Point(0, 0))).to.equal(true);
  });
});
