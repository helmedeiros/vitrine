'use strict';

var errors = require('./errors');

module.exports = {
  Point: require('./point'),
  Rect: require('./rect'),
  Polygon: require('./polygon'),
  Mask: require('./mask'),
  Url: require('./url'),
  DimensionsAndStem: require('./dimensions-and-stem'),
  PerceptualHash: require('./perceptual-hash'),
  SelectorPath: require('./selector-path'),
  ImageIdentity: require('./image-identity'),
  matchIdentities: require('./match-cascade'),
  resolveLink: require('./link-resolver'),
  Funnel: require('./funnel'),
  DomainError: errors.DomainError,
  ValidationError: errors.ValidationError,
  Brand: require('./brand'),
  Page: require('./page'),
  ImageAsset: require('./image-asset'),
  Region: require('./region'),
  ProductBinding: require('./product-binding')
};
