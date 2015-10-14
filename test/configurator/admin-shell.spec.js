'use strict';

var expect = require('chai').expect;
var adminShell = require('../../configurator/src/admin/admin-shell');

function encodeUtf8ToBase64(jsonString) {
  if (typeof Buffer !== 'undefined') {
    return new Buffer(jsonString, 'utf8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(jsonString)));
}

function fakeElement(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    textContent: '',
    src: '',
    className: '',
    style: {},
    appendChild: function (child) { this.children.push(child); },
    setAttribute: function (name, value) { this[name] = value; }
  };
}

function fakeListElement() {
  return fakeElement('ul');
}

function fakeDocument(listElement) {
  return {
    getElementById: function (id) {
      return id === 'vitrine-image-list' ? listElement : null;
    },
    createElement: function (tagName) {
      return fakeElement(tagName);
    }
  };
}

describe('readHashFragment', function () {
  it('returns null for an empty hash', function () {
    expect(adminShell.readHashFragment('')).to.equal(null);
    expect(adminShell.readHashFragment('#')).to.equal(null);
  });

  it('returns null for a hash without the data prefix', function () {
    expect(adminShell.readHashFragment('#other=abc')).to.equal(null);
  });

  it('returns null for non-string input', function () {
    expect(adminShell.readHashFragment()).to.equal(null);
    expect(adminShell.readHashFragment(null)).to.equal(null);
    expect(adminShell.readHashFragment(42)).to.equal(null);
  });

  it('returns the base64 fragment after #data=', function () {
    expect(adminShell.readHashFragment('#data=abc123')).to.equal('abc123');
  });
});

describe('decodePayload', function () {
  it('decodes a base64 JSON payload', function () {
    var payload = {images: [{src: 'a.jpg'}], pageUrl: 'http://example.com/'};
    var encoded = encodeUtf8ToBase64(JSON.stringify(payload));
    expect(adminShell.decodePayload(encoded)).to.deep.equal(payload);
  });

  it('preserves unicode in the payload', function () {
    var payload = {title: 'Olá — Porto • 2015'};
    var encoded = encodeUtf8ToBase64(JSON.stringify(payload));
    expect(adminShell.decodePayload(encoded).title).to.equal('Olá — Porto • 2015');
  });

  it('rejects an empty string', function () {
    expect(function () { return adminShell.decodePayload(''); }).to.throw();
  });

  it('rejects non-string input', function () {
    expect(function () { return adminShell.decodePayload(null); }).to.throw();
    expect(function () { return adminShell.decodePayload(123); }).to.throw();
  });

  it('falls back to Buffer decoding when atob is unavailable', function () {
    var payload = {a: 1};
    var encoded = encodeUtf8ToBase64(JSON.stringify(payload));
    var originalAtob = global.atob;
    global.atob = undefined;
    try {
      expect(adminShell.decodePayload(encoded)).to.deep.equal(payload);
    } finally {
      global.atob = originalAtob;
    }
  });
});

describe('renderImageList', function () {
  it('appends one image card per payload image', function () {
    var list = fakeListElement();
    var count = adminShell.renderImageList(fakeDocument(list), {
      images: [{src: 'http://a/1.jpg'}, {src: 'http://a/2.jpg'}]
    });
    expect(count).to.equal(2);
    expect(list.children).to.have.length(2);
  });

  it('builds a card with an image thumbnail and the URL as caption', function () {
    var list = fakeListElement();
    adminShell.renderImageList(fakeDocument(list), {
      images: [{src: 'http://example.com/photo.jpg'}]
    });
    var card = list.children[0];
    expect(card.tagName).to.equal('LI');
    expect(card.className).to.contain('vitrine-image-card');
    var thumb = card.children[0];
    expect(thumb.tagName).to.equal('IMG');
    expect(thumb.src).to.equal('http://example.com/photo.jpg');
    expect(thumb.className).to.contain('vitrine-image-thumb');
    var caption = card.children[1];
    expect(caption.tagName).to.equal('SPAN');
    expect(caption.textContent).to.equal('http://example.com/photo.jpg');
    expect(caption.className).to.contain('vitrine-image-url');
  });

  it('returns 0 and does nothing when the container is missing', function () {
    var documentRef = {
      getElementById: function () { return null; },
      createElement: function () { return null; }
    };
    var count = adminShell.renderImageList(documentRef, {images: [{src: 'a'}]});
    expect(count).to.equal(0);
  });

  it('returns 0 when the payload has no images array', function () {
    var list = fakeListElement();
    expect(adminShell.renderImageList(fakeDocument(list), {})).to.equal(0);
    expect(adminShell.renderImageList(fakeDocument(list), null)).to.equal(0);
  });

  it('honours a custom containerId option', function () {
    var list = fakeListElement();
    var documentRef = {
      getElementById: function (id) { return id === 'my-list' ? list : null; },
      createElement: function (tagName) { return fakeElement(tagName); }
    };
    var count = adminShell.renderImageList(documentRef,
      {images: [{src: 'a'}]}, {containerId: 'my-list'});
    expect(count).to.equal(1);
  });
});
