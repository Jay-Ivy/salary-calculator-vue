var gulp=require('gulp'),
   uglify = require('gulp-uglify'),
   minifycss = require('gulp-minify-css'),
   rename = require("gulp-rename"),
   autoprefixer = require('gulp-autoprefixer'),
   browserSync= require('browser-sync');

gulp.task('scripts', function() {
  return gulp.src(["js/*.js"])
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});
gulp.task('css', function() {
  return gulp.src(["css/*.css"])
    .pipe(autoprefixer({
    	browsers: ['last 2 versions', 'Android >= 4.0',"iOS >= 7.0"],
        cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
        remove:true //是否去掉不必要的前缀 默认：true 
    }))
    .pipe(minifycss())
     .pipe(gulp.dest('dist/css'));
});
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: ''
    },
  })
});

gulp.task('default', function() {
    gulp.start('scripts');
    gulp.start('css');
});

gulp.task('watch', ['browserSync'], function (){
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('js/*.js', browserSync.reload);
  gulp.watch('css/*.css', browserSync.reload);
});