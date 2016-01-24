module.exports = function (grunt) {

    grunt.initConfig({
        mocha_istanbul: {
            coverage: {
                src: 'test',
                options: {
                    reporter: 'dot',
                    istanbulOptions: ['--no-include-all-sources']
                }
            },
            coveralls: {
                src: 'test',
                options: {
                    quiet: true,
                    coverage: true
                }
            }
        }
    });

    grunt.event.on('coverage', function (lcov, done) {
        require('coveralls').handleInput(lcov, function (err) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.registerTask('coveralls', ['mocha_istanbul:coveralls']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};