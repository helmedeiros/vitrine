'use strict';

var expect = require('chai').expect;
var Url = require('../../core/src/url');

describe('Url', function () {
  it('exposes the raw string', function () {
    var u = new Url('http://example.com/path');
    expect(u.raw).to.equal('http://example.com/path');
  });

  it('rejects non-string input', function () {
    expect(function () { return new Url(null); }).to.throw();
    expect(function () { return new Url(123); }).to.throw();
    expect(function () { return new Url(''); }).to.throw();
  });

  it('computes a normalised form on construction', function () {
    expect(new Url('http://example.com/path').normalised).to.equal('http://example.com/path');
  });

  describe('normalisation', function () {
    it('lowercases scheme and host', function () {
      expect(Url.normalise('HTTP://EXAMPLE.COM/Path')).to.equal('http://example.com/Path');
    });

    it('preserves path case', function () {
      expect(Url.normalise('http://example.com/CaseSensitivePath'))
        .to.equal('http://example.com/CaseSensitivePath');
    });

    it('strips the fragment', function () {
      expect(Url.normalise('http://example.com/a#frag')).to.equal('http://example.com/a');
    });

    it('strips known cache-bust query parameters', function () {
      expect(Url.normalise('http://example.com/a?v=123')).to.equal('http://example.com/a');
      expect(Url.normalise('http://example.com/a?t=1&size=large'))
        .to.equal('http://example.com/a?size=large');
    });

    it('sorts remaining query parameters alphabetically', function () {
      expect(Url.normalise('http://example.com/a?z=1&a=2'))
        .to.equal('http://example.com/a?a=2&z=1');
    });

    it('handles URLs with no query or fragment', function () {
      expect(Url.normalise('http://example.com/')).to.equal('http://example.com/');
    });

    it('handles a URL with only a fragment', function () {
      expect(Url.normalise('http://example.com/a#')).to.equal('http://example.com/a');
    });

    it('handles a URL with an empty query string', function () {
      expect(Url.normalise('http://example.com/a?')).to.equal('http://example.com/a');
    });

    it('returns scheme-less input unchanged in host case', function () {
      expect(Url.normalise('/just/a/path')).to.equal('/just/a/path');
    });
  });

  describe('equality', function () {
    it('compares equal when normalised forms match', function () {
      var a = new Url('http://example.com/a?v=1#frag');
      var b = new Url('HTTP://EXAMPLE.COM/a');
      expect(a.equals(b)).to.equal(true);
    });

    it('does not compare equal when normalised forms differ', function () {
      var a = new Url('http://example.com/a');
      var b = new Url('http://example.com/b');
      expect(a.equals(b)).to.equal(false);
    });

    it('is not equal to non-Url objects', function () {
      var a = new Url('http://example.com/');
      expect(a.equals({normalised: 'http://example.com/'})).to.equal(false);
    });
  });

  describe('toString', function () {
    it('returns the raw string', function () {
      expect(new Url('http://example.com/a').toString()).to.equal('http://example.com/a');
    });
  });
});
