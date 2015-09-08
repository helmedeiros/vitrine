'use strict';

var expect = require('chai').expect;
var PerceptualHash = require('../../core/src/perceptual-hash');

describe('PerceptualHash', function () {
  it('exposes the hex string and bit count', function () {
    var h = new PerceptualHash('ff00ff00ff00ff00');
    expect(h.hex).to.equal('ff00ff00ff00ff00');
    expect(h.bits).to.equal(64);
  });

  it('lowercases the hex on construction', function () {
    expect(new PerceptualHash('FF').hex).to.equal('ff');
  });

  it('rejects non-string input', function () {
    expect(function () { return new PerceptualHash(null); }).to.throw();
    expect(function () { return new PerceptualHash(123); }).to.throw();
  });

  it('rejects empty string', function () {
    expect(function () { return new PerceptualHash(''); }).to.throw();
  });

  it('rejects non-hex characters', function () {
    expect(function () { return new PerceptualHash('xyz'); }).to.throw();
    expect(function () { return new PerceptualHash('1g'); }).to.throw();
  });

  it('compares equal when hex strings match (case-insensitive)', function () {
    expect(new PerceptualHash('ABCD').equals(new PerceptualHash('abcd'))).to.equal(true);
  });

  it('is not equal to non-PerceptualHash objects', function () {
    expect(new PerceptualHash('ab').equals({hex: 'ab'})).to.equal(false);
  });

  describe('hammingDistance', function () {
    it('returns 0 for identical hashes', function () {
      expect(new PerceptualHash('ff00').hammingDistance(new PerceptualHash('ff00'))).to.equal(0);
    });

    it('returns the number of differing bits across all nibbles', function () {
      expect(new PerceptualHash('ff').hammingDistance(new PerceptualHash('00'))).to.equal(8);
      expect(new PerceptualHash('0').hammingDistance(new PerceptualHash('1'))).to.equal(1);
      expect(new PerceptualHash('0').hammingDistance(new PerceptualHash('f'))).to.equal(4);
      expect(new PerceptualHash('a').hammingDistance(new PerceptualHash('5'))).to.equal(4);
    });

    it('throws when comparing hashes of different lengths', function () {
      var a = new PerceptualHash('ab');
      var b = new PerceptualHash('abcd');
      expect(function () { return a.hammingDistance(b); }).to.throw();
    });

    it('throws when comparing against a non-PerceptualHash', function () {
      expect(function () {
        return new PerceptualHash('ab').hammingDistance('ab');
      }).to.throw();
    });
  });

  describe('similarTo', function () {
    it('returns true when Hamming distance is at or below threshold', function () {
      var a = new PerceptualHash('ff');
      var b = new PerceptualHash('fe');
      expect(a.similarTo(b, 1)).to.equal(true);
      expect(a.similarTo(b, 2)).to.equal(true);
    });

    it('returns false when Hamming distance exceeds threshold', function () {
      var a = new PerceptualHash('ff');
      var b = new PerceptualHash('00');
      expect(a.similarTo(b, 4)).to.equal(false);
    });
  });

  describe('toString', function () {
    it('returns the hex string', function () {
      expect(new PerceptualHash('abcd').toString()).to.equal('abcd');
    });
  });
});
