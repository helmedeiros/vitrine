'use strict';

var dragSession = require('./drag-session');

function pointFromEvent(event, container) {
  var clientX = (event && typeof event.clientX === 'number') ? event.clientX : 0;
  var clientY = (event && typeof event.clientY === 'number') ? event.clientY : 0;
  if (typeof container.getBoundingClientRect !== 'function') {
    return {x: clientX, y: clientY};
  }
  var rect = container.getBoundingClientRect();
  return {x: clientX - (rect.left || 0), y: clientY - (rect.top || 0)};
}

function isSignificant(rectangle, minSize) {
  var threshold = typeof minSize === 'number' ? minSize : 0;
  return rectangle && rectangle.width > threshold && rectangle.height > threshold;
}

function attachDragHandlers(container, callbacks) {
  var options = callbacks || {};
  var session = dragSession.createDragSession();

  container.addEventListener('mousedown', function (event) {
    var point = pointFromEvent(event, container);
    session = dragSession.beginDrag(session, point);
    if (options.onStart) {
      options.onStart(point);
    }
  });

  container.addEventListener('mousemove', function (event) {
    if (!session.isDragging) {
      return;
    }
    var point = pointFromEvent(event, container);
    session = dragSession.updateDrag(session, point);
    if (options.onMove) {
      options.onMove(session.start, session.current);
    }
  });

  container.addEventListener('mouseup', function () {
    if (!session.isDragging) {
      return;
    }
    var result = dragSession.endDrag(session, options.bounds);
    session = result.session;
    if (options.onEnd && isSignificant(result.rectangle, options.minSize)) {
      options.onEnd(result.rectangle);
    }
  });
}

var dragHandlers = {
  attachDragHandlers: attachDragHandlers
};

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = dragHandlers;
}

if (typeof window !== 'undefined') {
  window.vitrineDragHandlers = dragHandlers;
}
