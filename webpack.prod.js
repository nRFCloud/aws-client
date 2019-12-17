const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					mangle: {
						reserved: ['process'],
					},
				},
			}),
		],
	},
	output: {
		filename: 'aws-wrapper.min.js',
	},
});
