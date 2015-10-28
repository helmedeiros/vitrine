'use strict';

var expect = require('chai').expect;
var rectangleFromDrag = require('../../configurator/src/admin/drag-rectangle');

describe('rectangleFromDrag', function () {
  it('builds a rect from top-left to bottom-right', function () {
    var rect = rectangleFromDrag({x: 10, y: 20}, {x: 110, y: 70});
    expect(rect).to.deep.equal({x: 10, y: 20, width: 100, height: 50});
  });

  it('normalises a reverse drag from bottom-right to top-left', function () {
    var rect = rectangleFromDrag({x: 110, y: 70}, {x: 10, y: 20});
    expect(rect).to.deep.equal({x: 10, y: 20, width: 100, height: 50});
  });

  it('normalises a drag with one axis reversed', function () {
    var rect = rectangleFromDrag({x: 10, y: 70}, {x: 110, y: 20});
    expect(rect).to.deep.equal({x: 10, y: 20, width: 100, height: 50});
  });

  it('returns a zero-size rect when start and current are the same', function () {
    var rect = rectangleFromDrag({x: 50, y: 50}, {x: 50, y: 50});
    expect(rect).to.deep.equal({x: 50, y: 50, width: 0, height: 0});
  });

  describe('with bounds', function () {
    var bounds = {width: 200, height: 100};

    it('clamps a drag that escapes to the right', function () {
      var rect = rectangleFromDrag({x: 10, y: 10}, {x: 999, y: 50}, bounds);
      expect(rect.x).to.equal(10);
      expect(rect.x + rect.width).to.equal(200);
    });

    it('clamps a drag that escapes below', function () {
      var rect = rectangleFromDrag({x: 10, y: 10}, {x: 50, y: 999}, bounds);
      expect(rect.y).to.equal(10);
      expect(rect.y + rect.height).to.equal(100);
    });

    it('clamps a drag that starts negative', function () {
      var rect = rectangleFromDrag({x: -50, y: -30}, {x: 50, y: 30}, bounds);
      expect(rect.x).to.equal(0);
      expect(rect.y).to.equal(0);
      expect(rect.width).to.equal(50);
      expect(rect.height).to.equal(30);
    });
  });

  it('rejects missing start point', function () {
    expect(function () { return rectangleFromDrag(null, {x: 1, y: 1}); }).to.throw();
  });

  it('rejects missing current point', function () {
    expect(function () { return rectangleFromDrag({x: 1, y: 1}, null); }).to.throw();
  });

  it('rejects non-numeric coordinates', function () {
    expect(function () {
      return rectangleFromDrag({x: 'a', y: 0}, {x: 1, y: 1});
    }).to.throw();
    expect(function () {
      return rectangleFromDrag({x: 0, y: 0}, {x: 1, y: NaN});
    }).to.throw();
  });
});
