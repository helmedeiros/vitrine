'use strict';

var expect = require('chai').expect;
var matchIdentities = require('../../core/src/match-cascade');
var ImageIdentity = require('../../core/src/image-identity');
var Url = require('../../core/src/url');
var DimensionsAndStem = require('../../core/src/dimensions-and-stem');
var PerceptualHash = require('../../core/src/perceptual-hash');
var SelectorPath = require('../../core/src/selector-path');

describe('matchIdentities', function () {
  describe('exact url match', function () {
    it('returns confidence 1.0 when raw URLs are identical', function () {
      var raw = 'http://example.com/a.jpg?v=42';
      var configured = new ImageIdentity({url: new Url(raw)});
      var candidate = new ImageIdentity({url: new Url(raw)});
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(true);
      expect(result.confidence).to.equal(1.0);
      expect(result.via).to.equal('url');
    });
  });

  describe('normalised url match', function () {
    it('returns confidence 0.95 when normalised forms match but raw differs', function () {
      var configured = new ImageIdentity({url: new Url('http://example.com/a.jpg?v=42')});
      var candidate = new ImageIdentity({url: new Url('http://example.com/a.jpg?v=99')});
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(true);
      expect(result.confidence).to.equal(0.95);
      expect(result.via).to.equal('normalisedUrl');
    });
  });

  describe('dimensions-and-stem match', function () {
    it('returns confidence 0.85 when dims and stem match but URLs do not', function () {
      var configured = new ImageIdentity({
        url: new Url('http://example.com/a.jpg'),
        dimensionsAndStem: new DimensionsAndStem(800, 600, 'photo')
      });
      var candidate = new ImageIdentity({
        url: new Url('http://cdn.other.com/b.jpg'),
        dimensionsAndStem: new DimensionsAndStem(800, 600, 'photo')
      });
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(true);
      expect(result.confidence).to.equal(0.85);
      expect(result.via).to.equal('dimensionsAndStem');
    });

    it('does not match when both sides have dims and stem but they differ', function () {
      var configured = new ImageIdentity({
        dimensionsAndStem: new DimensionsAndStem(800, 600, 'photo')
      });
      var candidate = new ImageIdentity({
        dimensionsAndStem: new DimensionsAndStem(900, 600, 'photo')
      });
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(false);
    });
  });

  describe('perceptual hash match', function () {
    it('returns confidence 1.0 for identical hashes', function () {
      var hash = 'ffff0000ffff0000';
      var configured = new ImageIdentity({perceptualHash: new PerceptualHash(hash)});
      var candidate = new ImageIdentity({perceptualHash: new PerceptualHash(hash)});
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(true);
      expect(result.confidence).to.equal(1.0);
      expect(result.via).to.equal('perceptualHash');
    });

    it('matches with reduced confidence for similar but not identical hashes', function () {
      var configured = new ImageIdentity({
        perceptualHash: new PerceptualHash('ffff0000ffff0000')
      });
      var candidate = new ImageIdentity({
        perceptualHash: new PerceptualHash('ffff0000ffff0001')
      });
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(true);
      expect(result.confidence).to.be.lessThan(1.0);
      expect(result.confidence).to.be.greaterThan(0.95);
      expect(result.via).to.equal('perceptualHash');
    });

    it('does not match when Hamming distance exceeds threshold', function () {
      var configured = new ImageIdentity({
        perceptualHash: new PerceptualHash('ffffffffffffffff')
      });
      var candidate = new ImageIdentity({
        perceptualHash: new PerceptualHash('0000000000000000')
      });
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(false);
    });

    it('does not match when hashes have different bit lengths', function () {
      var configured = new ImageIdentity({perceptualHash: new PerceptualHash('ff')});
      var candidate = new ImageIdentity({perceptualHash: new PerceptualHash('ffff')});
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(false);
    });

    it('honours a custom perceptual threshold', function () {
      var configured = new ImageIdentity({perceptualHash: new PerceptualHash('ff')});
      var candidate = new ImageIdentity({perceptualHash: new PerceptualHash('fe')});
      var loose = matchIdentities(configured, candidate, {perceptualThreshold: 4});
      expect(loose.matched).to.equal(true);
      var strict = matchIdentities(configured, candidate, {perceptualThreshold: 0});
      expect(strict.matched).to.equal(false);
    });
  });

  describe('selector path match', function () {
    it('returns confidence 0.5 when selector paths match', function () {
      var configured = new ImageIdentity({
        selectorPath: new SelectorPath(['body', 'main', 'img.hero'])
      });
      var candidate = new ImageIdentity({
        selectorPath: new SelectorPath(['body', 'main', 'img.hero'])
      });
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(true);
      expect(result.confidence).to.equal(0.5);
      expect(result.via).to.equal('selectorPath');
    });

    it('does not match when both sides have selector paths but they differ', function () {
      var configured = new ImageIdentity({
        selectorPath: new SelectorPath(['body', 'img.hero'])
      });
      var candidate = new ImageIdentity({
        selectorPath: new SelectorPath(['body', 'img.banner'])
      });
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(false);
    });
  });

  describe('no match', function () {
    it('returns matched=false when nothing matches', function () {
      var configured = new ImageIdentity({url: new Url('http://example.com/a.jpg')});
      var candidate = new ImageIdentity({url: new Url('http://other.com/different.jpg')});
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(false);
      expect(result.confidence).to.equal(0);
      expect(result.via).to.equal(null);
    });

    it('returns matched=false when both identities have no signals', function () {
      var result = matchIdentities(new ImageIdentity({}), new ImageIdentity({}));
      expect(result.matched).to.equal(false);
    });

    it('falls through when only one side has a signal', function () {
      var configured = new ImageIdentity({url: new Url('http://example.com/a.jpg')});
      var candidate = new ImageIdentity({});
      var result = matchIdentities(configured, candidate);
      expect(result.matched).to.equal(false);
    });
  });

  describe('cascade ordering', function () {
    it('prefers the strongest matcher when multiple would match', function () {
      var raw = 'http://example.com/photo.jpg';
      var configured = new ImageIdentity({
        url: new Url(raw),
        dimensionsAndStem: new DimensionsAndStem(800, 600, 'photo'),
        selectorPath: new SelectorPath(['body', 'img'])
      });
      var candidate = new ImageIdentity({
        url: new Url(raw),
        dimensionsAndStem: new DimensionsAndStem(800, 600, 'photo'),
        selectorPath: new SelectorPath(['body', 'img'])
      });
      var result = matchIdentities(configured, candidate);
      expect(result.via).to.equal('url');
    });

    it('falls through to selector path when nothing stronger matches', function () {
      var configured = new ImageIdentity({
        url: new Url('http://example.com/a.jpg'),
        selectorPath: new SelectorPath(['body', 'img.hero'])
      });
      var candidate = new ImageIdentity({
        url: new Url('http://other.com/b.jpg'),
        selectorPath: new SelectorPath(['body', 'img.hero'])
      });
      var result = matchIdentities(configured, candidate);
      expect(result.via).to.equal('selectorPath');
    });
  });

  describe('argument validation', function () {
    it('throws when configured is not an ImageIdentity', function () {
      expect(function () {
        return matchIdentities({}, new ImageIdentity({}));
      }).to.throw();
    });

    it('throws when candidate is not an ImageIdentity', function () {
      expect(function () {
        return matchIdentities(new ImageIdentity({}), null);
      }).to.throw();
    });
  });
});
