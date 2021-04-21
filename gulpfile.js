const gulp = require("gulp");
const browser = require("browser-sync").create();
const webpack = require("webpack-stream");
const plumber = require("gulp-plumber");
const eslint = require("gulp-eslint");
const uglifyes = require("uglify-es");
const composer = require("gulp-uglify/composer");
const translator = require("./util/translator.js");
const imagemin = require("gulp-imagemin");
const minify = composer(uglifyes, console);
const request = require("sync-request");
const fs = require("fs");

const browserSync = function(cb) {
  browser.init(
    {
      server: {
        baseDir: "./"
      },
      open: false
    },
    cb
  );
};

const reload = function() {
  browser.reload();
};

const lint = gulp
  .src(["component/*.js", "js/*.js"])
  .pipe(
    plumber({
      errorHandler: function(error) {
        const taskName = "eslint";
        const title = "[task]" + taskName + " " + error.plugin;
        const errorMsg = "error: " + error.message;
        // console.error(title + "\n" + errorMsg);
      }
    })
  )
  .pipe(eslint({ useEslintrc: true })) // .eslintrc を参照
  .pipe(eslint.format())
  .pipe(eslint.failOnError())
  .pipe(plumber.stop());

const webpackTask = gulp
  .src("js/main.js")
  .pipe(webpack(require("./webpack.config.dev"), require("webpack")))
  .pipe(gulp.dest("./"));

const webpackProd = gulp
  .src("js/main.js")
  .pipe(webpack(require("./webpack.config"), require("webpack")))
  .pipe(gulp.dest("./"));

const webpackCordova = gulp
  .src("js/main.js")
  .pipe(webpack(require("./webpack.config.cordova"), require("webpack")))
  .pipe(gulp.dest("./cordovaProj/www"));

const watch = function() {
  gulp.watch("dist/dist.js", reload);
  gulp.watch("component/*.html", translate);
};

const setAssetsCordova = gulp
  .src(["dist/assets/**"])
  .pipe(gulp.dest("./cordovaProj/www/dist/assets"));

const setDocs = gulp.src(["dist/**"]).pipe(gulp.dest("./docs/wallet/dist"));

const setChrome = gulp
  .src(["dist/**"])
  .pipe(gulp.dest("./chrome_extension/dist"));

const setElectron = gulp
  .src(["dist/**"])
  .pipe(gulp.dest("./electron/src/dist"));

const compressImage = gulp
  .src(["dist/assets/*.png"])
  .pipe(imagemin())
  .pipe(gulp.dest("./dist/assets"));

const _default = gulp.series(
  translate,
  gulp.parallel(browserSync, webpack, watch)
);

const prod = gulp.series(
  translate,
  gulp.parallel(lint, webpackProd, webpackCordova),
  compressImage,
  serviceWorker,
  gulp.parallel(setDocs, setChrome, setElectron, setAssetsCordova)
);

const cordova = gulp.series(translate, webpackCordova, compressImage);

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

const translateJa = gulp
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

const addWord = gulp.src("component/*.html").pipe(
  translator.addWord({
    dictFile: "../lang/dict.json"
  })
);

const translateEn = gulp
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

const serviceWorker = function() {
  const files = fs.readdirSync("./dist/assets").filter(n => n[0] !== ".");
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
};

const translate = gulp.series(translateJa, translateEn);

module.exports = {
  browserSync,
  reload,
  lint,
  webpack: webpackTask,
  webpackProd,
  webpackCordova,
  watch,
  setAssetsCordova,
  setDocs,
  setChrome,
  setElectron,
  compressImage,
  default: _default,
  prod,
  cordova,
  translateJa,
  addWord,
  translateEn,
  serviceWorker,
  translate
};
