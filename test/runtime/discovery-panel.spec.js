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
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    style: {cssText: ''},
    textContent: '',
    href: '',
    target: '',
    appendChild: function (child) { this.children.push(child); },
    setAttribute: function (name, value) { this[name] = value; }
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
});
