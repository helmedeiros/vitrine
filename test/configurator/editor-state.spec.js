'use strict';

var expect = require('chai').expect;
var editorState = require('../../configurator/src/admin/editor-state');

describe('createEditorState', function () {
  it('starts with no selected image', function () {
    expect(editorState.createEditorState().selectedIndex).to.equal(null);
  });

  it('starts with no regions on any image', function () {
    expect(editorState.createEditorState().regionsByIndex).to.deep.equal({});
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

function sampleRegion(overrides) {
  var base = {id: 'r1', x: 10, y: 20, width: 100, height: 50};
  var key;
  if (overrides) {
    for (key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        base[key] = overrides[key];
      }
    }
  }
  return base;
}

describe('addRegion', function () {
  it('appends the region to the given image index', function () {
    var initial = editorState.createEditorState();
    var next = editorState.addRegion(initial, 0, sampleRegion());
    expect(next.regionsByIndex[0]).to.have.length(1);
    expect(next.regionsByIndex[0][0]).to.deep.equal(sampleRegion());
  });

  it('does not mutate the prior state', function () {
    var initial = editorState.createEditorState();
    var next = editorState.addRegion(initial, 0, sampleRegion());
    expect(initial.regionsByIndex).to.deep.equal({});
    expect(next).to.not.equal(initial);
  });

  it('appends rather than replacing existing regions on the same image', function () {
    var initial = editorState.createEditorState();
    var afterFirst = editorState.addRegion(initial, 0, sampleRegion({id: 'r1'}));
    var afterSecond = editorState.addRegion(afterFirst, 0, sampleRegion({id: 'r2'}));
    expect(afterSecond.regionsByIndex[0]).to.have.length(2);
    expect(afterSecond.regionsByIndex[0][0].id).to.equal('r1');
    expect(afterSecond.regionsByIndex[0][1].id).to.equal('r2');
  });

  it('keeps regions on different images separate', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'a'}));
    s = editorState.addRegion(s, 1, sampleRegion({id: 'b'}));
    expect(s.regionsByIndex[0]).to.have.length(1);
    expect(s.regionsByIndex[1]).to.have.length(1);
  });

  it('rejects an invalid image index', function () {
    var s = editorState.createEditorState();
    expect(function () { return editorState.addRegion(s, -1, sampleRegion()); }).to.throw();
    expect(function () { return editorState.addRegion(s, 1.5, sampleRegion()); }).to.throw();
  });

  it('rejects a region missing required fields', function () {
    var s = editorState.createEditorState();
    expect(function () { return editorState.addRegion(s, 0, {}); }).to.throw();
    expect(function () {
      return editorState.addRegion(s, 0, {id: '', x: 0, y: 0, width: 1, height: 1});
    }).to.throw();
    expect(function () {
      return editorState.addRegion(s, 0, {id: 'r', x: 0, y: 0, width: 0, height: 1});
    }).to.throw();
  });
});

describe('removeRegion', function () {
  it('drops the region with the matching id', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'a'}));
    s = editorState.addRegion(s, 0, sampleRegion({id: 'b'}));
    s = editorState.removeRegion(s, 0, 'a');
    expect(s.regionsByIndex[0]).to.have.length(1);
    expect(s.regionsByIndex[0][0].id).to.equal('b');
  });

  it('is a no-op when the id is not present', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'a'}));
    var same = editorState.removeRegion(s, 0, 'never');
    expect(same.regionsByIndex[0]).to.have.length(1);
  });

  it('is a no-op when the image has no regions', function () {
    var s = editorState.createEditorState();
    var same = editorState.removeRegion(s, 0, 'whatever');
    expect(same.regionsByIndex[0]).to.equal(undefined);
  });

  it('does not mutate the prior state', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion());
    var before = s.regionsByIndex[0];
    editorState.removeRegion(s, 0, 'r1');
    expect(s.regionsByIndex[0]).to.equal(before);
  });
});

describe('listRegions', function () {
  it('returns an empty array when no regions exist for the image', function () {
    expect(editorState.listRegions(editorState.createEditorState(), 0))
      .to.deep.equal([]);
  });

  it('returns the regions for the given image index', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 2, sampleRegion({id: 'a'}));
    s = editorState.addRegion(s, 2, sampleRegion({id: 'b'}));
    expect(editorState.listRegions(s, 2).map(function (r) { return r.id; }))
      .to.deep.equal(['a', 'b']);
  });

  it('returns an empty array for a null state', function () {
    expect(editorState.listRegions(null, 0)).to.deep.equal([]);
  });
});
