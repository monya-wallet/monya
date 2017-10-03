var gulp=require("gulp");
var runSequence = require('run-sequence');
var browser = require("browser-sync").create();
var webpack = require("webpack-stream");
var wpConf = require("./webpack.config");
var plumber = require("gulp-plumber");
var eslint = require('gulp-eslint');
var notifier = require('node-notifier');

gulp.task("browserSync", function() {
  browser.init({
    server:{
      baseDir:"./"
    },
    open:false
  });
});
gulp.task("reload",function(){
  browser.reload()
})

gulp.task("lint",function(){
  gulp.src(["component/*.js","js/*.js"])
    .pipe(plumber({
      // エラーをハンドル
      errorHandler: function(error) {
        var taskName = 'eslint';
        var title = '[task]' + taskName + ' ' + error.plugin;
        var errorMsg = 'error: ' + error.message;
        // ターミナルにエラーを出力
        console.error(title + '\n' + errorMsg);
        // エラーを通知
        // notifier.notify({
        //   title: title,
        //   message: errorMsg,
        //   time: 3000
        //});
      }
    }))
    .pipe(eslint({ useEslintrc: true })) // .eslintrc を参照
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(plumber.stop());
})
gulp.task('webpack', function(){
  return gulp.src('js/main.js')
    .pipe(webpack(wpConf))
    .pipe(gulp.dest('./'))
    .pipe(browser.stream());
});
gulp.task("watch", function() {
  gulp.watch("dist/dist.js", ["reload"]);
  gulp.watch("index.html",["reload"]);
  gulp.watch(["component/*.js","js/*.js"],["lint"]);
});
gulp.task("default", function(cb) {
  return runSequence(
    ['browserSync',"lint","webpack","watch"],
    cb
  );
});
