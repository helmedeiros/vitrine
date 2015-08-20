'use strict';

var expect = require('chai').expect;
var configurator = require('../configurator/src/index');

describe('configurator entry', function () {
  it('exposes a version string', function () {
    expect(configurator).to.have.property('version');
    expect(configurator.version).to.be.a('string');
  });

  it('says hello', function () {
    expect(configurator.hello()).to.equal('vitrine-configurator');
  });
});
