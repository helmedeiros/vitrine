'use strict';

var EDITOR_CONTAINER_ID = 'vitrine-editor';

var WRAPPER_STYLES = 'position:relative;display:inline-block;max-width:100%';
var IMAGE_STYLES = 'display:block;max-width:100%;height:auto;user-select:none';
var OVERLAY_STYLES = 'position:absolute;top:0;left:0;right:0;bottom:0;' +
  'cursor:crosshair';

function findEditorContainer(documentRef) {
  return documentRef.getElementById(EDITOR_CONTAINER_ID);
}

function emptyContainer(container) {
  while (container.children && container.children.length > 0) {
    container.removeChild(container.children[0]);
  }
}

function buildEditorImage(documentRef, image) {
  var wrapper = documentRef.createElement('div');
  wrapper.className = 'vitrine-editor-image-wrapper';
  wrapper.style.cssText = WRAPPER_STYLES;

  var imageElement = documentRef.createElement('img');
  imageElement.src = image.src;
  imageElement.className = 'vitrine-editor-image';
  imageElement.style.cssText = IMAGE_STYLES;
  wrapper.appendChild(imageElement);

  var overlay = documentRef.createElement('div');
  overlay.className = 'vitrine-editor-overlay';
  overlay.style.cssText = OVERLAY_STYLES;
  wrapper.appendChild(overlay);

  return {wrapper: wrapper, image: imageElement, overlay: overlay};
}

function mountSelectedImage(documentRef, image) {
  var container = findEditorContainer(documentRef);
  if (!container) {
    return null;
  }
  emptyContainer(container);
  if (!image) {
    return null;
  }
  var parts = buildEditorImage(documentRef, image);
  container.appendChild(parts.wrapper);
  return parts;
}

function unmountEditor(documentRef) {
  var container = findEditorContainer(documentRef);
  if (!container) {
    return;
  }
  emptyContainer(container);
}

function renderEditorEmptyState(documentRef) {
  var container = findEditorContainer(documentRef);
  if (!container) {
    return;
  }
  emptyContainer(container);
  var hint = documentRef.createElement('div');
  hint.className = 'vitrine-editor-empty';
  hint.textContent = 'Select an image above to start drawing regions.';
  container.appendChild(hint);
}

var editorView = {
  mountSelectedImage: mountSelectedImage,
  unmountEditor: unmountEditor,
  renderEditorEmptyState: renderEditorEmptyState,
  EDITOR_CONTAINER_ID: EDITOR_CONTAINER_ID
};

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = editorView;
}

if (typeof window !== 'undefined') {
  window.vitrineEditorView = editorView;
}
