'use strict';

var expect = require('chai').expect;
var handoff = require('../../runtime/src/admin-handoff');

function decodeBase64Utf8(b64) {
  if (typeof Buffer !== 'undefined') {
    return new Buffer(b64, 'base64').toString('utf8');
  }
  return decodeURIComponent(escape(atob(b64)));
}

describe('encodePayload', function () {
  it('returns a non-empty base64 string for a simple payload', function () {
    var encoded = handoff.encodePayload({a: 1});
    expect(encoded).to.be.a('string');
    expect(encoded.length).to.be.greaterThan(0);
  });

  it('round-trips through base64 to the original JSON', function () {
    var payload = {pageUrl: 'http://example.com/', images: [{src: 'a.jpg'}]};
    var decoded = JSON.parse(decodeBase64Utf8(handoff.encodePayload(payload)));
    expect(decoded).to.deep.equal(payload);
  });

  it('preserves unicode characters', function () {
    var payload = {title: 'Olá — Porto • 2015'};
    var decoded = JSON.parse(decodeBase64Utf8(handoff.encodePayload(payload)));
    expect(decoded.title).to.equal('Olá — Porto • 2015');
  });

  it('uses the Buffer fallback when btoa is unavailable', function () {
    var originalBtoa = global.btoa;
    global.btoa = undefined;
    try {
      var encoded = handoff.encodePayload({a: 1});
      expect(JSON.parse(decodeBase64Utf8(encoded))).to.deep.equal({a: 1});
    } finally {
      global.btoa = originalBtoa;
    }
  });
});

describe('buildAdminUrl', function () {
  it('appends a hash fragment with the encoded payload', function () {
    var url = handoff.buildAdminUrl('http://admin.example.com/', {a: 1});
    expect(url.indexOf('http://admin.example.com/#data=')).to.equal(0);
    var encoded = url.split('#data=')[1];
    expect(JSON.parse(decodeBase64Utf8(encoded))).to.deep.equal({a: 1});
  });

  it('rejects a missing admin URL', function () {
    expect(function () { return handoff.buildAdminUrl('', {a: 1}); }).to.throw();
    expect(function () { return handoff.buildAdminUrl(null, {a: 1}); }).to.throw();
  });

  it('rejects a missing payload', function () {
    expect(function () {
      return handoff.buildAdminUrl('http://admin/');
    }).to.throw();
  });
});
