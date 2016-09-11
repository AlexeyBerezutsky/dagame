module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

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
				sourceMap: false,
				banner: grunt.file.read('src/banner')
            },
            my_target: {
                files: {
                    'deploy/js/<%= pkg.name %>.js': ['src/game/**/*.js', '!src/game/js/lib/**']
                }
            }
        },
		copy: {
            main: {
                files: []
            },
        },
    });

    grunt.registerTask('default', ['connect', 'open', 'watch']);
    grunt.registerTask('deploy', ['copy', 'uglify']);
}
