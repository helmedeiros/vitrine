'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var jsdom = require('jsdom');

var BUNDLE_PATH = path.resolve(__dirname, '../../configurator/dist/admin.js');

function loadBundle() {
  return fs.readFileSync(BUNDLE_PATH, 'utf8');
}

function encodePayload(payload) {
  return new Buffer(JSON.stringify(payload), 'utf8').toString('base64');
}

function withAdminPage(payloadImages, body, then) {
  var html = '<!doctype html><html><body>' +
    (body || '<div class="empty-state">load me</div>' +
      '<ul id="vitrine-image-list"></ul>' +
      '<div id="vitrine-editor"></div>') +
    '</body></html>';
  var url = 'http://admin/';
  if (payloadImages) {
    url += '#data=' + encodePayload({images: payloadImages});
  }
  jsdom.env({
    url: url,
    html: html,
    src: [loadBundle()],
    done: function (err, win) {
      if (err) { then(err); return; }
      then(null, win);
    }
  });
}

describe('admin bundle in jsdom', function () {
  before(function () {
    if (!fs.existsSync(BUNDLE_PATH)) {
      throw new Error('admin bundle missing — run grunt bundle first');
    }
  });

  it('exposes vitrineAdmin on the window', function (done) {
    withAdminPage(null, null, function (err, win) {
      if (err) { done(err); return; }
      expect(win.vitrineAdmin).to.be.an('object');
      expect(win.vitrineAdmin.bind).to.be.a('function');
      done();
    });
  });

  it('renders image cards from a hash payload', function (done) {
    withAdminPage([{src: 'http://x/a.jpg'}, {src: 'http://x/b.jpg'}], null,
      function (err, win) {
        if (err) { done(err); return; }
        var cards = win.document.querySelectorAll('.vitrine-image-card');
        expect(cards).to.have.length(2);
        done();
      });
  });

  it('mounts the editor view when a thumbnail is clicked', function (done) {
    withAdminPage([{src: 'http://x/a.jpg'}], null, function (err, win) {
      if (err) { done(err); return; }
      var card = win.document.querySelector('.vitrine-image-card');
      var click = win.document.createEvent('MouseEvents');
      click.initEvent('click', true, true);
      card.dispatchEvent(click);
      var editor = win.document.getElementById('vitrine-editor');
      var wrapper = editor.querySelector('.vitrine-editor-image-wrapper');
      expect(wrapper).to.not.equal(null);
      var image = wrapper.querySelector('img');
      expect(image.getAttribute('src')).to.equal('http://x/a.jpg');
      done();
    });
  });

  it('adds a region overlay after a drag on the editor overlay', function (done) {
    withAdminPage([{src: 'http://x/a.jpg'}], null, function (err, win) {
      if (err) { done(err); return; }
      var card = win.document.querySelector('.vitrine-image-card');
      var click = win.document.createEvent('MouseEvents');
      click.initEvent('click', true, true);
      card.dispatchEvent(click);
      var overlay = win.document.querySelector('.vitrine-editor-overlay');
      function mouseAt(type, clientX, clientY) {
        var event = win.document.createEvent('MouseEvents');
        event.initMouseEvent(type, true, true, win, 0,
          0, 0, clientX, clientY, false, false, false, false, 0, null);
        return event;
      }
      overlay.dispatchEvent(mouseAt('mousedown', 10, 20));
      overlay.dispatchEvent(mouseAt('mousemove', 110, 70));
      overlay.dispatchEvent(mouseAt('mouseup', 110, 70));
      var regions = win.document.querySelectorAll('[data-vitrine-region]');
      expect(regions.length).to.be.greaterThan(0);
      done();
    });
  });

  it('does not throw when loaded without any hash payload', function (done) {
    withAdminPage(null, null, function (err, win) {
      if (err) { done(err); return; }
      expect(win.document.querySelectorAll('.vitrine-image-card')).to.have.length(0);
      done();
    });
  });

  it('renders a region list row with a URL input after a drag', function (done) {
    var html = '<!doctype html><html><body>' +
      '<div class="empty-state">load me</div>' +
      '<ul id="vitrine-image-list"></ul>' +
      '<div id="vitrine-editor"></div>' +
      '<div id="vitrine-region-list"></div>' +
      '</body></html>';
    withAdminPage([{src: 'http://x/a.jpg'}], html, function (err, win) {
      if (err) { done(err); return; }
      var card = win.document.querySelector('.vitrine-image-card');
      var click = win.document.createEvent('MouseEvents');
      click.initEvent('click', true, true);
      card.dispatchEvent(click);
      var overlay = win.document.querySelector('.vitrine-editor-overlay');
      function mouseAt(type, x, y) {
        var event = win.document.createEvent('MouseEvents');
        event.initMouseEvent(type, true, true, win, 0,
          0, 0, x, y, false, false, false, false, 0, null);
        return event;
      }
      overlay.dispatchEvent(mouseAt('mousedown', 10, 20));
      overlay.dispatchEvent(mouseAt('mousemove', 110, 70));
      overlay.dispatchEvent(mouseAt('mouseup', 110, 70));
      var rows = win.document.querySelectorAll('.vitrine-region-row');
      expect(rows).to.have.length(1);
      var input = rows[0].querySelector('input[type="url"]');
      expect(input).to.not.equal(null);
      done();
    });
  });

  it('persists drawn regions to localStorage so admin reload keeps them',
    function (done) {
      var html = '<!doctype html><html><body>' +
        '<ul id="vitrine-image-list"></ul>' +
        '<div id="vitrine-editor"></div>' +
        '<div id="vitrine-region-list"></div>' +
        '</body></html>';
      var stubStorage = 'window.__store = {};' +
        'window.localStorage = {' +
          'getItem: function (k) { return window.__store[k] || null; },' +
          'setItem: function (k, v) { window.__store[k] = String(v); },' +
          'removeItem: function (k) { delete window.__store[k]; }' +
        '};';
      var payload = {pageUrl: 'http://host/article',
        images: [{src: 'http://x/a.jpg'}]};
      var encoded = encodePayload(payload);
      jsdom.env({
        url: 'http://admin/#data=' + encoded,
        html: html,
        src: [stubStorage, loadBundle()],
        done: function (err, win) {
          if (err) { done(err); return; }
          var card = win.document.querySelector('.vitrine-image-card');
          var click = win.document.createEvent('MouseEvents');
          click.initEvent('click', true, true);
          card.dispatchEvent(click);
          var overlay = win.document.querySelector('.vitrine-editor-overlay');
          function mouseAt(type, x, y) {
            var event = win.document.createEvent('MouseEvents');
            event.initMouseEvent(type, true, true, win, 0,
              0, 0, x, y, false, false, false, false, 0, null);
            return event;
          }
          overlay.dispatchEvent(mouseAt('mousedown', 10, 20));
          overlay.dispatchEvent(mouseAt('mousemove', 110, 70));
          overlay.dispatchEvent(mouseAt('mouseup', 110, 70));
          var stored = win.__store['vitrine-draft:http://host/article'];
          expect(stored).to.be.a('string');
          var draft = JSON.parse(stored);
          expect(draft.regionsByIndex[0]).to.have.length(1);
          done();
        }
      });
    });

  it('writes the VITRINE_CONFIG snippet to the export output when clicked',
    function (done) {
      var html = '<!doctype html><html><body>' +
        '<ul id="vitrine-image-list"></ul>' +
        '<div id="vitrine-editor"></div>' +
        '<div id="vitrine-region-list"></div>' +
        '<button id="vitrine-export-button">Generate</button>' +
        '<textarea id="vitrine-export-output"></textarea>' +
        '</body></html>';
      withAdminPage([{src: 'http://x/a.jpg'}], html, function (err, win) {
        if (err) { done(err); return; }
        var card = win.document.querySelector('.vitrine-image-card');
        var click = win.document.createEvent('MouseEvents');
        click.initEvent('click', true, true);
        card.dispatchEvent(click);
        var overlay = win.document.querySelector('.vitrine-editor-overlay');
        function mouseAt(type, x, y) {
          var event = win.document.createEvent('MouseEvents');
          event.initMouseEvent(type, true, true, win, 0,
            0, 0, x, y, false, false, false, false, 0, null);
          return event;
        }
        overlay.dispatchEvent(mouseAt('mousedown', 10, 20));
        overlay.dispatchEvent(mouseAt('mousemove', 110, 70));
        overlay.dispatchEvent(mouseAt('mouseup', 110, 70));
        var exportClick = win.document.createEvent('MouseEvents');
        exportClick.initEvent('click', true, true);
        win.document.getElementById('vitrine-export-button')
          .dispatchEvent(exportClick);
        var output = win.document.getElementById('vitrine-export-output').value;
        expect(output).to.contain('window.VITRINE_CONFIG');
        expect(output).to.contain('http://x/a.jpg');
        done();
      });
    });

  it('removes the region overlay and row when Remove is clicked', function (done) {
    var html = '<!doctype html><html><body>' +
      '<ul id="vitrine-image-list"></ul>' +
      '<div id="vitrine-editor"></div>' +
      '<div id="vitrine-region-list"></div>' +
      '</body></html>';
    withAdminPage([{src: 'http://x/a.jpg'}], html, function (err, win) {
      if (err) { done(err); return; }
      var card = win.document.querySelector('.vitrine-image-card');
      var click = win.document.createEvent('MouseEvents');
      click.initEvent('click', true, true);
      card.dispatchEvent(click);
      var overlay = win.document.querySelector('.vitrine-editor-overlay');
      function mouseAt(type, x, y) {
        var event = win.document.createEvent('MouseEvents');
        event.initMouseEvent(type, true, true, win, 0,
          0, 0, x, y, false, false, false, false, 0, null);
        return event;
      }
      overlay.dispatchEvent(mouseAt('mousedown', 10, 20));
      overlay.dispatchEvent(mouseAt('mousemove', 110, 70));
      overlay.dispatchEvent(mouseAt('mouseup', 110, 70));
      expect(win.document.querySelectorAll('[data-vitrine-region]')).to.have.length(1);
      var removeButton = win.document.querySelector('.vitrine-region-remove');
      var clickRemove = win.document.createEvent('MouseEvents');
      clickRemove.initEvent('click', true, true);
      removeButton.dispatchEvent(clickRemove);
      expect(win.document.querySelectorAll('[data-vitrine-region]')).to.have.length(0);
      expect(win.document.querySelectorAll('.vitrine-region-row')).to.have.length(0);
      done();
    });
  });
});
