'use strict';

var expect = require('chai').expect;
var imageSelection = require('../../configurator/src/admin/image-selection');

function fakeCard() {
  var listeners = {};
  return {
    classList: {
      _classes: {},
      add: function (name) { this._classes[name] = true; },
      remove: function (name) { delete this._classes[name]; },
      contains: function (name) { return Boolean(this._classes[name]); }
    },
    addEventListener: function (event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    fire: function (event) {
      var bound = listeners[event] || [];
      for (var i = 0; i < bound.length; i++) {
        bound[i]();
      }
    }
  };
}

function fakeDocument(cards, emptyState) {
  return {
    querySelectorAll: function (selector) {
      if (selector === '.vitrine-image-card') {
        return cards;
      }
      return [];
    },
    querySelector: function (selector) {
      if (selector === '.empty-state') {
        return emptyState;
      }
      return null;
    }
  };
}

describe('attachImageSelectionHandlers', function () {
  it('records the clicked card index via the onSelect callback', function () {
    var cards = [fakeCard(), fakeCard(), fakeCard()];
    var selectedIndices = [];
    imageSelection.attachImageSelectionHandlers(fakeDocument(cards),
      function (index) { selectedIndices.push(index); });
    cards[1].fire('click');
    cards[0].fire('click');
    cards[2].fire('click');
    expect(selectedIndices).to.deep.equal([1, 0, 2]);
  });

  it('does not call onSelect before a click occurs', function () {
    var cards = [fakeCard()];
    var calls = 0;
    imageSelection.attachImageSelectionHandlers(fakeDocument(cards),
      function () { calls++; });
    expect(calls).to.equal(0);
  });

  it('handles a document with no cards without throwing', function () {
    expect(function () {
      imageSelection.attachImageSelectionHandlers(fakeDocument([]), function () { return; });
    }).to.not.throw();
  });
});

describe('markSelectedCard', function () {
  it('adds a selected class to the matching card and clears others', function () {
    var cards = [fakeCard(), fakeCard(), fakeCard()];
    imageSelection.markSelectedCard(fakeDocument(cards), 1);
    expect(cards[0].classList.contains('vitrine-card-selected')).to.equal(false);
    expect(cards[1].classList.contains('vitrine-card-selected')).to.equal(true);
    expect(cards[2].classList.contains('vitrine-card-selected')).to.equal(false);
  });

  it('clears the selected class from all cards when index is null', function () {
    var cards = [fakeCard()];
    cards[0].classList.add('vitrine-card-selected');
    imageSelection.markSelectedCard(fakeDocument(cards), null);
    expect(cards[0].classList.contains('vitrine-card-selected')).to.equal(false);
  });

  it('does nothing for an out-of-range index', function () {
    var cards = [fakeCard()];
    expect(function () {
      imageSelection.markSelectedCard(fakeDocument(cards), 99);
    }).to.not.throw();
  });
});

describe('hideEmptyState', function () {
  it('sets display:none on the empty-state element', function () {
    var emptyState = {style: {display: ''}};
    imageSelection.hideEmptyState(fakeDocument([], emptyState));
    expect(emptyState.style.display).to.equal('none');
  });

  it('is a no-op when the empty-state element is missing', function () {
    expect(function () {
      imageSelection.hideEmptyState(fakeDocument([], null));
    }).to.not.throw();
  });
});
