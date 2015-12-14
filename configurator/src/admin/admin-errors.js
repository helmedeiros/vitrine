'use strict';

var ERROR_ELEMENT_ID = 'vitrine-error';

function findErrorElement(documentRef) {
  return documentRef.getElementById(ERROR_ELEMENT_ID);
}

function showError(documentRef, message) {
  var element = findErrorElement(documentRef);
  if (!element) {
    return;
  }
  element.textContent = message;
  if (element.style) {
    element.style.display = 'block';
  }
}

function hideError(documentRef) {
  var element = findErrorElement(documentRef);
  if (!element || !element.style) {
    return;
  }
  element.style.display = 'none';
}

module.exports = {
  showError: showError,
  hideError: hideError,
  ERROR_ELEMENT_ID: ERROR_ELEMENT_ID
};
