const path = require('path');
const webpack = require('webpack');

const babelPresets = [[
  require.resolve("babel-preset-env"),
  {
    "modules": false,
    "useBuiltIns": "usage",
    forceAllTransforms: true
  }
]
];

const babelPlugins = [
  'babel-plugin-transform-runtime',
  "babel-plugin-transform-async-to-generator",
  'babel-plugin-external-helpers'
].map(require.resolve);

module.exports = {
  entry: './src/index.ts',
  output: {
    path: __dirname + '/lib',
    filename: 'index.js'
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: {
          presets: babelPresets,
          plugins: babelPlugins
        }
      },
      {
        test: /\.tsx?$/,
        loaders: [
          {
            loader: 'babel-loader',
            options: {
              presets: babelPresets,
              plugins: babelPlugins
            }
          }, {
            loader: 'awesome-typescript-loader'
          }
        ]
      },{
        test: /\.json$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'json-loader'
      }
    ]
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json"],
    modules: [
      path.resolve('app'),
      'node_modules',
    ],

  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
  ]
};
