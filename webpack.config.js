const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
	entry: './front/index.jsx',
	output: {
		path: path.resolve('site'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
				]
			}, {
				test: /\.(jsx?|js?)$/,
				exclude: /node_modules/,
				use:
				{
					loader: "buble-loader",
					query: {
						jsx: "h"
					}
				}
			}, {
				test: /\.styl$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'stylus-loader',
					}
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: require('html-webpack-template'),
			appMountId: 'app',
			inject: false,
			links: ["https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/flatly/bootstrap.min.css"]
		}),
		new MiniCssExtractPlugin()
	],
	resolve: {
		modules: [
			path.resolve("./site"),
			path.resolve("./node_modules")
		]
	},
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true // set to true if you want JS source maps
			}),
			new OptimizeCSSAssetsPlugin({})
		]
	},
	devtool: "source-map"
}