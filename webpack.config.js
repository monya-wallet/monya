const webpack = require("webpack")
const Uglify = require("uglifyjs-webpack-plugin");

module.exports = {
  context: __dirname ,
  entry: "./js/main.js",
  output: {
    path:__dirname,
    filename:"./dist/dist.js",
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(bech32))/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
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
  plugins: [
    new Uglify({
      uglifyOptions:{
        mangle:{
          safari10: true,
          reserved:['BigInteger','ECPair','Point']
        }
      }
    })
    ]
};
