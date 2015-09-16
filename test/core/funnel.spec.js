'use strict';

var expect = require('chai').expect;
var Funnel = require('../../core/src/funnel');

describe('Funnel', function () {
  it('starts in the initial state with no history', function () {
    var f = new Funnel();
    expect(f.state).to.equal('initial');
    expect(f.history).to.deep.equal([]);
  });

  it('records the first impression', function () {
    var f = new Funnel().record('impression', 1000);
    expect(f.state).to.equal('impression');
    expect(f.history).to.have.length(1);
    expect(f.history[0]).to.deep.equal({event: 'impression', timestamp: 1000});
  });

  it('rejects an unknown event', function () {
    expect(function () { return new Funnel().record('like', 1); }).to.throw();
  });

  it('rejects illegal transitions from initial', function () {
    expect(function () { return new Funnel().record('hover', 1); }).to.throw();
    expect(function () { return new Funnel().record('click', 1); }).to.throw();
    expect(function () { return new Funnel().record('conversion', 1); }).to.throw();
  });

  it('rejects skipping past click before conversion', function () {
    expect(function () {
      return new Funnel().record('impression', 1).record('conversion', 2);
    }).to.throw();
    expect(function () {
      return new Funnel().record('impression', 1).record('hover', 2).record('conversion', 3);
    }).to.throw();
  });

  it('allows the standard impression to conversion path', function () {
    var f = new Funnel()
      .record('impression', 100)
      .record('hover', 200)
      .record('click', 300)
      .record('conversion', 400);
    expect(f.state).to.equal('conversion');
    expect(f.history).to.have.length(4);
  });

  it('allows multiple impressions and hovers before a click', function () {
    var f = new Funnel()
      .record('impression', 1)
      .record('impression', 2)
      .record('hover', 3)
      .record('hover', 4);
    expect(f.eventCount('impression')).to.equal(2);
    expect(f.eventCount('hover')).to.equal(2);
  });

  it('reports whether an event has ever occurred', function () {
    var f = new Funnel().record('impression', 1).record('hover', 2);
    expect(f.has('impression')).to.equal(true);
    expect(f.has('hover')).to.equal(true);
    expect(f.has('click')).to.equal(false);
    expect(f.has('conversion')).to.equal(false);
  });

  it('reports whether the funnel reached conversion', function () {
    var preConversion = new Funnel()
      .record('impression', 1)
      .record('hover', 2)
      .record('click', 3);
    expect(preConversion.reachedConversion()).to.equal(false);
    var converted = preConversion.record('conversion', 4);
    expect(converted.reachedConversion()).to.equal(true);
  });

  it('treats conversion as terminal except for re-conversion', function () {
    var f = new Funnel()
      .record('impression', 1)
      .record('hover', 2)
      .record('click', 3)
      .record('conversion', 4);
    expect(function () { return f.record('impression', 5); }).to.throw();
    expect(function () { return f.record('hover', 5); }).to.throw();
    expect(function () { return f.record('click', 5); }).to.throw();
    var stillConverted = f.record('conversion', 5);
    expect(stillConverted.state).to.equal('conversion');
    expect(stillConverted.eventCount('conversion')).to.equal(2);
  });

  it('returns a new Funnel from record without mutating the source', function () {
    var f = new Funnel().record('impression', 1);
    var f2 = f.record('hover', 2);
    expect(f.state).to.equal('impression');
    expect(f2.state).to.equal('hover');
    expect(f.history).to.have.length(1);
    expect(f2.history).to.have.length(2);
  });

  it('protects against external mutation of its history', function () {
    var history = [{event: 'impression', timestamp: 1}];
    var f = new Funnel('impression', history);
    history.push({event: 'hover', timestamp: 2});
    expect(f.history).to.have.length(1);
  });

  it('returns 0 from eventCount when the event has never been recorded', function () {
    expect(new Funnel().eventCount('impression')).to.equal(0);
  });
});
