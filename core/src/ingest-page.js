'use strict';

var Page = require('./page');
var ImageAsset = require('./image-asset');
var Url = require('./url');
var ValidationError = require('./errors').ValidationError;

function detectionToImageAsset(detection) {
  return new ImageAsset({
    id: detection.id,
    identity: detection.identity,
    renderedWidth: detection.renderedWidth,
    renderedHeight: detection.renderedHeight,
    workingCopyUrl: detection.workingCopyUrl
  });
}

function ingestPage(deps, request) {
  if (!deps || !deps.pageFetcher || typeof deps.pageFetcher.fetch !== 'function') {
    throw new ValidationError(
      'ingestPage requires deps.pageFetcher with a fetch function');
  }
  if (!request || !(request.pageUrl instanceof Url)) {
    throw new ValidationError('ingestPage requires request.pageUrl');
  }
  if (typeof request.now !== 'number') {
    throw new ValidationError('ingestPage requires a numeric request.now');
  }
  var fetched = deps.pageFetcher.fetch(request.pageUrl);
  var detections = (fetched && fetched.detections) || [];
  var imageAssets = [];
  for (var i = 0; i < detections.length; i++) {
    imageAssets.push(detectionToImageAsset(detections[i]));
  }
  var page = new Page({url: request.pageUrl, ingestedAt: request.now});
  return {page: page, imageAssets: imageAssets};
}

module.exports = ingestPage;
