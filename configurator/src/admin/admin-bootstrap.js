(function (window, document, adminShell, imageSelection) {
  'use strict';

  function start() {
    var fragment = adminShell.readHashFragment(window.location.hash || '');
    if (!fragment) {
      return;
    }
    var payload = adminShell.decodePayload(fragment);
    var count = adminShell.renderImageList(document, payload);
    if (count > 0) {
      imageSelection.hideEmptyState(document);
      imageSelection.attachImageSelectionHandlers(document, function (index) {
        imageSelection.markSelectedCard(document, index);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}(this, this.document, this.vitrineAdminShell, this.vitrineImageSelection));
