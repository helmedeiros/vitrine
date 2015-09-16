'use strict';

var expect = require('chai').expect;
var resolveLink = require('../../core/src/link-resolver');

describe('resolveLink', function () {
  it('rejects a non-object binding', function () {
    expect(function () { return resolveLink(null); }).to.throw();
    expect(function () { return resolveLink('manual'); }).to.throw();
  });

  it('rejects a binding without a kind', function () {
    expect(function () { return resolveLink({}); }).to.throw();
    expect(function () { return resolveLink({url: 'http://example.com/'}); }).to.throw();
  });

  it('rejects a binding of unknown kind', function () {
    expect(function () {
      return resolveLink({kind: 'mysterious'});
    }).to.throw(/no resolver strategy/i);
  });

  describe('manual strategy', function () {
    it('returns the url from a manual binding', function () {
      var result = resolveLink({kind: 'manual', url: 'http://example.com/product'});
      expect(result.url).to.equal('http://example.com/product');
      expect(result.kind).to.equal('manual');
    });

    it('rejects a manual binding without a url', function () {
      expect(function () { return resolveLink({kind: 'manual'}); }).to.throw();
    });

    it('rejects a manual binding with an empty url', function () {
      expect(function () { return resolveLink({kind: 'manual', url: ''}); }).to.throw();
    });

    it('rejects a manual binding with a non-string url', function () {
      expect(function () { return resolveLink({kind: 'manual', url: 42}); }).to.throw();
    });
  });

  describe('catalog strategy', function () {
    it('throws not-yet-implemented for catalog bindings', function () {
      expect(function () {
        return resolveLink({kind: 'catalog', productId: 'p1', brandKey: 'b1'});
      }).to.throw(/not yet implemented/i);
    });
  });
});
