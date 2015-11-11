'use strict';

var shell = require('./admin-shell');
var selection = require('./image-selection');
var view = require('./editor-view');
var dragHandlers = require('./drag-handlers');
var state = require('./editor-state');
var overlays = require('./region-overlays');

function nextRegionId(currentState) {
  var index = currentState.selectedIndex;
  var existing = (currentState.regionsByIndex || {})[index] || [];
  return 'r-' + index + '-' + (existing.length + 1);
}

function regionFromRect(currentState, rect) {
  return {
    id: nextRegionId(currentState),
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  };
}

function buildOnDragEnd(getState, setState, documentRef, overlay) {
  return function (rect) {
    var current = getState();
    if (current.selectedIndex === null) {
      return;
    }
    var region = regionFromRect(current, rect);
    var updated = state.addRegion(current, current.selectedIndex, region);
    setState(updated);
    overlays.renderRegions(documentRef, overlay,
      state.listRegions(updated, updated.selectedIndex));
  };
}

function refreshEditor(documentRef, getState, setState, payload) {
  var current = getState();
  var image = state.getSelectedImage(current, payload);
  var parts = view.mountSelectedImage(documentRef, image);
  if (!parts) {
    return;
  }
  overlays.renderRegions(documentRef, parts.overlay,
    state.listRegions(current, current.selectedIndex));
  dragHandlers.attachDragHandlers(parts.overlay, {
    minSize: 4,
    onEnd: buildOnDragEnd(getState, setState, documentRef, parts.overlay)
  });
}

function start(windowRef, documentRef) {
  var currentState = state.createEditorState();
  function getState() { return currentState; }
  function setState(next) { currentState = next; }

  var fragment = shell.readHashFragment(windowRef.location.hash || '');
  if (!fragment) {
    return;
  }
  var payload = shell.decodePayload(fragment);
  var count = shell.renderImageList(documentRef, payload);
  if (count === 0) {
    return;
  }
  selection.hideEmptyState(documentRef);
  selection.attachImageSelectionHandlers(documentRef, function (index) {
    setState(state.selectImage(getState(), index));
    selection.markSelectedCard(documentRef, index);
    refreshEditor(documentRef, getState, setState, payload);
  });
}

function bind(windowRef, documentRef) {
  if (documentRef.readyState === 'complete' ||
      documentRef.readyState === 'interactive') {
    start(windowRef, documentRef);
    return;
  }
  documentRef.addEventListener('DOMContentLoaded', function () {
    start(windowRef, documentRef);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  bind(window, document);
}

module.exports = {
  start: start,
  bind: bind
};
