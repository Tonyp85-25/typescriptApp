const path =require('path')

module.exports = {
    mode:'development',
    entry:'./src/app.ts',
    output:{
        filename: "bundle.[name].js",
        path: path.resolve(__dirname,'dist'),
        publicPath: "dist/"
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,

    },
    devtool: 'inline-source-map',
    module: {
        rules:[
            {
                test:/\.ts$/,
                use:'ts-loader',
                exclude:/node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts','.js']
    }
}