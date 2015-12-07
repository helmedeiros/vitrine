'use strict';

var expect = require('chai').expect;
var draftStorage = require('../../configurator/src/admin/draft-storage');

function fakeStorage() {
  var data = {};
  return {
    data: data,
    getItem: function (key) {
      return data.hasOwnProperty(key) ? data[key] : null;
    },
    setItem: function (key, value) { data[key] = String(value); },
    removeItem: function (key) { delete data[key]; }
  };
}

function throwingStorage() {
  return {
    getItem: function () { throw new Error('quota'); },
    setItem: function () { throw new Error('quota'); },
    removeItem: function () { throw new Error('quota'); }
  };
}

describe('saveDraft', function () {
  it('writes the state under a key derived from the page url', function () {
    var storage = fakeStorage();
    var state = {selectedIndex: 0, regionsByIndex: {}};
    draftStorage.saveDraft(storage, 'http://host/article', state);
    expect(storage.data['vitrine-draft:http://host/article']).to.equal(
      JSON.stringify(state));
  });

  it('returns true on successful save', function () {
    expect(draftStorage.saveDraft(fakeStorage(), 'http://host/', {a: 1}))
      .to.equal(true);
  });

  it('returns false when storage is missing', function () {
    expect(draftStorage.saveDraft(null, 'http://host/', {})).to.equal(false);
  });

  it('returns false when storage throws (quota or denied)', function () {
    expect(draftStorage.saveDraft(throwingStorage(), 'http://host/', {}))
      .to.equal(false);
  });
});

describe('loadDraft', function () {
  it('returns the parsed object previously saved', function () {
    var storage = fakeStorage();
    var state = {selectedIndex: 1, regionsByIndex: {1: [{id: 'r'}]}};
    draftStorage.saveDraft(storage, 'http://host/a', state);
    expect(draftStorage.loadDraft(storage, 'http://host/a')).to.deep.equal(state);
  });

  it('returns null when there is no draft for the given url', function () {
    expect(draftStorage.loadDraft(fakeStorage(), 'http://host/none'))
      .to.equal(null);
  });

  it('returns null when the stored value is not valid JSON', function () {
    var storage = fakeStorage();
    storage.data['vitrine-draft:http://host/a'] = 'not json';
    expect(draftStorage.loadDraft(storage, 'http://host/a')).to.equal(null);
  });

  it('returns null when storage is missing', function () {
    expect(draftStorage.loadDraft(null, 'http://host/a')).to.equal(null);
  });

  it('isolates drafts by page url', function () {
    var storage = fakeStorage();
    draftStorage.saveDraft(storage, 'http://host/a', {x: 'a'});
    draftStorage.saveDraft(storage, 'http://host/b', {x: 'b'});
    expect(draftStorage.loadDraft(storage, 'http://host/a').x).to.equal('a');
    expect(draftStorage.loadDraft(storage, 'http://host/b').x).to.equal('b');
  });
});

describe('clearDraft', function () {
  it('removes the draft for the given url', function () {
    var storage = fakeStorage();
    draftStorage.saveDraft(storage, 'http://host/a', {x: 1});
    draftStorage.clearDraft(storage, 'http://host/a');
    expect(draftStorage.loadDraft(storage, 'http://host/a')).to.equal(null);
  });

  it('is a no-op when storage is missing', function () {
    expect(function () {
      draftStorage.clearDraft(null, 'http://host/a');
    }).to.not.throw();
  });

  it('survives storage throwing', function () {
    expect(function () {
      draftStorage.clearDraft(throwingStorage(), 'http://host/a');
    }).to.not.throw();
  });
});
