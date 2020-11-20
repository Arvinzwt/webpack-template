const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/index.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'inline-source-map',// 错误跟踪
    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins: [
        // html设定插件
        new CleanWebpackPlugin(['dist']),

        //html清理插件
        new HtmlWebpackPlugin({
            title: "page"
        }),

        // 热模块替换
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
};