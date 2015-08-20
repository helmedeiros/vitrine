'use strict';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],

    files: [
      'runtime/src/**/*.js',
      'runtime/test/browser/**/*.spec.js'
    ],

    exclude: [],
    preprocessors: {},

    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true,
    concurrency: 1
  });
};
