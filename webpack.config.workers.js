const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/workers/background.ts',
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                configFile: 'tsconfig.workers.json',
            },
        }],
    },

    resolve: {
        extensions: [ '.ts' ],
    },

    output: {
        filename: 'background.js',
        path: path.resolve(__dirname, 'dist/workers'),
    },
}
