const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = env => {
  return {
    entry: {
      'jscore': './index.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    mode: env.mode,
    devtool: env.mode === 'production' ? 'hidden-source-map' : 'source-map',
    target: 'web',
    module: {
      rules: [{
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: 'defaults',
                },
                corejs: 3,
                useBuiltIns: 'entry'
              }],
            ],
            plugins: []
          }
        }
      }, {
        test: /\.scss$/,
        use: [{
          loader: MiniCssExtractPlugin.loader
        }, {
          loader: 'css-loader',
          options: {
            sourceMap: env.mode == 'development'
          }
        }, {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              outputStyle: env.mode === 'production' ? 'compressed' : 'expanded',
              includePaths: [path.join(__dirname, '../node_modules')]
            },
            sourceMap: env.mode == 'development'
          }
        }, {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                require('autoprefixer')({
                  Browserslist: ['last 1 version', '> 1%', 'maintained node versions', 'not dead'],
                  cascade: false
                }),
              ]
            }
          }
        }]
      }]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: `[name].css`
      }),
    ]
  }
};