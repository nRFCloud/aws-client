const path = require('path');
const webpack = require('webpack');
const { version } = require('./package.json');

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
	entry: [
		path.resolve(__dirname, 'src/external-helpers.js'),
		path.resolve(__dirname, 'src/index.ts'),
	],
	output: {
		path: __dirname + '/dist',
		library: 'awsWrapper',
		libraryTarget: 'umd',
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: `version: ${version}`
		})
	],
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
			}, {
				test: /\.json$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'json-loader'
			}
		]
	},
	node: {
		fs: 'empty',
		tls: 'empty'
	},
	resolve: {
		extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json"],
		modules: [
			path.resolve('app'),
			'node_modules',
		],

	}
};
