'use strict';

var expect = require('chai').expect;
var SelectorPath = require('../../core/src/selector-path');

describe('SelectorPath', function () {
  it('exposes the segment array and depth', function () {
    var s = new SelectorPath(['body', 'main', 'img.hero']);
    expect(s.segments).to.deep.equal(['body', 'main', 'img.hero']);
    expect(s.depth).to.equal(3);
  });

  it('rejects a non-array argument', function () {
    expect(function () { return new SelectorPath('body > main'); }).to.throw();
    expect(function () { return new SelectorPath(null); }).to.throw();
  });

  it('rejects an empty segment array', function () {
    expect(function () { return new SelectorPath([]); }).to.throw();
  });

  it('rejects segments that are not non-empty strings', function () {
    expect(function () { return new SelectorPath(['body', '', 'img']); }).to.throw();
    expect(function () { return new SelectorPath(['body', null, 'img']); }).to.throw();
  });

  it('renders to a CSS selector chain via toString', function () {
    expect(new SelectorPath(['body', 'main', 'img.hero']).toString())
      .to.equal('body > main > img.hero');
  });

  it('compares equal to another path with the same segments', function () {
    var a = new SelectorPath(['body', 'main', 'img']);
    var b = new SelectorPath(['body', 'main', 'img']);
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal to a path with different segments', function () {
    var a = new SelectorPath(['body', 'main', 'img']);
    var b = new SelectorPath(['body', 'aside', 'img']);
    expect(a.equals(b)).to.equal(false);
  });

  it('does not compare equal to a path with different depth', function () {
    var a = new SelectorPath(['body', 'main', 'img']);
    var b = new SelectorPath(['body', 'main']);
    expect(a.equals(b)).to.equal(false);
  });

  it('is not equal to non-SelectorPath objects', function () {
    var a = new SelectorPath(['body']);
    expect(a.equals({segments: ['body']})).to.equal(false);
  });

  it('protects against external mutation of its segment array', function () {
    var segments = ['body', 'main'];
    var s = new SelectorPath(segments);
    segments.push('img');
    expect(s.segments).to.have.length(2);
  });

  describe('parse', function () {
    it('parses a CSS selector chain into a SelectorPath', function () {
      var s = SelectorPath.parse('body > main > img.hero');
      expect(s.segments).to.deep.equal(['body', 'main', 'img.hero']);
    });

    it('trims whitespace around segments', function () {
      var s = SelectorPath.parse('body  >  main  >  img');
      expect(s.segments).to.deep.equal(['body', 'main', 'img']);
    });

    it('drops empty segments produced by adjacent separators', function () {
      var s = SelectorPath.parse('body >> main');
      expect(s.segments).to.deep.equal(['body', 'main']);
    });

    it('rejects an empty selector string', function () {
      expect(function () { return SelectorPath.parse(''); }).to.throw();
    });

    it('rejects a non-string selector argument', function () {
      expect(function () { return SelectorPath.parse(null); }).to.throw();
    });
  });
});
