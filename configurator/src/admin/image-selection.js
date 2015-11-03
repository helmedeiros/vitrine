'use strict';

var SELECTED_CLASS = 'vitrine-card-selected';

function bindClickToIndex(card, index, onSelect) {
  card.addEventListener('click', function () { onSelect(index); });
}

function attachImageSelectionHandlers(documentRef, onSelect) {
  var cards = documentRef.querySelectorAll('.vitrine-image-card');
  for (var i = 0; i < cards.length; i++) {
    bindClickToIndex(cards[i], i, onSelect);
  }
}

function markSelectedCard(documentRef, selectedIndex) {
  var cards = documentRef.querySelectorAll('.vitrine-image-card');
  for (var i = 0; i < cards.length; i++) {
    if (i === selectedIndex) {
      cards[i].classList.add(SELECTED_CLASS);
    } else {
      cards[i].classList.remove(SELECTED_CLASS);
    }
  }
}

function hideEmptyState(documentRef) {
  var element = documentRef.querySelector('.empty-state');
  if (element && element.style) {
    element.style.display = 'none';
  }
}

var imageSelection = {
  attachImageSelectionHandlers: attachImageSelectionHandlers,
  markSelectedCard: markSelectedCard,
  hideEmptyState: hideEmptyState
};

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = imageSelection;
}

if (typeof window !== 'undefined') {
  window.vitrineImageSelection = imageSelection;
}
