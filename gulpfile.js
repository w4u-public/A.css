var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),
	postcss = require('gulp-postcss'),
	browserSync = require('browser-sync'),
	rename = require('gulp-rename');

var plugins = [
	postcssImport = require('postcss-import'),
	postcssApply = require('postcss-apply'),
	postcssSorting = require('postcss-sorting'),
	postcssCustomSelectors = require('postcss-custom-selectors'),
	postcssNesting = require('postcss-nesting'),
	postcssNested = require('postcss-nested'),
	postcssSelectorMatches = require('postcss-selector-matches'),
	postcssInlineComments = require('postcss-inline-comment'),
	postcssCustomMedia = require('postcss-custom-media'),
	postcssDiscardEmpty = require('postcss-discard-empty'),
	mqPacker = require('css-mqpacker')
	// autoprefixer = require('autoprefixer'),
	// autoprefixer({browsers: ['last 1 version']}),
];

var path = {
	'src': 'src/',
	'dist': 'dist/',
	'start': 'A.html'
}

//====================
// HTML
//====================

gulp.task('html', function() {
	gulp.src(path.src + '/**/*.html')
	.pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
	.pipe(gulp.dest(path.dist))
	.pipe(browserSync.stream())
});

//====================
// CSS
//====================

gulp.task('css', function(){
	return gulp.src(path.src + '/**/!(_)*.css')
		.pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
		.pipe(postcss(plugins))
		.pipe(gulp.dest(path.dist))
		.pipe(browserSync.stream())
});

//====================
// Reload
//====================

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "dist",
            index: path.start
        }
    });
});

gulp.task('reload', function(){
	browserSync.reload();
});

//====================
// Watch
//====================

gulp.task('default', ['browser-sync'], function(){
	gulp.watch([path.src + '/**/*.css'], ['css']);
	gulp.watch([path.src + '/**/*.html'], ['html']);
});
