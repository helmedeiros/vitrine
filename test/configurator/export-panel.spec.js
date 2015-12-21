'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
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

describe('attachCopyButton', function () {
  function fakeCopyDocument(copyButton, output, executedCommands) {
    return {
      getElementById: function (id) {
        if (id === 'vitrine-copy-button') { return copyButton; }
        if (id === 'vitrine-export-output') { return output; }
        return null;
      },
      execCommand: function (name) {
        executedCommands.push(name);
        return true;
      }
    };
  }

  it('selects the textarea and runs the copy command on click', function () {
    var copyButton = fakeElement('button');
    var output = fakeElement('textarea');
    var selects = 0;
    output.select = function () { selects++; };
    var executed = [];
    exportPanel.attachCopyButton(fakeCopyDocument(copyButton, output, executed));
    copyButton.fire('click');
    expect(selects).to.equal(1);
    expect(executed).to.deep.equal(['copy']);
  });

  it('does nothing when the copy button is missing', function () {
    var output = fakeElement('textarea');
    var executed = [];
    expect(function () {
      exportPanel.attachCopyButton(fakeCopyDocument(null, output, executed));
    }).to.not.throw();
  });

  it('does nothing when the output is missing', function () {
    var copyButton = fakeElement('button');
    var executed = [];
    exportPanel.attachCopyButton(fakeCopyDocument(copyButton, null, executed));
    expect(function () { copyButton.fire('click'); }).to.not.throw();
  });

  it('survives a document without execCommand', function () {
    var copyButton = fakeElement('button');
    var output = fakeElement('textarea');
    output.select = function () { return; };
    var documentRef = {
      getElementById: function (id) {
        if (id === 'vitrine-copy-button') { return copyButton; }
        if (id === 'vitrine-export-output') { return output; }
        return null;
      }
    };
    exportPanel.attachCopyButton(documentRef);
    expect(function () { copyButton.fire('click'); }).to.not.throw();
  });

  it('flashes the Copied! label after a successful copy', function () {
    var clock = sinon.useFakeTimers();
    try {
      var copyButton = fakeElement('button');
      copyButton.textContent = 'Copy';
      var output = fakeElement('textarea');
      output.select = function () { return; };
      var executed = [];
      exportPanel.attachCopyButton(fakeCopyDocument(copyButton, output, executed));
      copyButton.fire('click');
      expect(copyButton.textContent).to.equal('Copied!');
      clock.tick(1500);
      expect(copyButton.textContent).to.equal('Copy');
    } finally {
      clock.restore();
    }
  });

  it('does not flash when execCommand reports failure', function () {
    var clock = sinon.useFakeTimers();
    try {
      var copyButton = fakeElement('button');
      copyButton.textContent = 'Copy';
      var output = fakeElement('textarea');
      output.select = function () { return; };
      var failingDocument = {
        getElementById: function (id) {
          if (id === 'vitrine-copy-button') { return copyButton; }
          if (id === 'vitrine-export-output') { return output; }
          return null;
        },
        execCommand: function () { return false; }
      };
      exportPanel.attachCopyButton(failingDocument);
      copyButton.fire('click');
      expect(copyButton.textContent).to.equal('Copy');
      clock.tick(2000);
      expect(copyButton.textContent).to.equal('Copy');
    } finally {
      clock.restore();
    }
  });
});

describe('setExportDisabled', function () {
  function fakeButton() {
    return {
      disabled: false,
      attributes: {},
      setAttribute: function (name, value) { this.attributes[name] = value; }
    };
  }

  function fakeDocument(button) {
    return {
      getElementById: function (id) {
        return id === 'vitrine-export-button' ? button : null;
      }
    };
  }

  it('disables the export button and sets a tooltip when invalid', function () {
    var button = fakeButton();
    exportPanel.setExportDisabled(fakeDocument(button), true, 'Some URLs invalid');
    expect(button.disabled).to.equal(true);
    expect(button.attributes.title).to.equal('Some URLs invalid');
  });

  it('enables the export button and clears the tooltip when valid', function () {
    var button = fakeButton();
    button.disabled = true;
    button.attributes.title = 'old';
    exportPanel.setExportDisabled(fakeDocument(button), false);
    expect(button.disabled).to.equal(false);
    expect(button.attributes.title).to.equal('');
  });

  it('is a no-op when the button is missing', function () {
    expect(function () {
      exportPanel.setExportDisabled(fakeDocument(null), true);
    }).to.not.throw();
  });
});
