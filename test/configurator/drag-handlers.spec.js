'use strict';

var expect = require('chai').expect;
var dragHandlers = require('../../configurator/src/admin/drag-handlers');

function fakeContainer(rect) {
  var listeners = {};
  return {
    addEventListener: function (event, handler) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    fire: function (event, eventObject) {
      var bound = listeners[event] || [];
      for (var i = 0; i < bound.length; i++) {
        bound[i](eventObject);
      }
    },
    getBoundingClientRect: function () {
      return rect || {left: 0, top: 0, width: 1000, height: 1000};
    }
  };
}

function mouseEvent(clientX, clientY) {
  return {clientX: clientX, clientY: clientY};
}

describe('attachDragHandlers', function () {
  it('calls onEnd with the resulting rectangle after a drag cycle', function () {
    var container = fakeContainer({left: 50, top: 100});
    var rectangles = [];
    dragHandlers.attachDragHandlers(container, {
      onEnd: function (rect) { rectangles.push(rect); }
    });
    container.fire('mousedown', mouseEvent(70, 120));
    container.fire('mousemove', mouseEvent(170, 220));
    container.fire('mouseup', mouseEvent(170, 220));
    expect(rectangles).to.deep.equal([{x: 20, y: 20, width: 100, height: 100}]);
  });

  it('calls onStart on mousedown with the relative point', function () {
    var container = fakeContainer({left: 10, top: 20});
    var startPoints = [];
    dragHandlers.attachDragHandlers(container, {
      onStart: function (point) { startPoints.push(point); }
    });
    container.fire('mousedown', mouseEvent(30, 50));
    expect(startPoints).to.deep.equal([{x: 20, y: 30}]);
  });

  it('calls onMove during a drag with start and current points', function () {
    var container = fakeContainer({left: 0, top: 0});
    var moves = [];
    dragHandlers.attachDragHandlers(container, {
      onMove: function (start, current) { moves.push({start: start, current: current}); }
    });
    container.fire('mousedown', mouseEvent(10, 10));
    container.fire('mousemove', mouseEvent(50, 50));
    container.fire('mousemove', mouseEvent(100, 100));
    expect(moves).to.have.length(2);
    expect(moves[1].start).to.deep.equal({x: 10, y: 10});
    expect(moves[1].current).to.deep.equal({x: 100, y: 100});
  });

  it('ignores mousemove and mouseup when no drag is in progress', function () {
    var container = fakeContainer();
    var ends = 0;
    dragHandlers.attachDragHandlers(container, {
      onEnd: function () { ends++; }
    });
    container.fire('mousemove', mouseEvent(10, 10));
    container.fire('mouseup', mouseEvent(10, 10));
    expect(ends).to.equal(0);
  });

  it('handles consecutive drag cycles independently', function () {
    var container = fakeContainer({left: 0, top: 0});
    var rectangles = [];
    dragHandlers.attachDragHandlers(container, {
      onEnd: function (rect) { rectangles.push(rect); }
    });
    container.fire('mousedown', mouseEvent(0, 0));
    container.fire('mousemove', mouseEvent(50, 50));
    container.fire('mouseup', mouseEvent(50, 50));
    container.fire('mousedown', mouseEvent(100, 100));
    container.fire('mousemove', mouseEvent(150, 150));
    container.fire('mouseup', mouseEvent(150, 150));
    expect(rectangles).to.have.length(2);
    expect(rectangles[0].width).to.equal(50);
    expect(rectangles[1].x).to.equal(100);
  });

  it('does not call onEnd when the drag has zero size', function () {
    var container = fakeContainer({left: 0, top: 0});
    var ends = 0;
    dragHandlers.attachDragHandlers(container, {
      onEnd: function () { ends++; },
      minSize: 1
    });
    container.fire('mousedown', mouseEvent(10, 10));
    container.fire('mouseup', mouseEvent(10, 10));
    expect(ends).to.equal(0);
  });

  it('clamps the resulting rectangle to bounds when provided', function () {
    var container = fakeContainer({left: 0, top: 0});
    var ends = [];
    dragHandlers.attachDragHandlers(container, {
      bounds: {width: 100, height: 80},
      onEnd: function (rect) { ends.push(rect); }
    });
    container.fire('mousedown', mouseEvent(10, 10));
    container.fire('mousemove', mouseEvent(999, 999));
    container.fire('mouseup', mouseEvent(999, 999));
    expect(ends[0].x + ends[0].width).to.equal(100);
    expect(ends[0].y + ends[0].height).to.equal(80);
  });
});
