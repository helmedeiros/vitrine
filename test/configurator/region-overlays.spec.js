'use strict';

var expect = require('chai').expect;
var overlays = require('../../configurator/src/admin/region-overlays');

function fakeElement(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    className: '',
    style: {cssText: ''},
    attributes: {},
    appendChild: function (child) { this.children.push(child); },
    removeChild: function (child) {
      var idx = this.children.indexOf(child);
      if (idx >= 0) { this.children.splice(idx, 1); }
    },
    setAttribute: function (name, value) { this.attributes[name] = value; },
    querySelectorAll: function (selector) {
      var matched = [];
      var key = selector.replace(/[\[\]]/g, '').split('=')[0];
      for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].attributes && this.children[i].attributes[key]) {
          matched.push(this.children[i]);
        }
      }
      return matched;
    }
  };
}

function fakeDocument() {
  return {
    createElement: function (tagName) { return fakeElement(tagName); }
  };
}

describe('buildRegionOverlay', function () {
  it('returns a div carrying the region id as a data attribute', function () {
    var element = overlays.buildRegionOverlay(fakeDocument(),
      {id: 'r1', x: 10, y: 20, width: 100, height: 50});
    expect(element.tagName).to.equal('DIV');
    expect(element.attributes['data-vitrine-region']).to.equal('r1');
  });

  it('applies absolute positioning from the region geometry', function () {
    var element = overlays.buildRegionOverlay(fakeDocument(),
      {id: 'r1', x: 10, y: 20, width: 100, height: 50});
    expect(element.style.cssText).to.contain('position:absolute');
    expect(element.style.cssText).to.contain('left:10px');
    expect(element.style.cssText).to.contain('top:20px');
    expect(element.style.cssText).to.contain('width:100px');
    expect(element.style.cssText).to.contain('height:50px');
  });

  it('applies the vitrine-region-overlay class', function () {
    var element = overlays.buildRegionOverlay(fakeDocument(),
      {id: 'r1', x: 0, y: 0, width: 1, height: 1});
    expect(element.className).to.contain('vitrine-region-overlay');
  });
});

describe('renderRegions', function () {
  it('appends one overlay per region', function () {
    var container = fakeElement('div');
    overlays.renderRegions(fakeDocument(), container, [
      {id: 'a', x: 0, y: 0, width: 10, height: 10},
      {id: 'b', x: 20, y: 20, width: 10, height: 10}
    ]);
    expect(container.children).to.have.length(2);
    expect(container.children[0].attributes['data-vitrine-region']).to.equal('a');
    expect(container.children[1].attributes['data-vitrine-region']).to.equal('b');
  });

  it('clears prior region overlays before rendering new ones', function () {
    var container = fakeElement('div');
    overlays.renderRegions(fakeDocument(), container, [
      {id: 'a', x: 0, y: 0, width: 10, height: 10}
    ]);
    expect(container.children).to.have.length(1);
    overlays.renderRegions(fakeDocument(), container, [
      {id: 'b', x: 0, y: 0, width: 10, height: 10},
      {id: 'c', x: 0, y: 0, width: 10, height: 10}
    ]);
    expect(container.children).to.have.length(2);
    expect(container.children[0].attributes['data-vitrine-region']).to.equal('b');
  });

  it('leaves non-region children alone when clearing', function () {
    var container = fakeElement('div');
    var unrelated = fakeElement('span');
    container.appendChild(unrelated);
    overlays.renderRegions(fakeDocument(), container, [
      {id: 'a', x: 0, y: 0, width: 10, height: 10}
    ]);
    expect(container.children).to.have.length(2);
    expect(container.children[0]).to.equal(unrelated);
  });

  it('produces no overlays for an empty region list', function () {
    var container = fakeElement('div');
    overlays.renderRegions(fakeDocument(), container, []);
    expect(container.children).to.have.length(0);
  });
});
