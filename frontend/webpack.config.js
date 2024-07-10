const path = require('path')

module.exports = {
    mode: 'production',
    entry: './App.tsx',
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                configFile: 'tsconfig.json',
            },
        }],
    },

    resolve: {
        alias: {
            "@common": path.resolve(__dirname, '../common/'),
        },
        extensions: [ '.tsx', '.ts' ],
    },

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../dist/frontend'),
    },
}
