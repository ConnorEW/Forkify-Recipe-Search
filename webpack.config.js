//path package
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['@babel/polyfill', './src/js/index.js'],
    //output property, where to save the file, pass an object
    output: {
        //path: saves to the folder 'js'
        path: path.resolve(__dirname, 'dist'),
        //outputs to the file bundle.js
        filename: 'js/bundle.js'
    },
    //prevents data compression during the development cycle
    // mode: 'development'
    devServer: {
        //all of the final code of the app is in the dist folder
        // short for distribution, this is the final product that would ship to the client
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            //copies each time we are bundling pur javascript files
            //copies/injects the source code of our html file
            filename: 'index.html',
            template: './src/index.html'
            //can use this plugin to create a new html from scratch automatically, 
            //not addressed in this lecture
        })
    ],
    module: {
        rules: [
            {
                //regular expression, test for all files that are .js
                test: /\.js$/,
                //exclude the entire folder node modules from having javascript files searched
                exclude: /node_modules/,
                use:{
                    loader: 'babel-loader'
                }
            }
        ]
    }
};

//webpack provides us with a development server