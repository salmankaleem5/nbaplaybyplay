/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    vars: {
      jsFolder: 'inc/js',
      jsDistFolder: 'inc/dist/js',
      cssFolder: 'inc/css',
      cssDistFolder: 'inc/dist/css'
    },

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    // concat: {
    //   options: {
    //     banner: '<%= banner %>',
    //     stripBanners: true
    //   },
    //   dist: {
    //     src: ['<%= vars.jsFolder %>/main.js'],
    //     dest: '<%= vars.jsDistFolder %>/main.js'
    //   }
    // },
    babel: {
      options: {
        sourceMap: true,
      },
      dist: {
        files: {
          '<%= vars.jsFolder %>/main.js': '<%= vars.jsFolder %>/main.es6.js'
        }
      }
    },
    uglify: {
      js: {
        files: {
          '<%= vars.jsDistFolder %>/script.js': ['<%= vars.jsFolder %>/main.js']
        }
      },
      // options: {
      //   banner: '<%= banner %>'
      // },
      // dist: {
      //   src: '<%= concat.dist.dest %>',
      //   dest: '<%= vars.jsDistFolder %>/script.js'
      // }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        latedef: true,
        noarg: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      // gruntfile: {
      //   src: 'Gruntfile.js'
      // },
      // lib_test: {
      //   src: ['lib/**/*.js', 'test/**/*.js']
      // }
    },
    // qunit: {
    //   files: ['test/**/*.html']
    // },
    watch: {
      js: {
        files: [
          '<%= vars.jsFolder %>/*.js',
        ],
        // tasks: ['jshint', 'concat', 'uglify'],
        tasks: ['jshint', 'babel', 'uglify']
      },
      // gruntfile: {
      //   files: '<%= jshint.gruntfile.src %>',
      //   tasks: ['jshint:gruntfile']
      // },
      // lib_test: {
      //   files: '<%= jshint.lib_test.src %>',
      //   tasks: ['jshint:lib_test', 'qunit']
      // }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

  // grunt.registerTask('babel'. ['babel:dist']);

  grunt.registerTask('build', 'Building site', function(){
    grunt.task.run('jshint');
    grunt.task.run('babel');
    grunt.task.run('uglify');
  });

  grunt.registerTask('dev', '', function(){
    grunt.task.run('build');
    grunt.task.run('watch');
  })

};
