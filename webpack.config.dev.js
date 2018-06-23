const webpack = require("webpack")

module.exports = {
  context: __dirname ,
  watch:true,
  entry: "./js/main.js",
  output: {
    path:__dirname,
    filename:"./dist/dist.js",
    chunkFilename: './dist/assets/[name].bundle.js'
  },
  node: {
    fs: 'empty',net:"empty","tls":"empty"
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use:[{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
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
    
  ]
};
