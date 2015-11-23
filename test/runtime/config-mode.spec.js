'use strict';

var expect = require('chai').expect;
var configMode = require('../../runtime/src/config-mode');

function fakeElement(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    src: '',
    href: '',
    parentNode: null,
    style: {cssText: ''},
    attributes: {},
    appendChild: function (child) {
      this.children.push(child);
      child.parentNode = this;
    },
    insertBefore: function (newChild, refChild) {
      var idx = this.children.indexOf(refChild);
      if (idx < 0) {
        this.children.push(newChild);
      } else {
        this.children.splice(idx, 0, newChild);
      }
      newChild.parentNode = this;
    },
    setAttribute: function (name, value) { this.attributes[name] = value; },
    getAttribute: function (name) { return this.attributes[name] || null; }
  };
}

function fakeDocument(images, body) {
  var bodyEl = body || fakeElement('body');
  for (var i = 0; i < images.length; i++) {
    bodyEl.appendChild(images[i]);
  }
  return {
    getElementsByTagName: function (tagName) {
      if (tagName === 'img') {
        var matched = [];
        for (var i = 0; i < bodyEl.children.length; i++) {
          if (bodyEl.children[i].tagName === 'IMG') {
            matched.push(bodyEl.children[i]);
          }
        }
        return matched;
      }
      return [];
    },
    createElement: function (tagName) { return fakeElement(tagName); },
    body: bodyEl
  };
}

function fakeImage(src, rect) {
  var img = fakeElement('img');
  img.src = src;
  if (rect) {
    img.getBoundingClientRect = function () { return rect; };
  }
  return img;
}

describe('mountConfig', function () {
  it('mounts one hotspot per region on a matching image', function () {
    var imgA = fakeImage('http://host/a.jpg');
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      regions: [
        {x: 10, y: 20, width: 100, height: 50, url: 'http://shop/p/1'},
        {x: 200, y: 50, width: 80, height: 80, url: 'http://shop/p/2'}
      ]
    }]});
    expect(mounted).to.have.length(2);
    expect(mounted[0].tagName).to.equal('A');
    expect(mounted[0].href).to.equal('http://shop/p/1');
    expect(mounted[0].attributes['data-vitrine-hotspot']).to.equal('');
  });

  it('wraps the matched image in a relative-positioned container', function () {
    var imgA = fakeImage('http://host/a.jpg');
    var doc = fakeDocument([imgA]);
    configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      regions: [{x: 0, y: 0, width: 1, height: 1, url: 'http://x/'}]
    }]});
    var wrapper = imgA.parentNode;
    expect(wrapper.tagName).to.equal('DIV');
    expect(wrapper.attributes['data-vitrine-wrapper']).to.equal('config');
    expect(wrapper.style.cssText).to.contain('position:relative');
  });

  it('positions each hotspot absolutely with the region geometry', function () {
    var imgA = fakeImage('http://host/a.jpg');
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      regions: [{x: 12, y: 34, width: 56, height: 78, url: 'http://x/'}]
    }]});
    var hotspot = mounted[0];
    expect(hotspot.style.cssText).to.contain('position:absolute');
    expect(hotspot.style.cssText).to.contain('left:12px');
    expect(hotspot.style.cssText).to.contain('top:34px');
    expect(hotspot.style.cssText).to.contain('width:56px');
    expect(hotspot.style.cssText).to.contain('height:78px');
  });

  it('does nothing when no image src matches', function () {
    var doc = fakeDocument([fakeImage('http://host/other.jpg')]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/missing.jpg',
      regions: [{x: 0, y: 0, width: 1, height: 1, url: 'http://x/'}]
    }]});
    expect(mounted).to.have.length(0);
  });

  it('returns an empty array when config has no images', function () {
    expect(configMode.mountConfig(fakeDocument([]), {images: []}))
      .to.deep.equal([]);
  });

  it('returns an empty array when config is missing', function () {
    expect(configMode.mountConfig(fakeDocument([]), null)).to.deep.equal([]);
    expect(configMode.mountConfig(fakeDocument([]), {})).to.deep.equal([]);
  });

  it('falls back to # when a region has no url', function () {
    var imgA = fakeImage('http://host/a.jpg');
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      regions: [{x: 0, y: 0, width: 1, height: 1}]
    }]});
    expect(mounted[0].href).to.equal('#');
  });

  it('mounts hotspots on every matching <img> when more than one is present',
    function () {
      var imgA1 = fakeImage('http://host/a.jpg');
      var imgA2 = fakeImage('http://host/a.jpg');
      var doc = fakeDocument([imgA1, imgA2]);
      var mounted = configMode.mountConfig(doc, {images: [{
        src: 'http://host/a.jpg',
        regions: [{x: 0, y: 0, width: 10, height: 10, url: 'http://x/'}]
      }]});
      expect(mounted).to.have.length(2);
    });
});

describe('mountConfig coordinate scaling', function () {
  it('scales region coordinates when recorded dimensions are present', function () {
    var imgA = fakeImage('http://host/a.jpg',
      {left: 0, top: 0, width: 260, height: 325, right: 260, bottom: 325});
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      recordedWidth: 520,
      recordedHeight: 650,
      regions: [{x: 100, y: 200, width: 50, height: 50, url: 'http://x/'}]
    }]});
    var hotspot = mounted[0];
    expect(hotspot.style.cssText).to.contain('left:50px');
    expect(hotspot.style.cssText).to.contain('top:100px');
    expect(hotspot.style.cssText).to.contain('width:25px');
    expect(hotspot.style.cssText).to.contain('height:25px');
  });

  it('does not scale when recorded dimensions are missing', function () {
    var imgA = fakeImage('http://host/a.jpg',
      {left: 0, top: 0, width: 260, height: 325, right: 260, bottom: 325});
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      regions: [{x: 100, y: 200, width: 50, height: 50, url: 'http://x/'}]
    }]});
    expect(mounted[0].style.cssText).to.contain('left:100px');
    expect(mounted[0].style.cssText).to.contain('top:200px');
  });

  it('does not scale when host image has zero rendered size', function () {
    var imgA = fakeImage('http://host/a.jpg',
      {left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0});
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      recordedWidth: 520,
      recordedHeight: 650,
      regions: [{x: 10, y: 10, width: 5, height: 5, url: 'http://x/'}]
    }]});
    expect(mounted[0].style.cssText).to.contain('left:10px');
    expect(mounted[0].style.cssText).to.contain('top:10px');
  });

  it('scales x and y independently when host aspect ratio differs', function () {
    var imgA = fakeImage('http://host/a.jpg',
      {left: 0, top: 0, width: 260, height: 162, right: 260, bottom: 162});
    var doc = fakeDocument([imgA]);
    var mounted = configMode.mountConfig(doc, {images: [{
      src: 'http://host/a.jpg',
      recordedWidth: 520,
      recordedHeight: 650,
      regions: [{x: 100, y: 100, width: 100, height: 100, url: 'http://x/'}]
    }]});
    expect(mounted[0].style.cssText).to.contain('left:50px');
    expect(mounted[0].style.cssText).to.contain('top:' + (100 * 162 / 650) + 'px');
  });
});
