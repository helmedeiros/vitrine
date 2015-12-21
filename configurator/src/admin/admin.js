'use strict';

var shell = require('./admin-shell');
var selection = require('./image-selection');
var view = require('./editor-view');
var dragHandlers = require('./drag-handlers');
var state = require('./editor-state');
var overlays = require('./region-overlays');
var regionList = require('./region-list');
var exportConfig = require('./export-config');
var exportPanel = require('./export-panel');
var dimCapture = require('./dim-capture');
var draftStorage = require('./draft-storage');
var clearRegions = require('./clear-regions');
var adminErrors = require('./admin-errors');
var regionId = require('./region-id');

function regionFromRect(rect) {
  return {
    id: regionId.defaultGenerator(),
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  };
}

function renderRegionsAndList(documentRef, overlay, currentState, callbacks) {
  var regions = state.listRegions(currentState, currentState.selectedIndex);
  overlays.renderRegions(documentRef, overlay, regions);
  regionList.renderRegionList(documentRef, regions, callbacks);
}

function buildUrlChangeHandler(getState, setState, documentRef, overlay,
    regionCallbacks) {
  return function (regionId, url) {
    var current = getState();
    var updated = state.updateRegionUrl(current, current.selectedIndex,
      regionId, url);
    setState(updated);
    renderRegionsAndList(documentRef, overlay, updated, regionCallbacks);
  };
}

function buildRemoveHandler(getState, setState, documentRef, overlay,
    regionCallbacks) {
  return function (regionId) {
    var current = getState();
    var updated = state.removeRegion(current, current.selectedIndex, regionId);
    setState(updated);
    renderRegionsAndList(documentRef, overlay, updated, regionCallbacks);
  };
}

function captureImageDimensions(updatedState, imageElement) {
  if (!imageElement || typeof imageElement.getBoundingClientRect !== 'function') {
    return updatedState;
  }
  var imgRect = imageElement.getBoundingClientRect();
  if (!imgRect || !imgRect.width || !imgRect.height) {
    return updatedState;
  }
  return state.setImageDimensions(updatedState, updatedState.selectedIndex,
    imgRect.width, imgRect.height);
}

function buildOnDragEnd(getState, setState, documentRef, overlay,
    regionCallbacks, getImageElement) {
  return function (rect) {
    var current = getState();
    if (current.selectedIndex === null) {
      return;
    }
    var region = regionFromRect(rect);
    var updated = state.addRegion(current, current.selectedIndex, region);
    updated = captureImageDimensions(updated, getImageElement());
    setState(updated);
    renderRegionsAndList(documentRef, overlay, updated, regionCallbacks);
  };
}

function refreshEditor(documentRef, getState, setState, payload) {
  var current = getState();
  var image = state.getSelectedImage(current, payload);
  var parts = view.mountSelectedImage(documentRef, image);
  if (!parts) {
    return;
  }
  var regionCallbacks = {};
  regionCallbacks.onUrlChange = buildUrlChangeHandler(getState, setState,
    documentRef, parts.overlay, regionCallbacks);
  regionCallbacks.onRemove = buildRemoveHandler(getState, setState,
    documentRef, parts.overlay, regionCallbacks);
  renderRegionsAndList(documentRef, parts.overlay, current, regionCallbacks);
  dragHandlers.attachDragHandlers(parts.overlay, {
    minSize: 4,
    onEnd: buildOnDragEnd(getState, setState, documentRef, parts.overlay,
      regionCallbacks, function () { return parts.image; })
  });
  dimCapture.captureWhenReady(parts.image, function () {
    setState(captureImageDimensions(getState(), parts.image));
  });
}

function resolveStorage(windowRef) {
  if (!windowRef) {
    return null;
  }
  try {
    return windowRef.localStorage || null;
  } catch (e) {
    return null;
  }
}

function start(windowRef, documentRef) {
  var storage = resolveStorage(windowRef);
  var fragment = shell.readHashFragment(windowRef.location.hash || '');
  if (!fragment) {
    return;
  }
  var payload;
  try {
    payload = shell.decodePayload(fragment);
  } catch (decodeError) {
    adminErrors.showError(documentRef,
      'Could not decode the image payload from the URL: ' +
      (decodeError && decodeError.message ? decodeError.message : 'unknown error'));
    return;
  }
  if (!payload || !Array.isArray(payload.images)) {
    adminErrors.showError(documentRef,
      'The payload from the URL did not contain an images array.');
    return;
  }
  adminErrors.hideError(documentRef);
  var existingDraft = draftStorage.loadDraft(storage, payload.pageUrl);
  var currentState = existingDraft || state.createEditorState();

  function getState() { return currentState; }
  function refreshExportAvailability(forState) {
    exportPanel.setExportDisabled(documentRef,
      exportConfig.hasInvalidRegionUrls(forState),
      'One or more regions have an invalid URL');
  }
  function setState(next) {
    currentState = next;
    draftStorage.saveDraft(storage, payload.pageUrl, next);
    refreshExportAvailability(next);
  }
  refreshExportAvailability(currentState);

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
  if (currentState.selectedIndex !== null &&
      currentState.selectedIndex !== undefined) {
    selection.markSelectedCard(documentRef, currentState.selectedIndex);
    refreshEditor(documentRef, getState, setState, payload);
  } else {
    view.renderEditorEmptyState(documentRef);
  }
  exportPanel.attachExportButton(documentRef, function () {
    return exportConfig.buildExportSnippet(
      exportConfig.buildExportConfig(getState(), payload));
  });
  exportPanel.attachCopyButton(documentRef);
  clearRegions.attachClearButton(documentRef, function () {
    var current = getState();
    if (current.selectedIndex === null || current.selectedIndex === undefined) {
      return;
    }
    setState(state.clearImageRegions(current, current.selectedIndex));
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
