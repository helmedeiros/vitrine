'use strict';

var expect = require('chai').expect;
var DimensionsAndStem = require('../../core/src/dimensions-and-stem');

describe('DimensionsAndStem', function () {
  it('exposes naturalWidth, naturalHeight, and filenameStem', function () {
    var s = new DimensionsAndStem(800, 600, 'photo-1234');
    expect(s.naturalWidth).to.equal(800);
    expect(s.naturalHeight).to.equal(600);
    expect(s.filenameStem).to.equal('photo-1234');
  });

  it('rejects non-positive dimensions', function () {
    expect(function () { return new DimensionsAndStem(0, 100, 'a'); }).to.throw();
    expect(function () { return new DimensionsAndStem(100, 0, 'a'); }).to.throw();
    expect(function () { return new DimensionsAndStem(-1, 100, 'a'); }).to.throw();
  });

  it('rejects non-integer dimensions', function () {
    expect(function () { return new DimensionsAndStem(1.5, 100, 'a'); }).to.throw();
    expect(function () { return new DimensionsAndStem(100, 'abc', 'a'); }).to.throw();
  });

  it('rejects an empty or non-string filename stem', function () {
    expect(function () { return new DimensionsAndStem(100, 100, ''); }).to.throw();
    expect(function () { return new DimensionsAndStem(100, 100, null); }).to.throw();
  });

  it('compares equal when all three fields match', function () {
    var a = new DimensionsAndStem(800, 600, 'photo-1234');
    var b = new DimensionsAndStem(800, 600, 'photo-1234');
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal when any field differs', function () {
    var base = new DimensionsAndStem(800, 600, 'photo-1234');
    expect(base.equals(new DimensionsAndStem(801, 600, 'photo-1234'))).to.equal(false);
    expect(base.equals(new DimensionsAndStem(800, 601, 'photo-1234'))).to.equal(false);
    expect(base.equals(new DimensionsAndStem(800, 600, 'other'))).to.equal(false);
  });

  it('is not equal to non-DimensionsAndStem objects', function () {
    var a = new DimensionsAndStem(800, 600, 'photo-1234');
    expect(a.equals({naturalWidth: 800, naturalHeight: 600, filenameStem: 'photo-1234'}))
      .to.equal(false);
  });

  describe('fromUrl', function () {
    it('extracts the stem from a URL with an extension', function () {
      var s = DimensionsAndStem.fromUrl('https://cdn.example.com/img/photo-1234.jpg', 800, 600);
      expect(s.filenameStem).to.equal('photo-1234');
    });

    it('extracts the stem from a URL with no extension', function () {
      var s = DimensionsAndStem.fromUrl('https://cdn.example.com/img/photo-1234', 800, 600);
      expect(s.filenameStem).to.equal('photo-1234');
    });

    it('strips query string and fragment before extracting', function () {
      var s = DimensionsAndStem.fromUrl(
        'https://cdn.example.com/img/photo.jpg?v=42#anchor', 800, 600);
      expect(s.filenameStem).to.equal('photo');
    });

    it('handles a path with multiple dots in the basename', function () {
      var s = DimensionsAndStem.fromUrl(
        'https://cdn.example.com/photo.thumb.lg.jpg', 800, 600);
      expect(s.filenameStem).to.equal('photo.thumb.lg');
    });

    it('handles a URL with no slash', function () {
      var s = DimensionsAndStem.fromUrl('photo-1234.jpg', 800, 600);
      expect(s.filenameStem).to.equal('photo-1234');
    });
  });
});
