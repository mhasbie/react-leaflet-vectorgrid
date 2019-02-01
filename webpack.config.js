/* eslint-disable */
module.exports = {
	entry: './dist/react-leaflet-vectorgrid.min.js',
	output: {
		library: {
			root: 'ReactLeafletVectorGrid',
			amd: 'react-leaflet-vectorgrid',
			commonjs: 'react-leaflet-vectorgrid'
		},
		libraryExport: 'default',
		libraryTarget: 'umd'
	},
	externals: {
		leaflet: {
			commonjs: 'leaflet',
			commonjs2: 'leaflet',
			root: 'L'
		},
		'react-leaflet': {
			commonjs: 'react-leaflet',
			commonjs2: 'react-leaflet',
			root: 'ReactLeaflet'
		},
		react: {
			commonjs: 'react',
			commonjs2: 'react',
			root: 'React'
		}
	},
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    presets: ['env', 'react'],
                    plugins: ['transform-class-properties', 'transform-object-rest-spread']
                }
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' }
				]
			}
		]
	}
};
