var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var fs = require('fs');
var path = require("path")
var PLUGIN_NAME = 'translator';
var regexp = /([\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B)+([\x21-\x7e]{0,7})([\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B)+/gm
exports.addWord = function(opt) {
  /**
   * @this {Transform}
   */

  var dictFile=opt.dictFile
  var transform = function(file, encoding, callback) {
    if (file.isNull()) {
      // 何もしない
      return callback(null, file);
    }

    if (file.isStream()) {
      // ストリームはサポートしない
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
    }

    // プラグインの処理本体
    if (file.isBuffer()) {
      var dict=fs.readFileSync(path.join(__dirname,dictFile), {encoding:"utf8"});
      // ファイルの内容をcontentsに読み込み
      var contents = String(file.contents);

      var matches,qualities = JSON.parse(dict);

      while (matches = regexp.exec(contents)) {
        if(!qualities[matches[0]]){
          qualities[matches[0]] =""
          console.log("Added!",matches[0])
        }
      }
      fs.writeFileSync(path.join(__dirname,dictFile),JSON.stringify(qualities), {encoding:"utf8"});
      // 処理の完了を通知
      return callback(null, file);
    }

    this.push(file);
    callback();
  };

  return through.obj(transform);
};

exports.translate = function(opt) {
  /**
   * @this {Transform}
   */

  var dictFile=opt.dictFile
  var transform = function(file, encoding, callback) {
    if (file.isNull()) {
      // 何もしない
      return callback(null, file);
    }

    if (file.isStream()) {
      // ストリームはサポートしない
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
    }

    // プラグインの処理本体
    if (file.isBuffer()) {
      var dict=JSON.parse(fs.readFileSync(path.join(__dirname,dictFile),{encoding:"utf8"}));
      // ファイルの内容をcontentsに読み込み
      var contents = file.contents.toString("utf8");
      
      for (var k in dict) {
        contents=contents.replace(new RegExp(k.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),"gm"),dict[k])
      }
      
      file.contents =Buffer.from(contents,"utf8")
      
      // 処理の完了を通知
      return callback(null, file);
    }

    this.push(file);
    callback();
  };

  return through.obj(transform);
};
