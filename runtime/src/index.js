(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.vitrine = factory();
  }
}(this, function () {
  'use strict';

  return {
    version: '0.0.0'
  };
}));
