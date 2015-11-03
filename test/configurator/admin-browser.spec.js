'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var jsdom = require('jsdom');

var SHELL_PATH = path.resolve(__dirname, '../../configurator/src/admin/admin-shell.js');
var BOOTSTRAP_PATH = path.resolve(__dirname,
  '../../configurator/src/admin/admin-bootstrap.js');

function readSource(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function encodePayload(payload) {
  return new Buffer(JSON.stringify(payload), 'utf8').toString('base64');
}

describe('admin shell in a browser context', function () {
  it('exposes vitrineAdminShell on window when loaded as a script', function (done) {
    jsdom.env({
      html: '<html><body></body></html>',
      src: [readSource(SHELL_PATH)],
      done: function (err, win) {
        if (err) { done(err); return; }
        expect(win.vitrineAdminShell).to.be.an('object');
        expect(win.vitrineAdminShell.readHashFragment).to.be.a('function');
        expect(win.vitrineAdminShell.decodePayload).to.be.a('function');
        expect(win.vitrineAdminShell.renderImageList).to.be.a('function');
        done();
      }
    });
  });
});

describe('admin bootstrap end-to-end in jsdom', function () {
  it('renders image cards when loaded with a hash payload', function (done) {
    var encoded = encodePayload({
      pageUrl: 'http://host.example.com/',
      images: [
        {src: 'http://host.example.com/a.jpg'},
        {src: 'http://host.example.com/b.jpg'}
      ]
    });
    jsdom.env({
      url: 'http://admin/#data=' + encoded,
      html: '<!doctype html><html><body>' +
        '<ul id="vitrine-image-list"></ul></body></html>',
      src: [readSource(SHELL_PATH), readSource(BOOTSTRAP_PATH)],
      done: function (err, win) {
        if (err) { done(err); return; }
        var cards = win.document.querySelectorAll('.vitrine-image-card');
        expect(cards).to.have.length(2);
        done();
      }
    });
  });

  it('renders nothing when there is no hash payload', function (done) {
    jsdom.env({
      url: 'http://admin/',
      html: '<!doctype html><html><body>' +
        '<ul id="vitrine-image-list"></ul></body></html>',
      src: [readSource(SHELL_PATH), readSource(BOOTSTRAP_PATH)],
      done: function (err, win) {
        if (err) { done(err); return; }
        var cards = win.document.querySelectorAll('.vitrine-image-card');
        expect(cards).to.have.length(0);
        done();
      }
    });
  });

  it('builds a card with image thumbnail and url caption end-to-end', function (done) {
    var encoded = encodePayload({images: [{src: 'http://x.com/photo.jpg'}]});
    jsdom.env({
      url: 'http://admin/#data=' + encoded,
      html: '<!doctype html><html><body>' +
        '<ul id="vitrine-image-list"></ul></body></html>',
      src: [readSource(SHELL_PATH), readSource(BOOTSTRAP_PATH)],
      done: function (err, win) {
        if (err) { done(err); return; }
        var card = win.document.querySelector('.vitrine-image-card');
        var thumb = card.querySelector('.vitrine-image-thumb');
        var caption = card.querySelector('.vitrine-image-url');
        expect(thumb.getAttribute('src')).to.equal('http://x.com/photo.jpg');
        expect(caption.textContent).to.equal('http://x.com/photo.jpg');
        done();
      }
    });
  });
});
