var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    ejs = require('gulp-ejs'),
    sass = require('gulp-sass');

var path = {
    'src': 'src/',
    'dist': './',
    'start': 'index.html'
}

//====================
// EJS HTML
//====================

gulp.task('ejs', function() {
    return gulp.src(path.src + '/**/!(_)*.ejs')
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(ejs())
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest(path.dist))
});

//====================
// HTML
//====================

gulp.task('html', function() {
    gulp.src(path.src + '/**/*.html')
    .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
    .pipe(gulp.dest(path.dist))
});

//====================
// SASS
//====================

gulp.task('sass', function(){
    return gulp.src(path.src + 'sass/!(_)*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(sass({outputStyle: 'compressed'})) // compressed | expanded
        // .pipe(autoprefixer())
        .pipe(rename({extname: '.css'}))
        .pipe(gulp.dest(path.dist + 'css/'))
});

//====================
// JS
//====================

gulp.task('js', function(){
    return gulp.src(path.src + 'js/!(_)*.js')
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(gulp.dest(path.dist + 'js/'))
        .pipe(browserSync.stream());
});


//====================
// Reload
//====================

gulp.task('browser-sync', function() {
    browserSync.init({
        // port: 3010,
        server: {
            baseDir: path.dist,
            index: 'index.html'
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
    gulp.watch([path.src + '/sass/*.scss'], ['sass']);
    gulp.watch([path.src + '/**/*.ejs'], ['ejs']);
    gulp.watch([path.src + '/**/*.html'], ['html']);
    gulp.watch([path.src + '/**/*.js'], ['js']);
    gulp.watch([path.dist + '/**/*.html'], ['reload']);
    gulp.watch([path.dist + '/**/*.css'], ['reload']);
});
