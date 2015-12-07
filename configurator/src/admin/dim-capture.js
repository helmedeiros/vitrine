'use strict';

function isReady(imageElement) {
  return imageElement.complete && imageElement.naturalWidth > 0;
}

function captureWhenReady(imageElement, callback) {
  if (!imageElement) {
    return;
  }
  if (isReady(imageElement)) {
    callback();
    return;
  }
  if (typeof imageElement.addEventListener !== 'function') {
    return;
  }
  imageElement.addEventListener('load', function () { callback(); });
}

module.exports = {
  captureWhenReady: captureWhenReady
};
