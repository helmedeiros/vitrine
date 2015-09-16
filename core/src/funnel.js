'use strict';

var INITIAL_STATE = 'initial';

var ALLOWED_TRANSITIONS = {
  initial: ['impression'],
  impression: ['impression', 'hover', 'click'],
  hover: ['impression', 'hover', 'click'],
  click: ['impression', 'hover', 'click', 'conversion'],
  conversion: ['conversion']
};

function isAllowedEvent(event) {
  return typeof event === 'string' && ALLOWED_TRANSITIONS.hasOwnProperty(event);
}

function isAllowedTransition(from, to) {
  var transitions = ALLOWED_TRANSITIONS[from];
  return Boolean(transitions) && transitions.indexOf(to) !== -1;
}

function Funnel(state, history) {
  this.state = state || INITIAL_STATE;
  this.history = history ? history.slice() : [];
}

Funnel.prototype.record = function (event, timestamp) {
  if (!isAllowedEvent(event)) {
    throw new Error('Unknown funnel event: ' + event);
  }
  if (!isAllowedTransition(this.state, event)) {
    throw new Error('Funnel cannot transition from ' + this.state + ' to ' + event);
  }
  var nextHistory = this.history.concat([{event: event, timestamp: timestamp}]);
  return new Funnel(event, nextHistory);
};

Funnel.prototype.has = function (event) {
  for (var i = 0; i < this.history.length; i++) {
    if (this.history[i].event === event) {
      return true;
    }
  }
  return false;
};

Funnel.prototype.reachedConversion = function () {
  return this.state === 'conversion';
};

Funnel.prototype.eventCount = function (event) {
  var count = 0;
  for (var i = 0; i < this.history.length; i++) {
    if (this.history[i].event === event) {
      count++;
    }
  }
  return count;
};

module.exports = Funnel;
