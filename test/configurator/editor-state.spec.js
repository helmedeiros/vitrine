'use strict';

var expect = require('chai').expect;
var editorState = require('../../configurator/src/admin/editor-state');

describe('createEditorState', function () {
  it('starts with no selected image', function () {
    expect(editorState.createEditorState().selectedIndex).to.equal(null);
  });
});

describe('selectImage', function () {
  it('returns a new state with the selected index set', function () {
    var initial = editorState.createEditorState();
    var next = editorState.selectImage(initial, 2);
    expect(next.selectedIndex).to.equal(2);
    expect(initial.selectedIndex).to.equal(null);
  });

  it('rejects non-integer indices', function () {
    var s = editorState.createEditorState();
    expect(function () { return editorState.selectImage(s, 1.5); }).to.throw();
    expect(function () { return editorState.selectImage(s, '0'); }).to.throw();
    expect(function () { return editorState.selectImage(s); }).to.throw();
  });

  it('rejects negative indices', function () {
    expect(function () {
      return editorState.selectImage(editorState.createEditorState(), -1);
    }).to.throw();
  });

  it('accepts zero', function () {
    expect(editorState.selectImage(editorState.createEditorState(), 0).selectedIndex)
      .to.equal(0);
  });
});

describe('clearSelection', function () {
  it('returns a new state with no selected image', function () {
    expect(editorState.clearSelection().selectedIndex).to.equal(null);
  });
});

describe('getSelectedImage', function () {
  var payload = {images: [{src: 'a.jpg'}, {src: 'b.jpg'}, {src: 'c.jpg'}]};

  it('returns the image at the selected index', function () {
    var s = editorState.selectImage(editorState.createEditorState(), 1);
    expect(editorState.getSelectedImage(s, payload)).to.deep.equal({src: 'b.jpg'});
  });

  it('returns null when no image is selected', function () {
    expect(editorState.getSelectedImage(editorState.createEditorState(), payload))
      .to.equal(null);
  });

  it('returns null when the payload has no images array', function () {
    var s = editorState.selectImage(editorState.createEditorState(), 0);
    expect(editorState.getSelectedImage(s, {})).to.equal(null);
    expect(editorState.getSelectedImage(s, null)).to.equal(null);
  });

  it('returns null when the index is out of range', function () {
    var s = editorState.selectImage(editorState.createEditorState(), 99);
    expect(editorState.getSelectedImage(s, payload)).to.equal(null);
  });

  it('returns null when given a null state', function () {
    expect(editorState.getSelectedImage(null, payload)).to.equal(null);
  });
});
