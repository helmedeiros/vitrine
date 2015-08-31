'use strict';

var expect = require('chai').expect;
var Point = require('../../core/src/point');
var Polygon = require('../../core/src/polygon');

describe('Polygon', function () {
  it('exposes its vertices', function () {
    var p = new Polygon([new Point(0, 0), new Point(1, 0), new Point(0, 1)]);
    expect(p.vertices).to.have.length(3);
    expect(p.vertices[0].equals(new Point(0, 0))).to.equal(true);
  });

  it('requires at least three vertices', function () {
    expect(function () {
      return new Polygon([new Point(0, 0)]);
    }).to.throw();
    expect(function () {
      return new Polygon([new Point(0, 0), new Point(1, 1)]);
    }).to.throw();
  });

  it('contains a point inside the polygon', function () {
    var triangle = new Polygon([
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10)
    ]);
    expect(triangle.contains(new Point(5, 3))).to.equal(true);
  });

  it('does not contain a point outside the polygon', function () {
    var triangle = new Polygon([
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 10)
    ]);
    expect(triangle.contains(new Point(20, 20))).to.equal(false);
  });

  it('handles concave polygons correctly', function () {
    var concave = new Polygon([
      new Point(0, 0),
      new Point(10, 0),
      new Point(10, 10),
      new Point(5, 5),
      new Point(0, 10)
    ]);
    expect(concave.contains(new Point(5, 8))).to.equal(false);
    expect(concave.contains(new Point(2, 5))).to.equal(true);
  });

  it('compares equal to another Polygon with the same vertices in order', function () {
    var vertices = [new Point(0, 0), new Point(1, 0), new Point(0, 1)];
    var a = new Polygon(vertices);
    var b = new Polygon(vertices.slice());
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal to a polygon with different vertices', function () {
    var a = new Polygon([new Point(0, 0), new Point(1, 0), new Point(0, 1)]);
    var b = new Polygon([new Point(0, 0), new Point(2, 0), new Point(0, 1)]);
    expect(a.equals(b)).to.equal(false);
  });

  it('does not compare equal to a polygon with different vertex count', function () {
    var a = new Polygon([new Point(0, 0), new Point(1, 0), new Point(0, 1)]);
    var b = new Polygon([
      new Point(0, 0),
      new Point(1, 0),
      new Point(1, 1),
      new Point(0, 1)
    ]);
    expect(a.equals(b)).to.equal(false);
  });

  it('is not equal to non-polygons', function () {
    var a = new Polygon([new Point(0, 0), new Point(1, 0), new Point(0, 1)]);
    expect(a.equals({vertices: a.vertices})).to.equal(false);
  });

  it('protects against external mutation of its vertex array', function () {
    var vertices = [new Point(0, 0), new Point(1, 0), new Point(0, 1)];
    var p = new Polygon(vertices);
    vertices.push(new Point(2, 2));
    expect(p.vertices).to.have.length(3);
  });
});
