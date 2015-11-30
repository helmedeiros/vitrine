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
    if (typeof documentRef.execCommand === 'function') {
      documentRef.execCommand('copy');
    }
  });
}

module.exports = {
  attachExportButton: attachExportButton,
  attachCopyButton: attachCopyButton,
  BUTTON_ID: BUTTON_ID,
  OUTPUT_ID: OUTPUT_ID
};
