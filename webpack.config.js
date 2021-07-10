const path = require('path')
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
    entry: './src/main.js',
    mode: 'development',
    // mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'jjv360-pathway.min.js',
        library: {
            name: 'module.exports',
            type: 'assign',
            export: 'default'
        }
    },
    module: {
        rules: []
    },
    plugins: []
}

// Add support for JS and JSX
module.exports.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
        loader: "babel-loader"
    }
})

// Add support for resource files
module.exports.module.rules.push({
    test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf|ico|mp3|wav|hdr|glb)$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                esModule: false,    // Required so that calling `require()` on a file actually works.
                limit: 100000000    // Any resources which are require()d need to be embedded directly... otherwise use absolutePath('name.mp3') where name.mp3 is in the resources/ folder.
            },
        },
    ],
})

// Copy resources
module.exports.plugins.push(new CopyPlugin({
    patterns: [
        { from: 'resources', to: '.' }
    ]
}))