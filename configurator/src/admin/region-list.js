'use strict';

var REGION_LIST_ID = 'vitrine-region-list';

function findContainer(documentRef) {
  return documentRef.getElementById(REGION_LIST_ID);
}

function emptyContainer(container) {
  while (container.children && container.children.length > 0) {
    container.removeChild(container.children[0]);
  }
}

function buildLabel(documentRef, region) {
  var label = documentRef.createElement('span');
  label.className = 'vitrine-region-label';
  label.textContent = region.id;
  return label;
}

function buildUrlInput(documentRef, region, callbacks) {
  var input = documentRef.createElement('input');
  input.type = 'url';
  input.value = region.url || '';
  input.placeholder = 'https://...';
  input.className = 'vitrine-region-url-input';
  if (callbacks && callbacks.onUrlChange) {
    input.addEventListener('input', function (event) {
      var value = (event && event.target) ? event.target.value : input.value;
      callbacks.onUrlChange(region.id, value);
    });
  }
  return input;
}

function buildRemoveButton(documentRef, region, callbacks) {
  var button = documentRef.createElement('button');
  button.textContent = 'Remove';
  button.className = 'vitrine-region-remove';
  if (callbacks && callbacks.onRemove) {
    button.addEventListener('click', function () {
      callbacks.onRemove(region.id);
    });
  }
  return button;
}

function buildRegionRow(documentRef, region, callbacks) {
  var row = documentRef.createElement('div');
  row.className = 'vitrine-region-row';
  row.setAttribute('data-region-id', region.id);
  row.appendChild(buildLabel(documentRef, region));
  row.appendChild(buildUrlInput(documentRef, region, callbacks));
  row.appendChild(buildRemoveButton(documentRef, region, callbacks));
  return row;
}

function renderRegionList(documentRef, regions, callbacks) {
  var container = findContainer(documentRef);
  if (!container) {
    return;
  }
  emptyContainer(container);
  for (var i = 0; i < regions.length; i++) {
    container.appendChild(buildRegionRow(documentRef, regions[i], callbacks));
  }
}

module.exports = {
  renderRegionList: renderRegionList,
  REGION_LIST_ID: REGION_LIST_ID
};
