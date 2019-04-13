const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
					loader: "babel-loader",
					options: {
						"plugins": [
							["@babel/plugin-transform-react-jsx", { "pragma": "preact.h" }]
						],
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
			title: 'Fork Game',
			appMountId: 'app',
			inject: false,
			links: ["https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/flatly/bootstrap.min.css", "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"]
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
			new OptimizeCSSAssetsPlugin({})
		]
	},
	devtool: "source-map"
}