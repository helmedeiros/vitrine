'use strict';

var expect = require('chai').expect;
var exportPanel = require('../../configurator/src/admin/export-panel');

function fakeElement(tagName) {
  var listeners = {};
  return {
    tagName: tagName.toUpperCase(),
    value: '',
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

function fakeDocument(button, output) {
  return {
    getElementById: function (id) {
      if (id === 'vitrine-export-button') { return button; }
      if (id === 'vitrine-export-output') { return output; }
      return null;
    }
  };
}

describe('attachExportButton', function () {
  it('writes the snippet to the output element on click', function () {
    var button = fakeElement('button');
    var output = fakeElement('textarea');
    var documentRef = fakeDocument(button, output);
    exportPanel.attachExportButton(documentRef, function () {
      return '<script>VITRINE</script>';
    });
    button.fire('click');
    expect(output.value).to.equal('<script>VITRINE</script>');
  });

  it('calls the snippet provider fresh each click', function () {
    var button = fakeElement('button');
    var output = fakeElement('textarea');
    var calls = 0;
    exportPanel.attachExportButton(fakeDocument(button, output), function () {
      calls++;
      return 'snippet ' + calls;
    });
    button.fire('click');
    button.fire('click');
    expect(calls).to.equal(2);
    expect(output.value).to.equal('snippet 2');
  });

  it('does nothing when the button is missing', function () {
    expect(function () {
      exportPanel.attachExportButton(fakeDocument(null, fakeElement('textarea')),
        function () { return ''; });
    }).to.not.throw();
  });

  it('does nothing when the output element is missing', function () {
    var button = fakeElement('button');
    exportPanel.attachExportButton(fakeDocument(button, null), function () {
      return 'snippet';
    });
    expect(function () { button.fire('click'); }).to.not.throw();
  });
});
