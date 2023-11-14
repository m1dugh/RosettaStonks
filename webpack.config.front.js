const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/frontend/index.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                configFile: 'tsconfig.front.json',
            },
        }],
    },

    resolve: {
        extensions: [ '.ts' ],
    },

    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist/frontend'),
    },
}
