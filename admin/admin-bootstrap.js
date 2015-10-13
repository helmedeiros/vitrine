(function (window, document, adminShell) {
  'use strict';

  function start() {
    var fragment = adminShell.readHashFragment(window.location.hash || '');
    if (!fragment) {
      return;
    }
    var payload = adminShell.decodePayload(fragment);
    adminShell.renderImageList(document, payload);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}(this, this.document, this.vitrineAdminShell));
