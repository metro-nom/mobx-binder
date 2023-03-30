/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

// variables
const isProduction = process.env.NODE_ENV === 'production'
const sourcePath = path.join(__dirname, './src')
const outPath = path.join(__dirname, './dist')

// plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    context: sourcePath,
    entry: {
        main: './main.tsx',
    },
    mode: process.env.NODE_ENV,
    output: {
        path: outPath,
        filename: 'bundle.js',
        chunkFilename: '[chunkhash].js',
        publicPath: '/',
    },
    target: 'web',
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        // Fix webpack's default behavior to not load packages with jsnext:main module
        // (jsnext:main directs not usually distributable es6 format, but es6 sources)
        mainFields: ['module', 'browser', 'main'],
        alias: {
            app: path.resolve(__dirname, 'src/app/'),
            // 'mobx': path.resolve(__dirname, 'node_modules/mobx')
        },
    },
    module: {
        rules: [
            // .ts, .tsx
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                ],
            },
            // static assets
            { test: /\.html$/, use: 'html-loader' },
            { test: /\.png$/, use: 'url-loader?limit=10000' },
            { test: /\.jpg$/, use: 'file-loader' },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'assets/index.html',
        }),
    ],
    performance: {
        hints: false,
    },
    devServer: {
        hot: true,
        historyApiFallback: {
            disableDotRule: true,
        },
    },
    devtool: 'cheap-module-source-map',
}
