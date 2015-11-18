'use strict';

var expect = require('chai').expect;
var exportConfig = require('../../configurator/src/admin/export-config');
var editorState = require('../../configurator/src/admin/editor-state');

function withRegion(state, imageIndex, region) {
  return editorState.addRegion(state, imageIndex, region);
}

function withUrl(state, imageIndex, regionId, url) {
  return editorState.updateRegionUrl(state, imageIndex, regionId, url);
}

var samplePayload = {
  images: [
    {src: 'http://host/a.jpg'},
    {src: 'http://host/b.jpg'},
    {src: 'http://host/c.jpg'}
  ]
};

describe('buildExportConfig', function () {
  it('returns an empty images array when no regions have been added', function () {
    var config = exportConfig.buildExportConfig(
      editorState.createEditorState(), samplePayload);
    expect(config).to.deep.equal({images: []});
  });

  it('returns an empty config when state is missing', function () {
    expect(exportConfig.buildExportConfig(null, samplePayload))
      .to.deep.equal({images: []});
  });

  it('returns an empty config when payload is missing', function () {
    expect(exportConfig.buildExportConfig(editorState.createEditorState(), null))
      .to.deep.equal({images: []});
  });

  it('emits one image entry per image that has at least one region', function () {
    var s = editorState.createEditorState();
    s = withRegion(s, 0, {id: 'r1', x: 10, y: 20, width: 100, height: 50});
    s = withRegion(s, 2, {id: 'r2', x: 5, y: 5, width: 20, height: 20});
    var config = exportConfig.buildExportConfig(s, samplePayload);
    expect(config.images).to.have.length(2);
    expect(config.images[0].src).to.equal('http://host/a.jpg');
    expect(config.images[1].src).to.equal('http://host/c.jpg');
  });

  it('includes geometry and url for each region', function () {
    var s = editorState.createEditorState();
    s = withRegion(s, 0, {id: 'r1', x: 10, y: 20, width: 100, height: 50});
    s = withUrl(s, 0, 'r1', 'http://shop/product/42');
    var config = exportConfig.buildExportConfig(s, samplePayload);
    expect(config.images[0].regions).to.deep.equal([
      {x: 10, y: 20, width: 100, height: 50, url: 'http://shop/product/42'}
    ]);
  });

  it('uses an empty string for regions that have no url yet', function () {
    var s = editorState.createEditorState();
    s = withRegion(s, 0, {id: 'r1', x: 10, y: 20, width: 100, height: 50});
    var config = exportConfig.buildExportConfig(s, samplePayload);
    expect(config.images[0].regions[0].url).to.equal('');
  });

  it('skips image indices that point past the payload', function () {
    var s = editorState.createEditorState();
    s = withRegion(s, 99, {id: 'r1', x: 0, y: 0, width: 1, height: 1});
    var config = exportConfig.buildExportConfig(s, samplePayload);
    expect(config.images).to.have.length(0);
  });
});

describe('buildExportSnippet', function () {
  it('wraps a config in a <script> tag setting window.VITRINE_CONFIG', function () {
    var snippet = exportConfig.buildExportSnippet({images: []});
    expect(snippet).to.contain('<script>');
    expect(snippet).to.contain('window.VITRINE_CONFIG');
    expect(snippet).to.contain('</script>');
  });

  it('serialises the config as JSON', function () {
    var config = {images: [{src: 'a', regions: [{x: 1, y: 2, width: 3, height: 4}]}]};
    var snippet = exportConfig.buildExportSnippet(config);
    var jsonStart = snippet.indexOf('{');
    var jsonEnd = snippet.lastIndexOf('}') + 1;
    expect(JSON.parse(snippet.substring(jsonStart, jsonEnd))).to.deep.equal(config);
  });
});
