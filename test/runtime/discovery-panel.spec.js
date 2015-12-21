'use strict';

var expect = require('chai').expect;
var panel = require('../../runtime/src/discovery-panel');

function fakeBody() {
  return {
    appended: [],
    appendChild: function (child) { this.appended.push(child); }
  };
}

function fakeElement(tagName) {
  var listeners = {};
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    style: {cssText: ''},
    textContent: '',
    href: '',
    target: '',
    attributes: {},
    appendChild: function (child) { this.children.push(child); },
    setAttribute: function (name, value) {
      this[name] = value;
      this.attributes[name] = value;
    },
    addEventListener: function (event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    fire: function (event, eventObject) {
      var bound = listeners[event] || [];
      for (var i = 0; i < bound.length; i++) {
        bound[i](eventObject);
      }
    }
  };
}

function fakeDocument(body) {
  return {
    createElement: function (tagName) {
      return fakeElement(tagName);
    },
    body: body || fakeBody()
  };
}

describe('buildPanel', function () {
  it('returns a div containing the image count', function () {
    var element = panel.buildPanel(fakeDocument(), {imageCount: 7, adminUrl: 'http://a/'});
    expect(element.tagName).to.equal('DIV');
    var label = element.children[0];
    expect(label.textContent).to.contain('7');
  });

  it('uses singular wording when exactly one image is detected', function () {
    var element = panel.buildPanel(fakeDocument(), {imageCount: 1, adminUrl: 'http://a/'});
    var label = element.children[0];
    expect(label.textContent).to.contain('1 image');
    expect(label.textContent).to.not.contain('images');
  });

  it('uses plural wording when more than one image is detected', function () {
    var element = panel.buildPanel(fakeDocument(), {imageCount: 3, adminUrl: 'http://a/'});
    expect(element.children[0].textContent).to.contain('images');
  });

  it('sets the admin URL as the button href', function () {
    var element = panel.buildPanel(fakeDocument(), {
      imageCount: 2,
      adminUrl: 'http://admin.example.com/#data=abc'
    });
    var button = element.children[1];
    expect(button.tagName).to.equal('A');
    expect(button.href).to.equal('http://admin.example.com/#data=abc');
    expect(button.target).to.equal('_blank');
  });

  it('applies inline styles so host CSS does not interfere', function () {
    var element = panel.buildPanel(fakeDocument(), {imageCount: 1, adminUrl: 'http://a/'});
    expect(element.style.cssText).to.contain('position:fixed');
    expect(element.style.cssText).to.contain('z-index');
  });

  it('rejects missing options', function () {
    expect(function () { return panel.buildPanel(fakeDocument()); }).to.throw();
    expect(function () { return panel.buildPanel(fakeDocument(), {}); }).to.throw();
    expect(function () {
      return panel.buildPanel(fakeDocument(), {imageCount: 1});
    }).to.throw();
  });

  it('rejects an invalid document', function () {
    expect(function () {
      return panel.buildPanel(null, {imageCount: 1, adminUrl: 'http://a/'});
    }).to.throw();
  });
});

describe('mountPanel', function () {
  it('appends the panel to document.body and returns it', function () {
    var body = fakeBody();
    var element = panel.mountPanel(fakeDocument(body), {
      imageCount: 4, adminUrl: 'http://a/'
    });
    expect(body.appended).to.have.length(1);
    expect(body.appended[0]).to.equal(element);
  });

  it('returns null and does not mount when previously dismissed', function () {
    var body = fakeBody();
    var session = {};
    session[panel.DISMISSED_KEY] = '1';
    var windowRef = {sessionStorage: {
      getItem: function (k) { return session[k] || null; },
      setItem: function (k, v) { session[k] = v; }
    }};
    var element = panel.mountPanel(fakeDocument(body),
      {imageCount: 2, adminUrl: 'http://a/', windowRef: windowRef});
    expect(element).to.equal(null);
    expect(body.appended).to.have.length(0);
  });
});

describe('close button', function () {
  function fakeWindow() {
    var store = {};
    return {
      sessionStorage: {
        getItem: function (k) {
          return store.hasOwnProperty(k) ? store[k] : null;
        },
        setItem: function (k, v) { store[k] = String(v); }
      },
      store: store
    };
  }

  it('includes a close button as the third child of the panel', function () {
    var element = panel.buildPanel(fakeDocument(),
      {imageCount: 1, adminUrl: 'http://a/'});
    var close = element.children[2];
    expect(close.tagName).to.equal('A');
    expect(close.attributes['data-vitrine-close']).to.equal('');
  });

  it('clicking close removes the panel from its parent', function () {
    var body = fakeBody();
    var win = fakeWindow();
    var element = panel.mountPanel(fakeDocument(body),
      {imageCount: 1, adminUrl: 'http://a/', windowRef: win});
    body.removeChild = function (child) {
      var idx = body.appended.indexOf(child);
      if (idx >= 0) { body.appended.splice(idx, 1); }
    };
    element.parentNode = body;
    expect(body.appended).to.have.length(1);
    var preventDefaultCalls = 0;
    element.children[2].fire('click',
      {preventDefault: function () { preventDefaultCalls++; }});
    expect(preventDefaultCalls).to.equal(1);
    expect(body.appended).to.have.length(0);
  });

  it('clicking close marks the panel as dismissed in sessionStorage',
    function () {
      var body = fakeBody();
      body.removeChild = function () { return; };
      var win = fakeWindow();
      var element = panel.mountPanel(fakeDocument(body),
        {imageCount: 1, adminUrl: 'http://a/', windowRef: win});
      element.parentNode = body;
      element.children[2].fire('click',
        {preventDefault: function () { return; }});
      expect(win.store[panel.DISMISSED_KEY]).to.equal('1');
    });

  it('survives a missing windowRef on close click', function () {
    var body = fakeBody();
    body.removeChild = function () { return; };
    var element = panel.mountPanel(fakeDocument(body),
      {imageCount: 1, adminUrl: 'http://a/'});
    element.parentNode = body;
    expect(function () {
      element.children[2].fire('click',
        {preventDefault: function () { return; }});
    }).to.not.throw();
  });
});
