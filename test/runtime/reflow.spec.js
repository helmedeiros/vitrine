'use strict';

var expect = require('chai').expect;
var reflow = require('../../runtime/src/reflow');

function fakeElement(tagName) {
  var children = [];
  var attributes = {};
  return {
    tagName: tagName.toUpperCase(),
    children: children,
    parentNode: null,
    style: {cssText: ''},
    attributes: attributes,
    appendChild: function (child) {
      children.push(child);
      child.parentNode = this;
    },
    setAttribute: function (name, value) { attributes[name] = String(value); },
    getAttribute: function (name) {
      return attributes.hasOwnProperty(name) ? attributes[name] : null;
    }
  };
}

function fakeImage(rect) {
  var img = fakeElement('img');
  img.getBoundingClientRect = function () { return rect; };
  return img;
}

function fakeHotspot(region, recordedDims, parentWrapper) {
  var hotspot = fakeElement('a');
  hotspot.setAttribute('data-vitrine-hotspot', '');
  hotspot.setAttribute('data-vitrine-x', region.x);
  hotspot.setAttribute('data-vitrine-y', region.y);
  hotspot.setAttribute('data-vitrine-width', region.width);
  hotspot.setAttribute('data-vitrine-height', region.height);
  if (recordedDims) {
    hotspot.setAttribute('data-vitrine-recorded-width', recordedDims.width);
    hotspot.setAttribute('data-vitrine-recorded-height', recordedDims.height);
  }
  if (parentWrapper) { parentWrapper.appendChild(hotspot); }
  return hotspot;
}

function fakeDocument(hotspots) {
  return {
    querySelectorAll: function (selector) {
      if (selector === '[data-vitrine-hotspot]') {
        return hotspots;
      }
      return [];
    }
  };
}

function fakeWrapper(image) {
  var wrapper = fakeElement('div');
  if (image) { wrapper.appendChild(image); }
  return wrapper;
}

describe('reflowAll', function () {
  it('rescales each hotspot using its parent image current size', function () {
    var image = fakeImage({width: 260, height: 325});
    var wrapper = fakeWrapper(image);
    var hotspot = fakeHotspot(
      {x: 100, y: 200, width: 50, height: 50},
      {width: 520, height: 650}, wrapper);
    reflow.reflowAll(fakeDocument([hotspot]));
    expect(hotspot.style.cssText).to.contain('left:50px');
    expect(hotspot.style.cssText).to.contain('top:100px');
    expect(hotspot.style.cssText).to.contain('width:25px');
    expect(hotspot.style.cssText).to.contain('height:25px');
  });

  it('does not scale when recorded dimensions are missing', function () {
    var image = fakeImage({width: 260, height: 325});
    var wrapper = fakeWrapper(image);
    var hotspot = fakeHotspot(
      {x: 100, y: 200, width: 50, height: 50}, null, wrapper);
    reflow.reflowAll(fakeDocument([hotspot]));
    expect(hotspot.style.cssText).to.contain('left:100px');
    expect(hotspot.style.cssText).to.contain('top:200px');
  });

  it('skips hotspots with no parent wrapper', function () {
    var hotspot = fakeHotspot({x: 10, y: 20, width: 30, height: 40},
      {width: 100, height: 100}, null);
    expect(function () { reflow.reflowAll(fakeDocument([hotspot])); })
      .to.not.throw();
  });

  it('skips hotspots whose wrapper has no image child', function () {
    var wrapper = fakeWrapper(null);
    var hotspot = fakeHotspot({x: 1, y: 2, width: 3, height: 4},
      {width: 1, height: 1}, wrapper);
    expect(function () { reflow.reflowAll(fakeDocument([hotspot])); })
      .to.not.throw();
  });
});

describe('attachReflow', function () {
  it('rebinds reflow to the window resize event', function () {
    var image = fakeImage({width: 260, height: 325});
    var wrapper = fakeWrapper(image);
    var hotspot = fakeHotspot(
      {x: 100, y: 200, width: 50, height: 50},
      {width: 520, height: 650}, wrapper);
    var documentRef = fakeDocument([hotspot]);
    var listeners = [];
    var win = {addEventListener: function (event, handler) {
      listeners.push({event: event, handler: handler});
    }};
    reflow.attachReflow(win, documentRef);
    expect(listeners[0].event).to.equal('resize');
    image.getBoundingClientRect = function () {
      return {width: 520, height: 650};
    };
    listeners[0].handler();
    expect(hotspot.style.cssText).to.contain('left:100px');
  });
});
