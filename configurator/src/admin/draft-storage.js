'use strict';

var KEY_PREFIX = 'vitrine-draft:';

function buildKey(pageUrl) {
  return KEY_PREFIX + (pageUrl || '');
}

function saveDraft(storage, pageUrl, state) {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(buildKey(pageUrl), JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}

function loadDraft(storage, pageUrl) {
  if (!storage) {
    return null;
  }
  try {
    var raw = storage.getItem(buildKey(pageUrl));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearDraft(storage, pageUrl) {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(buildKey(pageUrl));
  } catch (e) {
    return;
  }
}

module.exports = {
  saveDraft: saveDraft,
  loadDraft: loadDraft,
  clearDraft: clearDraft
};
