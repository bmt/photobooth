/**
 * @fileoverview Validates that environment is configured.
 */
'use strict';

module.exports = function(grunt) {
  grunt.registerTask('check_env', 'Verify environment is configured.', function() {
    if (!process.env.GOOGLE_ID) {
      grunt.log.error('Environment variables not set, run ./setup.sh');
      return false;
    }
    return true;
  });
};
