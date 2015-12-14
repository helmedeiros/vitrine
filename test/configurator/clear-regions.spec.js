'use strict';

var expect = require('chai').expect;
var clearRegions = require('../../configurator/src/admin/clear-regions');

function fakeElement() {
  var listeners = {};
  return {
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

function fakeDocument(button) {
  return {
    getElementById: function (id) {
      return id === 'vitrine-clear-regions' ? button : null;
    }
  };
}

describe('attachClearButton', function () {
  it('invokes the callback on click', function () {
    var button = fakeElement();
    var calls = 0;
    clearRegions.attachClearButton(fakeDocument(button), function () { calls++; });
    button.fire('click');
    expect(calls).to.equal(1);
  });

  it('does nothing when the button is missing', function () {
    expect(function () {
      clearRegions.attachClearButton(fakeDocument(null), function () { return; });
    }).to.not.throw();
  });
});
