'use strict';

var expect = require('chai').expect;
var adminErrors = require('../../configurator/src/admin/admin-errors');

function fakeElement() {
  return {
    textContent: '',
    style: {display: ''}
  };
}

function fakeDocument(element) {
  return {
    getElementById: function (id) {
      return id === 'vitrine-error' ? element : null;
    }
  };
}

describe('showError', function () {
  it('sets the text content and reveals the element', function () {
    var element = fakeElement();
    element.style.display = 'none';
    adminErrors.showError(fakeDocument(element), 'Boom');
    expect(element.textContent).to.equal('Boom');
    expect(element.style.display).to.equal('block');
  });

  it('is a no-op when no error element exists', function () {
    expect(function () {
      adminErrors.showError(fakeDocument(null), 'Boom');
    }).to.not.throw();
  });
});

describe('hideError', function () {
  it('hides the error element', function () {
    var element = fakeElement();
    element.style.display = 'block';
    adminErrors.hideError(fakeDocument(element));
    expect(element.style.display).to.equal('none');
  });

  it('is a no-op when no error element exists', function () {
    expect(function () {
      adminErrors.hideError(fakeDocument(null));
    }).to.not.throw();
  });
});
