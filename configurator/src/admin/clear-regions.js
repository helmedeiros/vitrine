'use strict';

function attachClearButton(documentRef, onClear) {
  var button = documentRef.getElementById('vitrine-clear-regions');
  if (!button) {
    return;
  }
  button.addEventListener('click', onClear);
}

module.exports = {
  attachClearButton: attachClearButton
};
