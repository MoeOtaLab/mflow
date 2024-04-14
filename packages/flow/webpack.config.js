const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const WebpackBar = require('webpackbar');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : 'style-loader';

/** @type {import('webpack').Configuration} */
const config = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/eos'
  },
  devServer: {
    host: 'localhost',
    client: {
      overlay: false
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/', (req, res) => {
        res.location('/eos');
        res.sendStatus(307);
      });

      return middlewares;
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html'
    }),
    new MonacoWebpackPlugin(),
    new WebpackBar()
  ],
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.less$/i,
        use: [
          stylesHandler,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: /\.module\.less$/,
                localIdentName: isProduction
                  ? undefined
                  : '[name]__[local]--[hash:base64:5]'
              }
            }
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
        use: ['file-loader']
      }

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: { path: require.resolve('path-browserify'), assert: false }
  },
  externals: {},
  stats: 'minimal'
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';

    config.plugins.push(new MiniCssExtractPlugin());

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
  } else {
    config.mode = 'development';
  }
  return config;
};
