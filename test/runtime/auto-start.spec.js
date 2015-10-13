'use strict';

var expect = require('chai').expect;
var autoStart = require('../../runtime/src/auto-start').autoStart;

function fakeBody() {
  return {
    appended: [],
    appendChild: function (child) { this.appended.push(child); }
  };
}

function fakeElement(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    style: {cssText: ''},
    textContent: '',
    href: '',
    target: '',
    appendChild: function (child) { this.children.push(child); }
  };
}

function fakeImg(src) {
  return {
    src: src,
    naturalWidth: 0,
    naturalHeight: 0,
    getBoundingClientRect: function () {
      return {left: 0, top: 0, width: 0, height: 0};
    }
  };
}

function fakeDocument(imgs, body) {
  return {
    getElementsByTagName: function (tagName) {
      return tagName === 'img' ? imgs : [];
    },
    createElement: function (tagName) { return fakeElement(tagName); },
    body: body || fakeBody()
  };
}

function fakeWindow(overrides) {
  var base = {
    VITRINE_CONFIG: undefined,
    location: {href: 'http://example.com/article'}
  };
  var key;
  if (overrides) {
    for (key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        base[key] = overrides[key];
      }
    }
  }
  return base;
}

describe('autoStart', function () {
  it('mounts the discovery panel when no config is present', function () {
    var body = fakeBody();
    var documentRef = fakeDocument(
      [fakeImg('http://example.com/a.jpg'), fakeImg('http://example.com/b.jpg')], body);
    var panel = autoStart(fakeWindow(), documentRef);
    expect(panel).to.not.equal(null);
    expect(body.appended).to.have.length(1);
  });

  it('returns null when a config object is already present', function () {
    var documentRef = fakeDocument([fakeImg('a')]);
    var win = fakeWindow({VITRINE_CONFIG: {images: []}});
    expect(autoStart(win, documentRef)).to.equal(null);
  });

  it('uses the default admin URL when none is supplied', function () {
    var body = fakeBody();
    var documentRef = fakeDocument([fakeImg('http://x/a.jpg')], body);
    autoStart(fakeWindow(), documentRef);
    var button = body.appended[0].children[1];
    expect(button.href.indexOf('https://helmedeiros.github.io/vitrine/admin/')).to.equal(0);
  });

  it('uses window.VITRINE_ADMIN_URL when set', function () {
    var body = fakeBody();
    var documentRef = fakeDocument([fakeImg('http://x/a.jpg')], body);
    var win = fakeWindow({VITRINE_ADMIN_URL: 'http://admin.local/'});
    autoStart(win, documentRef);
    var button = body.appended[0].children[1];
    expect(button.href.indexOf('http://admin.local/#data=')).to.equal(0);
  });

  it('accepts an explicit adminUrl option to override defaults', function () {
    var body = fakeBody();
    var documentRef = fakeDocument([fakeImg('http://x/a.jpg')], body);
    autoStart(fakeWindow(), documentRef, {adminUrl: 'http://override/'});
    var button = body.appended[0].children[1];
    expect(button.href.indexOf('http://override/#data=')).to.equal(0);
  });

  it('includes pageUrl in the encoded payload', function () {
    var body = fakeBody();
    var documentRef = fakeDocument([fakeImg('http://x/a.jpg')], body);
    var win = fakeWindow({location: {href: 'http://host.example.com/page'}});
    autoStart(win, documentRef);
    var button = body.appended[0].children[1];
    var encoded = button.href.split('#data=')[1];
    var decoded = JSON.parse(new Buffer(encoded, 'base64').toString('utf8'));
    expect(decoded.pageUrl).to.equal('http://host.example.com/page');
    expect(decoded.images).to.have.length(1);
  });
});
