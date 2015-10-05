'use strict';

var expect = require('chai').expect;
var scanImages = require('../../runtime/src/image-scanner');

function fakeImg(props) {
  var p = props || {};
  return {
    src: p.src || '',
    naturalWidth: typeof p.naturalWidth === 'number' ? p.naturalWidth : 0,
    naturalHeight: typeof p.naturalHeight === 'number' ? p.naturalHeight : 0,
    getBoundingClientRect: function () {
      return p.rect || {left: 0, top: 0, width: 0, height: 0};
    }
  };
}

function fakeDocument(imgs) {
  return {
    getElementsByTagName: function (tagName) {
      if (tagName === 'img') {
        return imgs;
      }
      return [];
    }
  };
}

describe('scanImages', function () {
  it('returns an empty array for a document with no images', function () {
    expect(scanImages(fakeDocument([]))).to.deep.equal([]);
  });

  it('returns one descriptor per <img> element', function () {
    var doc = fakeDocument([
      fakeImg({src: 'http://example.com/a.jpg'}),
      fakeImg({src: 'http://example.com/b.jpg'})
    ]);
    var result = scanImages(doc);
    expect(result).to.have.length(2);
    expect(result[0].src).to.equal('http://example.com/a.jpg');
    expect(result[1].src).to.equal('http://example.com/b.jpg');
  });

  it('captures natural dimensions when available', function () {
    var doc = fakeDocument([
      fakeImg({src: 'http://example.com/a.jpg', naturalWidth: 800, naturalHeight: 600})
    ]);
    var result = scanImages(doc);
    expect(result[0].naturalWidth).to.equal(800);
    expect(result[0].naturalHeight).to.equal(600);
  });

  it('defaults natural dimensions to zero when missing', function () {
    var img = {src: 'http://example.com/a.jpg', getBoundingClientRect: function () {
      return {left: 0, top: 0, width: 0, height: 0};
    }};
    var result = scanImages(fakeDocument([img]));
    expect(result[0].naturalWidth).to.equal(0);
    expect(result[0].naturalHeight).to.equal(0);
  });

  it('captures bounding rect when getBoundingClientRect is available', function () {
    var doc = fakeDocument([
      fakeImg({src: 'a', rect: {left: 100, top: 200, width: 300, height: 400}})
    ]);
    var result = scanImages(doc);
    expect(result[0].rect).to.deep.equal({x: 100, y: 200, width: 300, height: 400});
  });

  it('reports a null rect when getBoundingClientRect is unavailable', function () {
    var img = {src: 'a', naturalWidth: 0, naturalHeight: 0};
    var result = scanImages(fakeDocument([img]));
    expect(result[0].rect).to.equal(null);
  });

  it('throws when given no document', function () {
    expect(function () { return scanImages(); }).to.throw();
    expect(function () { return scanImages(null); }).to.throw();
  });

  it('throws when given an object without getElementsByTagName', function () {
    expect(function () { return scanImages({}); }).to.throw();
  });
});
