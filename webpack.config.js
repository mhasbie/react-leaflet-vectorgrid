/* eslint-disable */
module.exports = {
	output: {
		library: 'ReactLeafletVectorGrid',
		libraryTarget: 'umd'
	},
	externals: {
		debug: 'debug',
		leaflet: {
			commonjs: 'leaflet',
			commonjs2: 'leaflet',
			root: 'L'
		},
		'react-leaflet': 'react-leaflet',
		react: {
			commonjs: 'react',
			commonjs2: 'react',
			root: 'React'
		}
	},
	module: {
		loaders: [{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel'
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				loader: 'style-loader!css-loader'
			}
		]
	}
};