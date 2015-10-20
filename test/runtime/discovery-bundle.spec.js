'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var jsdom = require('jsdom');

var BUNDLE_PATH = path.resolve(__dirname, '../../runtime/dist/runtime.js');

function loadBundle() {
  return fs.readFileSync(BUNDLE_PATH, 'utf8');
}

function buildPageHtml(bodyMarkup, headMarkup) {
  return '<!doctype html><html><head>' + (headMarkup || '') +
    '</head><body>' + bodyMarkup + '</body></html>';
}

function runBundleInPage(pageHtml, bundleSource, callback) {
  jsdom.env({
    html: pageHtml,
    src: [bundleSource],
    done: function (err, win) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, win);
    }
  });
}

describe('runtime bundle in jsdom', function () {
  var bundle;

  before(function () {
    if (!fs.existsSync(BUNDLE_PATH)) {
      throw new Error('runtime bundle missing — run grunt bundle first');
    }
    bundle = loadBundle();
  });

  it('exposes a global vitrine object', function (done) {
    runBundleInPage(buildPageHtml(''), bundle, function (err, win) {
      if (err) { done(err); return; }
      expect(win.vitrine).to.be.an('object');
      expect(win.vitrine.detectMode).to.be.a('function');
      done();
    });
  });

  it('mounts a discovery panel on a page with images', function (done) {
    var body = '<img src="http://example.com/a.jpg">' +
      '<img src="http://example.com/b.jpg">';
    runBundleInPage(buildPageHtml(body), bundle, function (err, win) {
      if (err) { done(err); return; }
      var panels = win.document.querySelectorAll('[data-vitrine="discovery-panel"]');
      expect(panels).to.have.length(1);
      done();
    });
  });

  it('includes the image count in the panel label', function (done) {
    var body = '<img src="a"><img src="b"><img src="c">';
    runBundleInPage(buildPageHtml(body), bundle, function (err, win) {
      if (err) { done(err); return; }
      var panel = win.document.querySelector('[data-vitrine="discovery-panel"]');
      expect(panel.textContent).to.contain('3 images');
      done();
    });
  });

  it('sets the admin URL on the panel button with a #data fragment', function (done) {
    runBundleInPage(buildPageHtml('<img src="a">'), bundle, function (err, win) {
      if (err) { done(err); return; }
      var button = win.document.querySelector(
        '[data-vitrine="discovery-panel"] a');
      expect(button.href).to.contain('#data=');
      done();
    });
  });

  it('does not mount a panel when VITRINE_CONFIG is set', function (done) {
    var setConfig = 'window.VITRINE_CONFIG={images:[]};';
    jsdom.env({
      html: buildPageHtml('<img src="a">'),
      src: [setConfig, bundle],
      done: function (err, win) {
        if (err) { done(err); return; }
        var panels = win.document.querySelectorAll('[data-vitrine="discovery-panel"]');
        expect(panels).to.have.length(0);
        done();
      }
    });
  });

  it('does not throw when the page has no images', function (done) {
    runBundleInPage(buildPageHtml(''), bundle, function (err, win) {
      if (err) { done(err); return; }
      var panel = win.document.querySelector('[data-vitrine="discovery-panel"]');
      expect(panel).to.not.equal(null);
      expect(panel.textContent).to.contain('0 images');
      done();
    });
  });

  it('honours window.VITRINE_ADMIN_URL', function (done) {
    var setAdmin = 'window.VITRINE_ADMIN_URL="http://my-admin.local/edit/";';
    jsdom.env({
      html: buildPageHtml('<img src="a">'),
      src: [setAdmin, bundle],
      done: function (err, win) {
        if (err) { done(err); return; }
        var button = win.document.querySelector(
          '[data-vitrine="discovery-panel"] a');
        expect(button.href.indexOf('http://my-admin.local/edit/#data=')).to.equal(0);
        done();
      }
    });
  });
});
