'use strict';

function validateDocument(documentRef) {
  if (!documentRef || typeof documentRef.getElementsByTagName !== 'function') {
    throw new Error('scanImages requires a document with getElementsByTagName');
  }
}

function readBoundingRect(element) {
  if (typeof element.getBoundingClientRect !== 'function') {
    return null;
  }
  var rect = element.getBoundingClientRect();
  return {x: rect.left, y: rect.top, width: rect.width, height: rect.height};
}

function describeImage(img) {
  return {
    src: img.src,
    naturalWidth: typeof img.naturalWidth === 'number' ? img.naturalWidth : 0,
    naturalHeight: typeof img.naturalHeight === 'number' ? img.naturalHeight : 0,
    rect: readBoundingRect(img)
  };
}

function scanImages(documentRef) {
  validateDocument(documentRef);
  var imgs = documentRef.getElementsByTagName('img');
  var detected = [];
  for (var i = 0; i < imgs.length; i++) {
    detected.push(describeImage(imgs[i]));
  }
  return detected;
}

module.exports = scanImages;
