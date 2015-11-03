'use strict';

var expect = require('chai').expect;
var dragSession = require('../../configurator/src/admin/drag-session');

describe('createDragSession', function () {
  it('starts with no active drag', function () {
    var session = dragSession.createDragSession();
    expect(session.isDragging).to.equal(false);
    expect(session.start).to.equal(null);
    expect(session.current).to.equal(null);
  });
});

describe('beginDrag', function () {
  it('marks the session as dragging and stores the start point', function () {
    var session = dragSession.beginDrag(dragSession.createDragSession(), {x: 10, y: 20});
    expect(session.isDragging).to.equal(true);
    expect(session.start).to.deep.equal({x: 10, y: 20});
    expect(session.current).to.deep.equal({x: 10, y: 20});
  });

  it('does not mutate the prior session', function () {
    var initial = dragSession.createDragSession();
    dragSession.beginDrag(initial, {x: 1, y: 1});
    expect(initial.isDragging).to.equal(false);
  });
});

describe('updateDrag', function () {
  it('updates the current point while preserving the start point', function () {
    var started = dragSession.beginDrag(dragSession.createDragSession(), {x: 10, y: 20});
    var moved = dragSession.updateDrag(started, {x: 50, y: 60});
    expect(moved.start).to.deep.equal({x: 10, y: 20});
    expect(moved.current).to.deep.equal({x: 50, y: 60});
    expect(moved.isDragging).to.equal(true);
  });

  it('is a no-op when the session is not dragging', function () {
    var session = dragSession.createDragSession();
    var same = dragSession.updateDrag(session, {x: 5, y: 5});
    expect(same.isDragging).to.equal(false);
    expect(same.current).to.equal(null);
  });
});

describe('endDrag', function () {
  it('returns the final rectangle and a fresh session', function () {
    var started = dragSession.beginDrag(dragSession.createDragSession(), {x: 10, y: 20});
    var moved = dragSession.updateDrag(started, {x: 110, y: 70});
    var result = dragSession.endDrag(moved);
    expect(result.rectangle).to.deep.equal({x: 10, y: 20, width: 100, height: 50});
    expect(result.session.isDragging).to.equal(false);
    expect(result.session.start).to.equal(null);
  });

  it('returns a null rectangle and a fresh session when not dragging', function () {
    var result = dragSession.endDrag(dragSession.createDragSession());
    expect(result.rectangle).to.equal(null);
    expect(result.session.isDragging).to.equal(false);
  });

  it('clamps the rectangle to bounds when provided', function () {
    var started = dragSession.beginDrag(dragSession.createDragSession(), {x: 10, y: 10});
    var moved = dragSession.updateDrag(started, {x: 999, y: 999});
    var result = dragSession.endDrag(moved, {width: 200, height: 100});
    expect(result.rectangle.x + result.rectangle.width).to.equal(200);
    expect(result.rectangle.y + result.rectangle.height).to.equal(100);
  });
});
