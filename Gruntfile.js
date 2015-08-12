'use strict';

module.exports = function (grunt) {
  var sources = [
    'Gruntfile.js',
    'core/**/*.js',
    'runtime/**/*.js',
    'configurator/**/*.js',
    'adapters/**/*.js',
    'test/**/*.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: sources,
      options: {
        jshintrc: true
      }
    },

    jscs: {
      all: sources,
      options: {
        config: '.jscsrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');

  grunt.registerTask('lint', ['jshint', 'jscs']);
  grunt.registerTask('default', ['lint']);
  grunt.registerTask('ci', ['lint']);
};
