'use strict';

function isNonNegativeInteger(value) {
  return typeof value === 'number' && value >= 0 && value === Math.floor(value);
}

function createEditorState() {
  return {selectedIndex: null};
}

function selectImage(state, index) {
  if (!isNonNegativeInteger(index)) {
    throw new Error('selectImage requires a non-negative integer index');
  }
  return {selectedIndex: index};
}

function clearSelection() {
  return {selectedIndex: null};
}

function getSelectedImage(state, payload) {
  if (!state || state.selectedIndex === null || state.selectedIndex === undefined) {
    return null;
  }
  if (!payload || !Array.isArray(payload.images)) {
    return null;
  }
  if (state.selectedIndex >= payload.images.length) {
    return null;
  }
  return payload.images[state.selectedIndex];
}

module.exports = {
  createEditorState: createEditorState,
  selectImage: selectImage,
  clearSelection: clearSelection,
  getSelectedImage: getSelectedImage
};
