'use strict';

var expect = require('chai').expect;
var vitrine = require('../runtime/src/index');

describe('runtime entry', function () {
  it('exposes a version string', function () {
    expect(vitrine).to.have.property('version');
    expect(vitrine.version).to.be.a('string');
  });
});
