'use strict';

var expect = require('chai').expect;
var hotspotStyles = require('../../runtime/src/hotspot-styles');

function fakeElement(tagName) {
  var children = [];
  return {
    tagName: tagName.toUpperCase(),
    children: children,
    id: '',
    textContent: '',
    appendChild: function (child) { children.push(child); }
  };
}

function fakeDocument(installedIds) {
  var head = fakeElement('head');
  return {
    head: head,
    elements: {},
    getElementById: function (id) {
      if (installedIds && installedIds.indexOf(id) >= 0) {
        return {id: id};
      }
      return this.elements[id] || null;
    },
    createElement: function (tagName) {
      var element = fakeElement(tagName);
      var self = this;
      var originalIdGetter = function () { return element.id; };
      Object.defineProperty(element, 'id', {
        get: originalIdGetter,
        set: function (value) {
          self.elements[value] = element;
        }
      });
      return element;
    },
    getElementsByTagName: function (tagName) {
      if (tagName === 'head') {
        return [head];
      }
      return [];
    }
  };
}

describe('ensureStylesInstalled', function () {
  it('appends a <style> tag with hover rules to the head', function () {
    var doc = fakeDocument();
    var installed = hotspotStyles.ensureStylesInstalled(doc);
    expect(installed).to.equal(true);
    expect(doc.head.children).to.have.length(1);
    expect(doc.head.children[0].tagName).to.equal('STYLE');
    expect(doc.head.children[0].textContent).to.contain('data-vitrine-hotspot');
    expect(doc.head.children[0].textContent).to.contain(':hover');
  });

  it('does not install a second style tag when called again', function () {
    var doc = fakeDocument([hotspotStyles.STYLE_ELEMENT_ID]);
    expect(hotspotStyles.ensureStylesInstalled(doc)).to.equal(false);
    expect(doc.head.children).to.have.length(0);
  });

  it('returns false when there is no head element', function () {
    var doc = {
      getElementById: function () { return null; },
      createElement: function (tagName) { return fakeElement(tagName); },
      getElementsByTagName: function () { return []; }
    };
    expect(hotspotStyles.ensureStylesInstalled(doc)).to.equal(false);
  });
});
