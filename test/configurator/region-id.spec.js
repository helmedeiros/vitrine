'use strict';

var expect = require('chai').expect;
var regionId = require('../../configurator/src/admin/region-id');

var ID_PATTERN = /^r-[a-z0-9]+-[a-z0-9]+$/;

describe('defaultGenerator', function () {
  it('returns a string matching the r-time-random pattern', function () {
    expect(regionId.defaultGenerator()).to.match(ID_PATTERN);
  });

  it('returns distinct IDs across many calls', function () {
    var ids = {};
    for (var i = 0; i < 200; i++) {
      ids[regionId.defaultGenerator()] = true;
    }
    expect(Object.keys(ids).length).to.equal(200);
  });

  it('keeps the same shape no matter when it is called', function () {
    expect(regionId.defaultGenerator()).to.match(ID_PATTERN);
    expect(regionId.defaultGenerator()).to.match(ID_PATTERN);
    expect(regionId.defaultGenerator()).to.match(ID_PATTERN);
  });
});
