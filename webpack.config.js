const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    // JS 入口文件
    'layout': './public/js/new/layout.js',
    'image-chat': './public/js/new/image-chat.js',
    'chat': './public/js/new/chat.js',
    'ppt-gen': './public/js/new/ppt-gen.js',
    
    // CSS 入口文件
    'main': './public/css/new/main.css'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'public/js/new/[name].js',
    publicPath: '/',
    clean: true
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
      name: 'vendor'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'public/images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'public/css/new/[name].css'
    }),
    // 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: 'public',
          globOptions: {
            ignore: [
              '**/js/new/**', 
              '**/css/new/**'
            ]
          }
        },
        {
          from: 'views',
          to: 'views'
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.json', '.css']
  },
  mode: 'production',
  target: 'web'
};