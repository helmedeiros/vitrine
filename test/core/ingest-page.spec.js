'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var ingestPage = require('../../core/src/ingest-page');
var Page = require('../../core/src/page');
var ImageAsset = require('../../core/src/image-asset');
var ImageIdentity = require('../../core/src/image-identity');
var Url = require('../../core/src/url');
var ValidationError = require('../../core/src/errors').ValidationError;

function fakeDetection(overrides) {
  var base = {
    id: 'img-1',
    identity: new ImageIdentity({url: new Url('http://example.com/a.jpg')}),
    renderedWidth: 800,
    renderedHeight: 600
  };
  if (overrides) {
    for (var key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        base[key] = overrides[key];
      }
    }
  }
  return base;
}

function fakePageFetcher(detections) {
  return {
    fetch: sinon.stub().returns({detections: detections || []})
  };
}

describe('ingestPage', function () {
  it('returns a Page and an ImageAsset for each detection', function () {
    var deps = {pageFetcher: fakePageFetcher([fakeDetection(), fakeDetection({id: 'img-2'})])};
    var result = ingestPage(deps, {
      pageUrl: new Url('http://example.com/article'),
      now: 1440000000
    });
    expect(result.page).to.be.instanceof(Page);
    expect(result.page.ingestedAt).to.equal(1440000000);
    expect(result.imageAssets).to.have.length(2);
    expect(result.imageAssets[0]).to.be.instanceof(ImageAsset);
  });

  it('passes the page url to the fetcher', function () {
    var deps = {pageFetcher: fakePageFetcher([])};
    var pageUrl = new Url('http://example.com/');
    ingestPage(deps, {pageUrl: pageUrl, now: 1});
    expect(deps.pageFetcher.fetch.calledWith(pageUrl)).to.equal(true);
  });

  it('returns an empty asset list when no detections are produced', function () {
    var deps = {pageFetcher: fakePageFetcher([])};
    var result = ingestPage(deps, {pageUrl: new Url('http://example.com/'), now: 1});
    expect(result.imageAssets).to.have.length(0);
  });

  it('tolerates a fetcher response without a detections field', function () {
    var deps = {pageFetcher: {fetch: sinon.stub().returns({})}};
    var result = ingestPage(deps, {pageUrl: new Url('http://example.com/'), now: 1});
    expect(result.imageAssets).to.have.length(0);
  });

  it('preserves the workingCopyUrl from a detection', function () {
    var copy = new Url('http://s3.example.com/working/img-1.jpg');
    var deps = {pageFetcher: fakePageFetcher([fakeDetection({workingCopyUrl: copy})])};
    var result = ingestPage(deps, {pageUrl: new Url('http://example.com/'), now: 1});
    expect(result.imageAssets[0].workingCopyUrl).to.equal(copy);
  });

  it('rejects missing deps or pageFetcher', function () {
    expect(function () {
      return ingestPage(null, {pageUrl: new Url('http://x/'), now: 1});
    }).to.throw(ValidationError);
    expect(function () {
      return ingestPage({}, {pageUrl: new Url('http://x/'), now: 1});
    }).to.throw(ValidationError);
  });

  it('rejects a missing or wrong-typed pageUrl', function () {
    var deps = {pageFetcher: fakePageFetcher([])};
    expect(function () { return ingestPage(deps, {now: 1}); }).to.throw(ValidationError);
    expect(function () {
      return ingestPage(deps, {pageUrl: 'http://x/', now: 1});
    }).to.throw(ValidationError);
  });

  it('rejects a missing or non-numeric now', function () {
    var deps = {pageFetcher: fakePageFetcher([])};
    expect(function () {
      return ingestPage(deps, {pageUrl: new Url('http://x/')});
    }).to.throw(ValidationError);
    expect(function () {
      return ingestPage(deps, {pageUrl: new Url('http://x/'), now: 'soon'});
    }).to.throw(ValidationError);
  });
});
