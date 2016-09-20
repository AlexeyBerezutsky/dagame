module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'jasmine-matchers'],


        // list of files / patterns to load in the browser
        files: [
            // Minified vendor logic

            'src/main/webapp/js/vendor-logic.min.js',

            // Mocks

            'src/main/webapp/vendor/angular-mocks/angular-mocks.js',

            // Minified application logic

            'src/main/webapp/js/app-logic.min.js',

            // Specs

            'test/unit/**/*-specs.js'
        ],

        // list of files to exclude
        exclude: [
            '**/*.html',
            '**/*.css'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter

        reporters: ['spec'],

        // settings for JUnit reporter
        junitReporter : {
            outputDir: 'test/reports/unit-report',
            outputFile: 'test-results.xml',
            suite: 'AngularJS-UT'
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            'PhantomJS'
        ],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
