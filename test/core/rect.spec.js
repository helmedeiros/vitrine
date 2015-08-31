'use strict';

var expect = require('chai').expect;
var Point = require('../../core/src/point');
var Rect = require('../../core/src/rect');

describe('Rect', function () {
  it('exposes x, y, width, height', function () {
    var r = new Rect(10, 20, 30, 40);
    expect(r.x).to.equal(10);
    expect(r.y).to.equal(20);
    expect(r.width).to.equal(30);
    expect(r.height).to.equal(40);
  });

  it('computes its area', function () {
    expect(new Rect(0, 0, 4, 5).area()).to.equal(20);
  });

  it('contains a point inside its bounds', function () {
    var r = new Rect(0, 0, 10, 10);
    expect(r.contains(new Point(5, 5))).to.equal(true);
  });

  it('does not contain a point outside its bounds', function () {
    var r = new Rect(0, 0, 10, 10);
    expect(r.contains(new Point(15, 5))).to.equal(false);
    expect(r.contains(new Point(5, -1))).to.equal(false);
  });

  it('treats edges as inside', function () {
    var r = new Rect(0, 0, 10, 10);
    expect(r.contains(new Point(0, 0))).to.equal(true);
    expect(r.contains(new Point(10, 10))).to.equal(true);
  });

  it('intersects with overlapping rects', function () {
    expect(new Rect(0, 0, 10, 10).intersects(new Rect(5, 5, 10, 10))).to.equal(true);
  });

  it('does not intersect with disjoint rects', function () {
    expect(new Rect(0, 0, 10, 10).intersects(new Rect(20, 20, 5, 5))).to.equal(false);
  });

  it('treats touching edges as intersecting', function () {
    expect(new Rect(0, 0, 10, 10).intersects(new Rect(10, 0, 5, 10))).to.equal(true);
  });

  it('compares equal to another Rect with the same fields', function () {
    expect(new Rect(1, 2, 3, 4).equals(new Rect(1, 2, 3, 4))).to.equal(true);
    expect(new Rect(1, 2, 3, 4).equals(new Rect(1, 2, 3, 5))).to.equal(false);
  });

  it('is not equal to objects that are not Rects', function () {
    expect(new Rect(0, 0, 1, 1).equals({x: 0, y: 0, width: 1, height: 1})).to.equal(false);
  });
});
