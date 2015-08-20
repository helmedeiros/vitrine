describe('runtime browser harness', function () {
  'use strict';

  it('mocha and chai are wired up in phantomjs', function () {
    chai.expect(1 + 1).to.equal(2);
  });
});
