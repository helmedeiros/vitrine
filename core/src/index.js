'use strict';

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
  resolveLink: require('./link-resolver')
};
