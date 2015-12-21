'use strict';

var counter = 0;

function defaultGenerator() {
  counter = counter + 1;
  var timeComponent = Date.now().toString(36);
  var randomComponent = Math.floor(Math.random() * 1000000).toString(36);
  return 'r-' + timeComponent + counter.toString(36) + '-' + randomComponent;
}

module.exports = {
  defaultGenerator: defaultGenerator
};
