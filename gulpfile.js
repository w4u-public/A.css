var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),
	browserSync = require('browser-sync'),
	rename = require('gulp-rename');
    sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	csswring = require('csswring');

var plugins = [
	mqPacker = require('css-mqpacker')
];

var path = {
	'src': 'src/',
	'dist': 'dist/',
	'start': 'test/index.html'
}

//====================
// SASS
//====================

gulp.task('sass', function(){
	return gulp.src(path.src + '/**/!(_)*.scss')
		.pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
		.pipe(postcss(plugins))
        .pipe(sass({outputStyle: 'expanded'})) // compressed | expanded
        .pipe(rename({extname: '.css'}))
		.pipe(gulp.dest(path.dist))
		.pipe(postcss([csswring]))
		.pipe(rename({suffix: '.min' }))
		.pipe(gulp.dest(path.dist))
});

//====================
// Reload
//====================

gulp.task('browser-sync', function() {
    browserSync.init({
        port: 3010,
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
	gulp.watch([path.src + '/**/*.scss'], ['sass']);
	gulp.watch([path.dist + '/**/*.html'], ['reload']);
	gulp.watch([path.dist + '/**/*.css'], ['reload']);
});
