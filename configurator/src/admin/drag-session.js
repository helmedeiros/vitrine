'use strict';

var rectangleFromDrag = require('./drag-rectangle');

function createDragSession() {
  return {isDragging: false, start: null, current: null};
}

function beginDrag(session, point) {
  return {isDragging: true, start: point, current: point};
}

function updateDrag(session, point) {
  if (!session.isDragging) {
    return session;
  }
  return {isDragging: true, start: session.start, current: point};
}

function endDrag(session, bounds) {
  if (!session.isDragging) {
    return {session: createDragSession(), rectangle: null};
  }
  var rectangle = rectangleFromDrag(session.start, session.current, bounds);
  return {session: createDragSession(), rectangle: rectangle};
}

var dragSession = {
  createDragSession: createDragSession,
  beginDrag: beginDrag,
  updateDrag: updateDrag,
  endDrag: endDrag
};

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = dragSession;
}

if (typeof window !== 'undefined') {
  window.vitrineDragSession = dragSession;
}
