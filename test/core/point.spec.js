'use strict';

var expect = require('chai').expect;
var Point = require('../../core/src/point');

describe('Point', function () {
  it('exposes x and y coordinates', function () {
    var p = new Point(3, 4);
    expect(p.x).to.equal(3);
    expect(p.y).to.equal(4);
  });

  it('compares equal to another Point with same coordinates', function () {
    expect(new Point(1, 2).equals(new Point(1, 2))).to.equal(true);
    expect(new Point(1, 2).equals(new Point(1, 3))).to.equal(false);
  });

  it('is not equal to objects that are not Points', function () {
    expect(new Point(0, 0).equals({x: 0, y: 0})).to.equal(false);
  });

  it('translates by dx, dy returning a new Point', function () {
    var p = new Point(3, 4);
    var moved = p.translate(1, -2);
    expect(moved.x).to.equal(4);
    expect(moved.y).to.equal(2);
    expect(p.x).to.equal(3);
    expect(p.y).to.equal(4);
  });
});
