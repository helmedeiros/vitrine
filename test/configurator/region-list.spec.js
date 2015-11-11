'use strict';

var expect = require('chai').expect;
var regionList = require('../../configurator/src/admin/region-list');

function fakeElement(tagName) {
  var children = [];
  var listeners = {};
  return {
    tagName: tagName.toUpperCase(),
    children: children,
    className: '',
    type: '',
    value: '',
    placeholder: '',
    attributes: {},
    appendChild: function (child) { children.push(child); },
    removeChild: function (child) {
      var idx = children.indexOf(child);
      if (idx >= 0) { children.splice(idx, 1); }
    },
    setAttribute: function (name, value) { this.attributes[name] = value; },
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

function fakeDocument(container) {
  return {
    getElementById: function (id) {
      return id === regionList.REGION_LIST_ID ? container : null;
    },
    createElement: function (tagName) { return fakeElement(tagName); }
  };
}

describe('renderRegionList', function () {
  it('builds one row per region', function () {
    var container = fakeElement('div');
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r1', x: 0, y: 0, width: 1, height: 1},
       {id: 'r2', x: 0, y: 0, width: 1, height: 1}]);
    expect(container.children).to.have.length(2);
  });

  it('renders the region id as the label', function () {
    var container = fakeElement('div');
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r-0-1', x: 0, y: 0, width: 1, height: 1}]);
    var row = container.children[0];
    expect(row.attributes['data-region-id']).to.equal('r-0-1');
    var label = row.children[0];
    expect(label.textContent).to.equal('r-0-1');
  });

  it('renders an url input pre-filled with the region url', function () {
    var container = fakeElement('div');
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r1', x: 0, y: 0, width: 1, height: 1, url: 'http://shop/'}]);
    var input = container.children[0].children[1];
    expect(input.tagName).to.equal('INPUT');
    expect(input.type).to.equal('url');
    expect(input.value).to.equal('http://shop/');
  });

  it('uses an empty value when the region has no url yet', function () {
    var container = fakeElement('div');
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r1', x: 0, y: 0, width: 1, height: 1}]);
    var input = container.children[0].children[1];
    expect(input.value).to.equal('');
  });

  it('reports url edits through the onUrlChange callback', function () {
    var container = fakeElement('div');
    var changes = [];
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r1', x: 0, y: 0, width: 1, height: 1}],
      {onUrlChange: function (id, url) { changes.push({id: id, url: url}); }});
    var input = container.children[0].children[1];
    input.value = 'http://shop/p/42';
    input.fire('input', {target: {value: 'http://shop/p/42'}});
    expect(changes).to.deep.equal([{id: 'r1', url: 'http://shop/p/42'}]);
  });

  it('replaces rows on subsequent renders', function () {
    var container = fakeElement('div');
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'a', x: 0, y: 0, width: 1, height: 1}]);
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'b', x: 0, y: 0, width: 1, height: 1},
       {id: 'c', x: 0, y: 0, width: 1, height: 1}]);
    expect(container.children).to.have.length(2);
    expect(container.children[0].attributes['data-region-id']).to.equal('b');
  });

  it('does nothing when the container is missing', function () {
    expect(function () {
      regionList.renderRegionList(fakeDocument(null), [
        {id: 'r1', x: 0, y: 0, width: 1, height: 1}
      ]);
    }).to.not.throw();
  });

  it('renders a remove button per row', function () {
    var container = fakeElement('div');
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r1', x: 0, y: 0, width: 1, height: 1}]);
    var button = container.children[0].children[2];
    expect(button.tagName).to.equal('BUTTON');
    expect(button.textContent).to.contain('Remove');
  });

  it('reports remove clicks through the onRemove callback', function () {
    var container = fakeElement('div');
    var removed = [];
    regionList.renderRegionList(fakeDocument(container),
      [{id: 'r1', x: 0, y: 0, width: 1, height: 1}],
      {onRemove: function (id) { removed.push(id); }});
    var button = container.children[0].children[2];
    button.fire('click');
    expect(removed).to.deep.equal(['r1']);
  });
});
