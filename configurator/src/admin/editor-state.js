'use strict';

function isNonNegativeInteger(value) {
  return typeof value === 'number' && value >= 0 && value === Math.floor(value);
}

function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && value >= 0;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function shallowClone(obj) {
  var result = {};
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

function createEditorState() {
  return {selectedIndex: null, regionsByIndex: {}, imageDimensions: {}};
}

function setImageDimensions(state, imageIndex, width, height) {
  if (!isNonNegativeInteger(imageIndex)) {
    throw new Error('setImageDimensions requires a non-negative integer imageIndex');
  }
  var current = state || createEditorState();
  var imageDimensions = shallowClone(current.imageDimensions || {});
  imageDimensions[imageIndex] = {width: width, height: height};
  var next = shallowClone(current);
  next.imageDimensions = imageDimensions;
  return next;
}

function getImageDimensions(state, imageIndex) {
  if (!state || !state.imageDimensions) {
    return null;
  }
  return state.imageDimensions[imageIndex] || null;
}

function selectImage(state, index) {
  if (!isNonNegativeInteger(index)) {
    throw new Error('selectImage requires a non-negative integer index');
  }
  var next = shallowClone(state || createEditorState());
  next.selectedIndex = index;
  return next;
}

function clearSelection() {
  return createEditorState();
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

function validateRegion(region) {
  if (!region || typeof region !== 'object') {
    throw new Error('addRegion requires a region object');
  }
  if (!isNonEmptyString(region.id)) {
    throw new Error('region requires a non-empty id');
  }
  if (!isNonNegativeNumber(region.x) || !isNonNegativeNumber(region.y)) {
    throw new Error('region requires non-negative x and y');
  }
  if (!isPositiveNumber(region.width) || !isPositiveNumber(region.height)) {
    throw new Error('region requires positive width and height');
  }
}

function addRegion(state, imageIndex, region) {
  if (!isNonNegativeInteger(imageIndex)) {
    throw new Error('addRegion requires a non-negative integer imageIndex');
  }
  validateRegion(region);
  var current = state || createEditorState();
  var regionsByIndex = shallowClone(current.regionsByIndex || {});
  var existing = regionsByIndex[imageIndex] || [];
  regionsByIndex[imageIndex] = existing.concat([region]);
  var next = shallowClone(current);
  next.regionsByIndex = regionsByIndex;
  return next;
}

function removeRegion(state, imageIndex, regionId) {
  var current = state || createEditorState();
  var existing = (current.regionsByIndex || {})[imageIndex];
  if (!existing || existing.length === 0) {
    return current;
  }
  var filtered = [];
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].id !== regionId) {
      filtered.push(existing[i]);
    }
  }
  if (filtered.length === existing.length) {
    return current;
  }
  var regionsByIndex = shallowClone(current.regionsByIndex);
  regionsByIndex[imageIndex] = filtered;
  var next = shallowClone(current);
  next.regionsByIndex = regionsByIndex;
  return next;
}

function updateRegionUrl(state, imageIndex, regionId, url) {
  var current = state || createEditorState();
  var existing = (current.regionsByIndex || {})[imageIndex];
  if (!existing || existing.length === 0) {
    return current;
  }
  var found = false;
  var updated = [];
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].id === regionId) {
      var nextRegion = shallowClone(existing[i]);
      nextRegion.url = url;
      updated.push(nextRegion);
      found = true;
    } else {
      updated.push(existing[i]);
    }
  }
  if (!found) {
    return current;
  }
  var regionsByIndex = shallowClone(current.regionsByIndex);
  regionsByIndex[imageIndex] = updated;
  var nextState = shallowClone(current);
  nextState.regionsByIndex = regionsByIndex;
  return nextState;
}

function listRegions(state, imageIndex) {
  if (!state || !state.regionsByIndex) {
    return [];
  }
  return (state.regionsByIndex[imageIndex] || []).slice();
}

module.exports = {
  createEditorState: createEditorState,
  selectImage: selectImage,
  clearSelection: clearSelection,
  getSelectedImage: getSelectedImage,
  addRegion: addRegion,
  removeRegion: removeRegion,
  updateRegionUrl: updateRegionUrl,
  listRegions: listRegions,
  setImageDimensions: setImageDimensions,
  getImageDimensions: getImageDimensions
};
