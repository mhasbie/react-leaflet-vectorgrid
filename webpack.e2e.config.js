const path = require('path');

module.exports = {
	mode: 'development',
	entry: './tests/e2e/fixture.jsx',
	output: {
		path: path.resolve(__dirname, 'tests/e2e/dist'),
		filename: 'fixture.js',
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	}
};
