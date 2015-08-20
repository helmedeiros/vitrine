'use strict';

module.exports = function (grunt) {
  var sources = [
    'Gruntfile.js',
    'karma.conf.js',
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
    },

    mochaTest: {
      all: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.spec.js']
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('lint', ['jshint', 'jscs']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('browser', ['karma']);
  grunt.registerTask('default', ['lint', 'test']);
  grunt.registerTask('ci', ['lint', 'test']);
};
