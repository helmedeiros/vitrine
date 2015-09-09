'use strict';

var expect = require('chai').expect;
var ImageIdentity = require('../../core/src/image-identity');
var Url = require('../../core/src/url');
var DimensionsAndStem = require('../../core/src/dimensions-and-stem');
var PerceptualHash = require('../../core/src/perceptual-hash');
var SelectorPath = require('../../core/src/selector-path');

describe('ImageIdentity', function () {
  it('rejects a non-object signals argument', function () {
    expect(function () { return new ImageIdentity(null); }).to.throw();
    expect(function () { return new ImageIdentity(undefined); }).to.throw();
    expect(function () { return new ImageIdentity('not-an-object'); }).to.throw();
  });

  it('accepts an empty signals object', function () {
    var id = new ImageIdentity({});
    expect(id.url).to.equal(null);
    expect(id.dimensionsAndStem).to.equal(null);
    expect(id.perceptualHash).to.equal(null);
    expect(id.selectorPath).to.equal(null);
  });

  it('exposes the supplied signal value objects', function () {
    var id = new ImageIdentity({
      url: new Url('http://example.com/a.jpg'),
      dimensionsAndStem: new DimensionsAndStem(100, 200, 'a'),
      perceptualHash: new PerceptualHash('ff00'),
      selectorPath: new SelectorPath(['body'])
    });
    expect(id.url).to.be.instanceof(Url);
    expect(id.dimensionsAndStem).to.be.instanceof(DimensionsAndStem);
    expect(id.perceptualHash).to.be.instanceof(PerceptualHash);
    expect(id.selectorPath).to.be.instanceof(SelectorPath);
  });

  it('rejects signals of the wrong type', function () {
    expect(function () { return new ImageIdentity({url: 'http://...'}); }).to.throw();
    expect(function () { return new ImageIdentity({perceptualHash: 'ff00'}); }).to.throw();
    expect(function () {
      return new ImageIdentity({dimensionsAndStem: {naturalWidth: 1}});
    }).to.throw();
    expect(function () {
      return new ImageIdentity({selectorPath: 'body > img'});
    }).to.throw();
  });

  describe('has', function () {
    it('returns true when the signal is set', function () {
      var id = new ImageIdentity({url: new Url('http://example.com/')});
      expect(id.has('url')).to.equal(true);
    });

    it('returns false when the signal is missing', function () {
      var id = new ImageIdentity({});
      expect(id.has('url')).to.equal(false);
      expect(id.has('perceptualHash')).to.equal(false);
    });
  });

  describe('equals', function () {
    it('compares equal when all present signals match', function () {
      var a = new ImageIdentity({url: new Url('http://example.com/a')});
      var b = new ImageIdentity({url: new Url('http://example.com/a')});
      expect(a.equals(b)).to.equal(true);
    });

    it('compares equal when both are missing the same signals', function () {
      expect(new ImageIdentity({}).equals(new ImageIdentity({}))).to.equal(true);
    });

    it('does not compare equal when one has a signal and the other does not', function () {
      var a = new ImageIdentity({url: new Url('http://example.com/a')});
      var b = new ImageIdentity({});
      expect(a.equals(b)).to.equal(false);
      expect(b.equals(a)).to.equal(false);
    });

    it('does not compare equal when present signals differ', function () {
      var a = new ImageIdentity({url: new Url('http://example.com/a')});
      var b = new ImageIdentity({url: new Url('http://example.com/b')});
      expect(a.equals(b)).to.equal(false);
    });

    it('is not equal to non-ImageIdentity objects', function () {
      var a = new ImageIdentity({});
      expect(a.equals({})).to.equal(false);
    });
  });
});
