const webpack = require("webpack")
const Uglify = require("uglifyjs-webpack-plugin");

module.exports = {
  context: __dirname ,
  entry: "./js/main.js",
  output: {
    path:__dirname,
    filename:"./dist/dist.js"
  },
  node: {
    fs: 'empty',net:"empty","tls":"empty"
  },
  mode:"production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(bech32|ripple-lib))/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins:["syntax-dynamic-import"]
          }
        }
        },{
        test: /\.scss$/,
        use:[{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader", // translates CSS into CommonJS
          options:{
            minimize:true
          }
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }]
      },{
        test: /\.css$/, use:[{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }]
      },{
        test: /\.html$/,
        use: 'vue-template-loader'
      },{
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|m4a)$/,
        use: [
          {
            loader: 'file-loader',
            options:{
              outputPath:"dist/assets/"
            }
          }
        ]
      }
    ]
  },
  optimization:{
    minimizer: [
      new Uglify({
        uglifyOptions:{
          mangle:{
            safari10: true,
            reserved:[
              //bitcoinjs-lib
              'BigInteger','ECPair','Point'
              //ripple-lib
              ,'_', 'RippleError', 'RippledError', 'UnexpectedError',
              'LedgerVersionError', 'ConnectionError', 'NotConnectedError',
              'DisconnectedError', 'TimeoutError', 'ResponseFormatError',
              'ValidationError', 'NotFoundError', 'MissingLedgerHistoryError',
              'PendingLedgerVersionError'
            ]
          }
        }
      })
    ]
  }
};
