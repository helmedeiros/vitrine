'use strict';

var VALID_SCHEMES = ['http://', 'https://', 'mailto:', 'tel:'];

function isValidUrl(url) {
  if (typeof url !== 'string' || url.length === 0) {
    return false;
  }
  for (var i = 0; i < VALID_SCHEMES.length; i++) {
    if (url.indexOf(VALID_SCHEMES[i]) === 0) {
      return true;
    }
  }
  return false;
}

module.exports = {
  isValidUrl: isValidUrl
};
