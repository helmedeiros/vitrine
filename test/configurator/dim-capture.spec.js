'use strict';

var expect = require('chai').expect;
var dimCapture = require('../../configurator/src/admin/dim-capture');

function fakeImage(options) {
  var opts = options || {};
  var listeners = {};
  return {
    complete: opts.complete || false,
    naturalWidth: opts.naturalWidth || 0,
    naturalHeight: opts.naturalHeight || 0,
    addEventListener: function (event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    fire: function (event) {
      var bound = listeners[event] || [];
      for (var i = 0; i < bound.length; i++) {
        bound[i]();
      }
    }
  };
}

describe('captureWhenReady', function () {
  it('invokes the callback immediately when the image is already loaded',
    function () {
      var calls = 0;
      var image = fakeImage({complete: true, naturalWidth: 520});
      dimCapture.captureWhenReady(image, function () { calls++; });
      expect(calls).to.equal(1);
    });

  it('defers the callback until the load event fires for an unloaded image',
    function () {
      var calls = 0;
      var image = fakeImage({complete: false});
      dimCapture.captureWhenReady(image, function () { calls++; });
      expect(calls).to.equal(0);
      image.fire('load');
      expect(calls).to.equal(1);
    });

  it('treats complete-but-zero-natural-width as not loaded', function () {
    var calls = 0;
    var image = fakeImage({complete: true, naturalWidth: 0});
    dimCapture.captureWhenReady(image, function () { calls++; });
    expect(calls).to.equal(0);
    image.fire('load');
    expect(calls).to.equal(1);
  });

  it('does nothing when given no image', function () {
    expect(function () {
      dimCapture.captureWhenReady(null, function () { return; });
    }).to.not.throw();
  });

  it('does nothing when the image has no addEventListener', function () {
    var brokenImage = {complete: false};
    expect(function () {
      dimCapture.captureWhenReady(brokenImage, function () { return; });
    }).to.not.throw();
  });
});
