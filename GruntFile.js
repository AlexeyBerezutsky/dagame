module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-open');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-karma');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 8080,
                    base: './'
                }
            }
        },
        watch: {
            files: 'src/**/*.js'
        },
        open: {
            dev: {
                path: 'http://localhost:8080/index.html'
            }
        },
        uglify: {
            options: {
                compress: true,
                mangle: {
                    except: []
                },
                sourceMap: false
            }
        },

        concat: {
            options: {
                separator: ';\n',
            },
            dist: {
                src: ['src/*.js','src/**/*.js'],

                dest: 'js/input-tools.js'
            }
        },

        karma: {
            unit: {
                configFile: 'karma.config.js'
            }
        }
    });

    grunt.registerTask('default', ['connect', 'open', 'watch']);

    grunt.registerTask('deploy', ['concat']);

    grunt.registerTask('unit', ['deploy', 'karma:unit']);
};
