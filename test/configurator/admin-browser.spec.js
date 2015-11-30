'use strict';

var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var jsdom = require('jsdom');

var SHELL_PATH = path.resolve(__dirname, '../../configurator/src/admin/admin-shell.js');
var SELECTION_PATH = path.resolve(__dirname,
  '../../configurator/src/admin/image-selection.js');

function readSource(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('admin modules in a browser context', function () {
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

  it('exposes vitrineImageSelection on window when loaded as a script',
    function (done) {
      jsdom.env({
        html: '<html><body></body></html>',
        src: [readSource(SELECTION_PATH)],
        done: function (err, win) {
          if (err) { done(err); return; }
          expect(win.vitrineImageSelection).to.be.an('object');
          expect(win.vitrineImageSelection.attachImageSelectionHandlers)
            .to.be.a('function');
          expect(win.vitrineImageSelection.markSelectedCard).to.be.a('function');
          expect(win.vitrineImageSelection.hideEmptyState).to.be.a('function');
          done();
        }
      });
    });
});
