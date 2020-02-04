let gulp = require("gulp");
let runSequence = require("run-sequence");
let browser = require("browser-sync").create();
let webpack = require("webpack-stream");
let plumber = require("gulp-plumber");
let eslint = require("gulp-eslint");
let uglifyes = require("uglify-es");
let composer = require("gulp-uglify/composer");
let pump = require("pump");
let translator = require("./util/translator.js");
let imagemin = require("gulp-imagemin");
let minify = composer(uglifyes, console);
let request = require("sync-request");
let fs = require("fs");
gulp.task("browserSync", function() {
  browser.init({
    server: {
      baseDir: "./"
    },
    open: false
  });
});

gulp.task("reload", function() {
  browser.reload();
});

gulp.task("lint", function() {
  gulp
    .src(["component/*.js", "js/*.js"])
    .pipe(
      plumber({
        errorHandler: function(error) {
          let taskName = "eslint";
          let title = "[task]" + taskName + " " + error.plugin;
          let errorMsg = "error: " + error.message;
          // console.error(title + "\n" + errorMsg);
        }
      })
    )
    .pipe(eslint({ useEslintrc: true })) // .eslintrc を参照
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(plumber.stop());
});
gulp.task("webpack", function() {
  return gulp
    .src("js/main.js")
    .pipe(webpack(require("./webpack.config.dev"), require("webpack")))
    .pipe(gulp.dest("./"));
});
gulp.task("webpackProd", function() {
  return gulp
    .src("js/main.js")
    .pipe(webpack(require("./webpack.config"), require("webpack")))
    .pipe(gulp.dest("./"));
});
gulp.task("webpackCordova", function() {
  return gulp
    .src("js/main.js")
    .pipe(webpack(require("./webpack.config.cordova"), require("webpack")))
    .pipe(gulp.dest("./cordovaProj/www"));
});
gulp.task("watch", function() {
  gulp.watch("dist/dist.js", ["reload"]);
  gulp.watch("component/*.html", ["translate"]);
});

gulp.task("setAssetsCordova", function() {
  return gulp
    .src(["dist/assets/**"])
    .pipe(gulp.dest("./cordovaProj/www/dist/assets"));
});

gulp.task("setDocs", function() {
  return gulp.src(["dist/**"]).pipe(gulp.dest("./docs/wallet/dist"));
});
gulp.task("setChrome", function() {
  return gulp.src(["dist/**"]).pipe(gulp.dest("./chrome_extension/dist"));
});
gulp.task("setElectron", function() {
  return gulp.src(["dist/**"]).pipe(gulp.dest("./electron/src/dist"));
});
gulp.task("compressImage", function() {
  return gulp
    .src(["dist/assets/*.png"])
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/assets"));
});

gulp.task("default", function(cb) {
  return runSequence("translate", ["browserSync", "webpack", "watch"], cb);
});
gulp.task("prod", function(cb) {
  return runSequence(
    "translate",
    ["lint", "webpackProd", "webpackCordova"],
    "compressImage",
    "serviceWorker",
    ["setDocs", "setChrome", "setElectron", "setAssetsCordova"],
    cb
  );
});
gulp.task("cordova", function(cb) {
  return runSequence("translate", "webpackCordova", "compressImage", cb);
});
let height;
try {
  height = JSON.parse(
    request(
      "GET",
      "https://insight.electrum-mona.org/insight-api-monacoin/sync"
    ).getBody("utf8")
  ).blockChainHeight;
} catch (e) {
  height = null;
}
gulp.task("translateJa", function(cb) {
  return gulp
    .src("component/*.html")
    .pipe(
      translator.translate({
        lang: "ja",
        dictFile: ["../lang/template.json", "../lang/dict.json"],
        dict: {
          "<!--t:Timestamp-->": height
        }
      })
    )
    .pipe(gulp.dest("./component/ja"));
});
gulp.task("addWord", function(cb) {
  return gulp.src("component/*.html").pipe(
    translator.addWord({
      dictFile: "../lang/dict.json"
    })
  );
});
gulp.task("translateEn", function(cb) {
  return gulp
    .src("component/*.html")
    .pipe(
      translator.translate({
        lang: "en",
        dictFile: ["../lang/template.json", "../lang/dict.json"],
        dict: {
          "<!--t:Timestamp-->": height
        }
      })
    )
    .pipe(gulp.dest("./component/en"));
});
gulp.task("serviceWorker", function(cb) {
  let files = fs.readdirSync("./dist/assets").filter(n => n[0] !== ".");
  return gulp
    .src("js/sw.js")
    .pipe(
      translator.translate({
        dictFile: ["../lang/template.json"],
        dict: {
          "<!--t:Timestamp-->": height,
          "<!--t:Caches-->": files.join(",")
        }
      })
    )
    .pipe(minify({}))
    .pipe(gulp.dest("./dist"));
});

gulp.task("translate", function(cb) {
  return runSequence("translateJa", "translateEn", cb);
});
