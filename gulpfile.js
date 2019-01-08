var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	notify = require('gulp-notify'),
	rename = require('gulp-rename'),
    sass = require('gulp-sass'),
	browserSync = require('browser-sync');

var path = {
	'src': 'src/',
	'dist': 'dist/',
	'start': 'index.html'
}

//====================
// SASS
//====================

gulp.task('sass', function(){
	return gulp.src(path.src + '/**/!(_)*.scss')
		.pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(sass({outputStyle: 'expanded'})) // compressed | expanded
        .pipe(rename({extname: '.css'}))
		.pipe(gulp.dest(path.dist))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(rename({suffix: '.min' }))
		.pipe(gulp.dest(path.dist))
});

//====================
// Reload
//====================

gulp.task('browser-sync', function() {
    browserSync.init({
        // port: 3010,
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
