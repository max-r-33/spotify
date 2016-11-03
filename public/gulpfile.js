//1. make gulpfile
//2. npm i all dependencies
//3. check folder paths used in gulpfile
//4. update index.html
//5. run gulp-watch

var gulp = require('gulp'),
    del = require('del'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    print = require('gulp-print'),
    babel = require('gulp-babel');

var CacheBuster = require('gulp-cachebust');
var cachebust = new CacheBuster();

gulp.task('build-css', function() {
    return gulp.src(['./styles/reset.scss','./styles/*'])
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(cachebust.resources())
        .pipe(sourcemaps.write('./maps'))
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function(cb) {
    del([
        'dist'
    ], cb);
});


gulp.task('build-js', function() {
  return gulp.src('./components/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(print())
      .pipe(babel({ presets: ['es2015'] }))
      .pipe(concat('bundle.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'));
});

gulp.task('build', ['clean', 'build-css', 'build-js'], function() {
    return gulp.src('index.html')
        .pipe(cachebust.references())
        .pipe(gulp.dest('dist'));
});


gulp.task('watch', function() {
    return gulp.watch(['./index.html', './styles/*.*css', './components/**/*.js'], ['build']);
});
