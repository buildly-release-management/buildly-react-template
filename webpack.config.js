/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
const fs = require('fs');

module.exports = (env = {}, argv) => {
  // Determine the environment file to load
  const envFile = `.env${env.build ? `.${env.build}` : ''}`;
  const envPath = path.resolve(__dirname, envFile);

  // Load environment variables from the appropriate .env file
  const envVars = fs.existsSync(envPath) ? dotenv.config({ path: envPath }).parsed : {};

  // Generate environment.js dynamically
  const envContent = `window.env = ${JSON.stringify(envVars, null, 2)};`;
  fs.writeFileSync(path.resolve(__dirname, 'environment.js'), envContent);
  console.log('Generated environment.js with the following content:', envContent);

  // Convert environment variables to Webpack's DefinePlugin format
  const defineEnvVars = Object.keys(envVars || {}).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(envVars[key]);
    return acc;
  }, {});

  return {
    entry: ['babel-polyfill', './src/index.js'],
    module: {
      rules: [
        {
          test: /\.(jsx|js)$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                '@babel/preset-react',
              ],
              plugins: ['@babel/plugin-proposal-class-properties'],
            },
          },
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]',
          },
        },
        {
          test: /\.(woff(2)?|ttf|eot|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@layout': path.resolve(__dirname, './src/layout'),
        '@modules': path.resolve(__dirname, './src/modules'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@redux': path.resolve(__dirname, './src/redux'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    output: {
      path: path.resolve(__dirname, 'dist/'),
      publicPath: '/',
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
      clean: true,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public/'),
      },
      port: 3000,
      historyApiFallback: true,
      hot: true,
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.get('/environment.js', (req, res) => {
          const envFilePath = path.resolve(__dirname, 'environment.js');
          if (fs.existsSync(envFilePath)) {
            res.setHeader('Content-Type', 'application/javascript');
            res.sendFile(envFilePath);
          } else {
            res.status(404).send('environment.js not found');
          }
        });

        return middlewares;
      },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: './index.html',
        favicon: './src/assets/favicon.ico',
        hash: true,
      }),
      new webpack.DefinePlugin(defineEnvVars), // Inject environment variables
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
  };
};