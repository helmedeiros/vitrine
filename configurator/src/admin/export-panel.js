'use strict';

var BUTTON_ID = 'vitrine-export-button';
var OUTPUT_ID = 'vitrine-export-output';

function attachExportButton(documentRef, getSnippet) {
  var button = documentRef.getElementById(BUTTON_ID);
  if (!button) {
    return;
  }
  button.addEventListener('click', function () {
    var output = documentRef.getElementById(OUTPUT_ID);
    if (output) {
      output.value = getSnippet();
    }
  });
}

function flashCopiedLabel(button) {
  var originalLabel = button.textContent;
  button.textContent = 'Copied!';
  if (typeof setTimeout === 'function') {
    setTimeout(function () { button.textContent = originalLabel; }, 1200);
  }
}

function attachCopyButton(documentRef) {
  var button = documentRef.getElementById('vitrine-copy-button');
  if (!button) {
    return;
  }
  button.addEventListener('click', function () {
    var output = documentRef.getElementById(OUTPUT_ID);
    if (!output) {
      return;
    }
    if (typeof output.select === 'function') {
      output.select();
    }
    if (typeof documentRef.execCommand !== 'function') {
      return;
    }
    var success = documentRef.execCommand('copy');
    if (success) {
      flashCopiedLabel(button);
    }
  });
}

function setExportDisabled(documentRef, disabled, reason) {
  var button = documentRef.getElementById(BUTTON_ID);
  if (!button) {
    return;
  }
  button.disabled = Boolean(disabled);
  if (typeof button.setAttribute === 'function') {
    if (disabled) {
      button.setAttribute('title', reason || 'Export is disabled');
    } else {
      button.setAttribute('title', '');
    }
  }
}

module.exports = {
  attachExportButton: attachExportButton,
  attachCopyButton: attachCopyButton,
  setExportDisabled: setExportDisabled,
  BUTTON_ID: BUTTON_ID,
  OUTPUT_ID: OUTPUT_ID
};
