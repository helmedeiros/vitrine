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

describe('setImageDimensions', function () {
  it('records the rendered dimensions for an image index', function () {
    var s = editorState.setImageDimensions(editorState.createEditorState(),
      0, 520, 650);
    expect(s.imageDimensions[0]).to.deep.equal({width: 520, height: 650});
  });

  it('preserves dimensions for other images', function () {
    var s = editorState.createEditorState();
    s = editorState.setImageDimensions(s, 0, 100, 200);
    s = editorState.setImageDimensions(s, 1, 300, 400);
    expect(s.imageDimensions[0]).to.deep.equal({width: 100, height: 200});
    expect(s.imageDimensions[1]).to.deep.equal({width: 300, height: 400});
  });

  it('does not mutate the prior state', function () {
    var initial = editorState.createEditorState();
    editorState.setImageDimensions(initial, 0, 100, 200);
    expect(initial.imageDimensions || {}).to.deep.equal({});
  });

  it('rejects an invalid image index', function () {
    var s = editorState.createEditorState();
    expect(function () { return editorState.setImageDimensions(s, -1, 1, 1); })
      .to.throw();
    expect(function () { return editorState.setImageDimensions(s, 1.5, 1, 1); })
      .to.throw();
  });
});

describe('getImageDimensions', function () {
  it('returns the recorded dimensions for an image', function () {
    var s = editorState.setImageDimensions(editorState.createEditorState(),
      0, 520, 650);
    expect(editorState.getImageDimensions(s, 0)).to.deep.equal({
      width: 520, height: 650
    });
  });

  it('returns null when no dimensions have been recorded', function () {
    expect(editorState.getImageDimensions(editorState.createEditorState(), 0))
      .to.equal(null);
  });

  it('returns null for a null state', function () {
    expect(editorState.getImageDimensions(null, 0)).to.equal(null);
  });
});

describe('updateRegionUrl', function () {
  it('attaches the url to the named region', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'r1'}));
    s = editorState.updateRegionUrl(s, 0, 'r1', 'http://shop/p/42');
    expect(s.regionsByIndex[0][0].url).to.equal('http://shop/p/42');
  });

  it('leaves other regions on the same image alone', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'r1'}));
    s = editorState.addRegion(s, 0, sampleRegion({id: 'r2'}));
    s = editorState.updateRegionUrl(s, 0, 'r2', 'http://shop/p/2');
    expect(s.regionsByIndex[0][0].url).to.equal(undefined);
    expect(s.regionsByIndex[0][1].url).to.equal('http://shop/p/2');
  });

  it('is a no-op when the region is not found', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'r1'}));
    var same = editorState.updateRegionUrl(s, 0, 'never', 'http://x/');
    expect(same).to.equal(s);
  });

  it('does not mutate the prior state', function () {
    var s = editorState.createEditorState();
    s = editorState.addRegion(s, 0, sampleRegion({id: 'r1'}));
    var before = s.regionsByIndex[0][0];
    editorState.updateRegionUrl(s, 0, 'r1', 'http://shop/');
    expect(before.url).to.equal(undefined);
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
