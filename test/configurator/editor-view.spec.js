'use strict';

var expect = require('chai').expect;
var editorView = require('../../configurator/src/admin/editor-view');

function fakeElement(tagName) {
  var children = [];
  return {
    tagName: tagName.toUpperCase(),
    children: children,
    className: '',
    src: '',
    style: {cssText: ''},
    attributes: {},
    appendChild: function (child) {
      children.push(child);
      child.parentNode = this;
    },
    removeChild: function (child) {
      var idx = children.indexOf(child);
      if (idx >= 0) { children.splice(idx, 1); }
    },
    setAttribute: function (name, value) { this.attributes[name] = value; }
  };
}

Object.defineProperty(fakeElement, 'firstChild', {
  get: function () { return this.children[0]; }
});

function makeFakeElement(tagName) {
  var element = fakeElement(tagName);
  Object.defineProperty(element, 'firstChild', {
    get: function () { return element.children.length > 0 ? element.children[0] : null; }
  });
  return element;
}

function fakeDocument(editorContainer) {
  return {
    getElementById: function (id) {
      if (id === editorView.EDITOR_CONTAINER_ID && editorContainer) {
        return editorContainer;
      }
      return null;
    },
    createElement: function (tagName) { return makeFakeElement(tagName); }
  };
}

describe('mountSelectedImage', function () {
  it('returns null when no editor container exists', function () {
    expect(editorView.mountSelectedImage(fakeDocument(null), {src: 'a'})).to.equal(null);
  });

  it('returns null when no image is given', function () {
    var container = makeFakeElement('div');
    expect(editorView.mountSelectedImage(fakeDocument(container), null)).to.equal(null);
  });

  it('appends a wrapper containing the image and an overlay', function () {
    var container = makeFakeElement('div');
    var parts = editorView.mountSelectedImage(fakeDocument(container),
      {src: 'http://x.com/photo.jpg'});
    expect(container.children).to.have.length(1);
    var wrapper = container.children[0];
    expect(wrapper.className).to.contain('vitrine-editor-image-wrapper');
    expect(wrapper.children).to.have.length(2);
    expect(parts.image.tagName).to.equal('IMG');
    expect(parts.image.src).to.equal('http://x.com/photo.jpg');
    expect(parts.overlay.className).to.contain('vitrine-editor-overlay');
  });

  it('clears the editor container before mounting the next selection', function () {
    var container = makeFakeElement('div');
    editorView.mountSelectedImage(fakeDocument(container), {src: 'a'});
    editorView.mountSelectedImage(fakeDocument(container), {src: 'b'});
    expect(container.children).to.have.length(1);
    expect(container.children[0].children[0].src).to.equal('b');
  });

  it('returns parts that include the wrapper element', function () {
    var container = makeFakeElement('div');
    var parts = editorView.mountSelectedImage(fakeDocument(container), {src: 'a'});
    expect(parts.wrapper).to.equal(container.children[0]);
  });

  it('sets crosshair cursor on the overlay so users see a draw affordance',
    function () {
      var container = makeFakeElement('div');
      var parts = editorView.mountSelectedImage(fakeDocument(container), {src: 'a'});
      expect(parts.overlay.style.cssText).to.contain('cursor:crosshair');
    });
});

describe('unmountEditor', function () {
  it('empties the editor container', function () {
    var container = makeFakeElement('div');
    editorView.mountSelectedImage(fakeDocument(container), {src: 'a'});
    editorView.unmountEditor(fakeDocument(container));
    expect(container.children).to.have.length(0);
  });

  it('is a no-op when the container is missing', function () {
    expect(function () {
      editorView.unmountEditor(fakeDocument(null));
    }).to.not.throw();
  });
});
