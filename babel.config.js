module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }],
    '@babel/preset-react'
  ],
  plugins: [
    '@babel/plugin-transform-class-properties'
  ],
  env: {
    test: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-transform-class-properties',
        '@babel/plugin-transform-modules-commonjs'
      ]
    }
  }
};
