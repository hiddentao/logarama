var gulp = require('gulp'),
  path = require('path');

var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');
var runSequence = require('run-sequence');


var srcFile = './logarama.js';
var minFile = './logarama.min.js';
var buildFolder = '.';



gulp.task('js', function() {
  return gulp.src( srcFile )
    .pipe( babel() )
    .pipe( concat(minFile) )
    .pipe( uglify() )
    .pipe( gulp.dest(buildFolder) )
    ;
})



// gulp.task('test', function () {
//   return gulp.src('./test.js', { read: false })
//       .pipe(mocha({
//         ui: 'exports',
//         reporter: 'spec'
//       }))
//     ;
// });


gulp.task('build', function(cb) {
  runSequence('js' /*, 'test'*/, cb);
});



