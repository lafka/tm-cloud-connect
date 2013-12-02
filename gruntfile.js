module.exports = function (grunt) {
	grunt.initConfig({
		nodewebkit: {
			options: {
				  version:   '0.8.0'
				, build_dir: './build'
				, mac:       true
				, win:       true
				, linux32:   true
				, linux64:   true
				, keep_nw:   true
			}
			, src: 'app/**/*'
		}
	});

	grunt.loadNpmTasks('grunt-node-webkit-builder');
	grunt.registerTask('default', ['nodewebkit']);
};
