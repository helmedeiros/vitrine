'use strict';

var expect = require('chai').expect;
var autoStartModule = require('../../runtime/src/auto-start');
var autoStart = autoStartModule.autoStart;
var bind = autoStartModule.bind;

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
    attributes: {},
    appendChild: function (child) { this.children.push(child); },
    setAttribute: function (name, value) { this.attributes[name] = value; }
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
  var listeners = {};
  var base = {
    VITRINE_CONFIG: undefined,
    location: {href: 'http://example.com/article'},
    addEventListener: function (name, handler) {
      listeners[name] = listeners[name] || [];
      listeners[name].push(handler);
    },
    fireEvent: function (name) {
      var bound = listeners[name] || [];
      for (var i = 0; i < bound.length; i++) {
        bound[i]();
      }
    }
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

function fakeDocumentWithReadyState(state, imgs, body) {
  var doc = fakeDocument(imgs, body);
  doc.readyState = state;
  return doc;
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

describe('bind', function () {
  it('runs autoStart immediately when document is complete', function () {
    var body = fakeBody();
    var documentRef = fakeDocumentWithReadyState('complete',
      [fakeImg('http://x/a.jpg')], body);
    var win = fakeWindow();
    var result = bind(win, documentRef);
    expect(result).to.not.equal(null);
    expect(body.appended).to.have.length(1);
  });

  it('defers autoStart until the load event when document is not complete', function () {
    var body = fakeBody();
    var documentRef = fakeDocumentWithReadyState('interactive',
      [fakeImg('http://x/a.jpg')], body);
    var win = fakeWindow();
    var result = bind(win, documentRef);
    expect(result).to.equal(null);
    expect(body.appended).to.have.length(0);
    win.fireEvent('load');
    expect(body.appended).to.have.length(1);
  });

  it('defers autoStart on the loading state too', function () {
    var body = fakeBody();
    var documentRef = fakeDocumentWithReadyState('loading',
      [fakeImg('http://x/a.jpg')], body);
    var win = fakeWindow();
    bind(win, documentRef);
    expect(body.appended).to.have.length(0);
    win.fireEvent('load');
    expect(body.appended).to.have.length(1);
  });

  it('forwards options through to autoStart on deferred runs', function () {
    var body = fakeBody();
    var documentRef = fakeDocumentWithReadyState('interactive',
      [fakeImg('http://x/a.jpg')], body);
    var win = fakeWindow();
    bind(win, documentRef, {adminUrl: 'http://deferred/'});
    win.fireEvent('load');
    var button = body.appended[0].children[1];
    expect(button.href.indexOf('http://deferred/#data=')).to.equal(0);
  });
});
