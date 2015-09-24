'use strict';

var expect = require('chai').expect;
var Page = require('../../core/src/page');
var Url = require('../../core/src/url');
var ValidationError = require('../../core/src/errors').ValidationError;

describe('Page', function () {
  it('exposes url and ingestedAt', function () {
    var url = new Url('http://example.com/article/1');
    var p = new Page({url: url, ingestedAt: 1440000000});
    expect(p.url).to.equal(url);
    expect(p.ingestedAt).to.equal(1440000000);
  });

  it('rejects a missing fields object', function () {
    expect(function () { return new Page(); }).to.throw(ValidationError);
    expect(function () { return new Page(null); }).to.throw(ValidationError);
  });

  it('rejects a missing or wrong-typed url', function () {
    expect(function () {
      return new Page({ingestedAt: 1});
    }).to.throw(ValidationError);
    expect(function () {
      return new Page({url: 'http://example.com/', ingestedAt: 1});
    }).to.throw(ValidationError);
  });

  it('rejects a missing or non-number ingestedAt', function () {
    var url = new Url('http://example.com/');
    expect(function () { return new Page({url: url}); }).to.throw(ValidationError);
    expect(function () {
      return new Page({url: url, ingestedAt: '1440'});
    }).to.throw(ValidationError);
  });

  it('compares equal to another Page with the same url', function () {
    var a = new Page({url: new Url('http://example.com/a'), ingestedAt: 1});
    var b = new Page({url: new Url('http://example.com/a'), ingestedAt: 999});
    expect(a.equals(b)).to.equal(true);
  });

  it('does not compare equal to a Page with a different url', function () {
    var a = new Page({url: new Url('http://example.com/a'), ingestedAt: 1});
    var b = new Page({url: new Url('http://example.com/b'), ingestedAt: 1});
    expect(a.equals(b)).to.equal(false);
  });

  it('is not equal to non-Page objects', function () {
    var a = new Page({url: new Url('http://example.com/a'), ingestedAt: 1});
    expect(a.equals({url: a.url, ingestedAt: 1})).to.equal(false);
  });
});
