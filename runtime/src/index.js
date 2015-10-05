(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['./runtime'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./runtime'));
  } else {
    root.vitrine = factory(root.vitrineRuntime);
  }
}(this, function (runtime) {
  'use strict';

  return runtime;
}));
