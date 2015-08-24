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

    'mocha_istanbul': {
      coverage: {
        src: 'test',
        options: {
          mask: '**/*.spec.js',
          coverageFolder: 'coverage',
          reportFormats: ['text-summary', 'lcov'],
          excludes: ['runtime/src/index.js'],
          check: {
            statements: 80,
            branches: 80
          }
        }
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
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('lint', ['jshint', 'jscs']);
  grunt.registerTask('test', ['mocha_istanbul']);
  grunt.registerTask('browser', ['karma']);
  grunt.registerTask('default', ['lint', 'test']);
  grunt.registerTask('ci', ['lint', 'test']);
};
