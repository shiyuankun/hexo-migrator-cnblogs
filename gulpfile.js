var gulp = require('gulp');
var jshint = require("gulp-jshint");
var streamqueue = require('streamqueue');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');

gulp.task('default', ['lint', 'mocha']);

gulp.task('lint',function(){
  return streamqueue({objectMode: true},
      gulp.src('index.js'),
      gulp.src('./lib/*.js')
      )
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
    gulp.watch(['index.js','./lib/*.js'], ['lint']);
});

gulp.task('mocha',function() {
    return gulp.src(['test/*.js'], { read: false })
            .pipe(mocha({ reporter: 'list' }))
	            .on('error', gutil.log);
});
