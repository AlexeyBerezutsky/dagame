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
                    base: './src/game'
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
                    except: ['jQuery', 'ID', 'Phaser']
                },
                sourceMap: false
            },
            my_target: {
                files: {
                    'js/<%= pkg.name %>.js': ['src/game/js/lib/phaser.js', 'src/game/**/*.js']
                }
            }
        },
        copy: {
            main: {
                files: []
            },
        },

        karma: {
            unit: {
                configFile: 'karma.config.js'
            }
        }
    });

    grunt.registerTask('default', ['connect', 'open', 'watch']);

    grunt.registerTask('deploy', ['copy', 'uglify']);

    grunt.registerTask('unit', ['karma:unit']);
}
