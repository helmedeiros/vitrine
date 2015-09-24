'use strict';

var expect = require('chai').expect;
var ProductBinding = require('../../core/src/product-binding');
var ValidationError = require('../../core/src/errors').ValidationError;

describe('ProductBinding', function () {
  it('rejects a missing fields object', function () {
    expect(function () { return new ProductBinding(); }).to.throw(ValidationError);
  });

  it('rejects an empty regionId', function () {
    expect(function () {
      return new ProductBinding({regionId: '', kind: 'manual', url: 'http://x/'});
    }).to.throw(ValidationError);
  });

  it('rejects an unknown kind', function () {
    expect(function () {
      return new ProductBinding({regionId: 'r1', kind: 'mystery'});
    }).to.throw(ValidationError);
  });

  describe('manual binding', function () {
    it('exposes regionId, kind, and url', function () {
      var b = new ProductBinding({
        regionId: 'r1',
        kind: 'manual',
        url: 'http://shop.example.com/p/42'
      });
      expect(b.regionId).to.equal('r1');
      expect(b.kind).to.equal('manual');
      expect(b.url).to.equal('http://shop.example.com/p/42');
      expect(b.catalogProductId).to.equal(null);
      expect(b.brandKey).to.equal(null);
    });

    it('rejects a manual binding without a url', function () {
      expect(function () {
        return new ProductBinding({regionId: 'r1', kind: 'manual'});
      }).to.throw(ValidationError);
    });

    it('rejects a manual binding with an empty url', function () {
      expect(function () {
        return new ProductBinding({regionId: 'r1', kind: 'manual', url: ''});
      }).to.throw(ValidationError);
    });
  });

  describe('catalog binding', function () {
    it('exposes regionId, kind, catalogProductId, and brandKey', function () {
      var b = new ProductBinding({
        regionId: 'r1',
        kind: 'catalog',
        catalogProductId: 'P-42',
        brandKey: 'asos'
      });
      expect(b.regionId).to.equal('r1');
      expect(b.kind).to.equal('catalog');
      expect(b.catalogProductId).to.equal('P-42');
      expect(b.brandKey).to.equal('asos');
      expect(b.url).to.equal(null);
    });

    it('rejects a catalog binding without a catalogProductId', function () {
      expect(function () {
        return new ProductBinding({regionId: 'r1', kind: 'catalog', brandKey: 'asos'});
      }).to.throw(ValidationError);
    });

    it('rejects a catalog binding without a brandKey', function () {
      expect(function () {
        return new ProductBinding({
          regionId: 'r1', kind: 'catalog', catalogProductId: 'P-42'
        });
      }).to.throw(ValidationError);
    });
  });

  describe('notes', function () {
    it('defaults to null when not provided', function () {
      var b = new ProductBinding({regionId: 'r1', kind: 'manual', url: 'http://x/'});
      expect(b.notes).to.equal(null);
    });

    it('exposes a non-empty notes string', function () {
      var b = new ProductBinding({
        regionId: 'r1', kind: 'manual', url: 'http://x/', notes: 'editor note'
      });
      expect(b.notes).to.equal('editor note');
    });

    it('treats empty notes as missing', function () {
      var b = new ProductBinding({
        regionId: 'r1', kind: 'manual', url: 'http://x/', notes: ''
      });
      expect(b.notes).to.equal(null);
    });
  });

  describe('equality', function () {
    it('compares equal to another ProductBinding with the same regionId', function () {
      var a = new ProductBinding({regionId: 'r1', kind: 'manual', url: 'http://x/'});
      var b = new ProductBinding({
        regionId: 'r1', kind: 'catalog', catalogProductId: 'p', brandKey: 'b'
      });
      expect(a.equals(b)).to.equal(true);
    });

    it('does not compare equal to a ProductBinding with a different regionId', function () {
      var a = new ProductBinding({regionId: 'r1', kind: 'manual', url: 'http://x/'});
      var b = new ProductBinding({regionId: 'r2', kind: 'manual', url: 'http://x/'});
      expect(a.equals(b)).to.equal(false);
    });

    it('is not equal to non-ProductBinding objects', function () {
      var a = new ProductBinding({regionId: 'r1', kind: 'manual', url: 'http://x/'});
      expect(a.equals({regionId: 'r1'})).to.equal(false);
    });
  });
});
