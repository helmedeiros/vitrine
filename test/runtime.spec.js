'use strict';

var expect = require('chai').expect;
var vitrine = require('../runtime/src/index');

describe('runtime entry', function () {
  it('exposes a version string', function () {
    expect(vitrine).to.have.property('version');
    expect(vitrine.version).to.be.a('string');
  });

  describe('detectMode', function () {
    it('returns discovery when no config is supplied', function () {
      expect(vitrine.detectMode()).to.equal('discovery');
      expect(vitrine.detectMode(undefined)).to.equal('discovery');
      expect(vitrine.detectMode(null)).to.equal('discovery');
    });

    it('returns discovery for non-object configs', function () {
      expect(vitrine.detectMode('a string')).to.equal('discovery');
      expect(vitrine.detectMode(42)).to.equal('discovery');
      expect(vitrine.detectMode(false)).to.equal('discovery');
    });

    it('returns config when given any object', function () {
      expect(vitrine.detectMode({})).to.equal('config');
      expect(vitrine.detectMode({images: []})).to.equal('config');
    });
  });

  describe('boot', function () {
    it('reports discovery mode when no config is present', function () {
      expect(vitrine.boot().mode).to.equal('discovery');
    });

    it('reports config mode when a config object is present', function () {
      expect(vitrine.boot({images: []}).mode).to.equal('config');
    });
  });
});
