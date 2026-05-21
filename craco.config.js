const CopyWebpackPlugin = require('copy-webpack-plugin')
const CracoLessPlugin = require('craco-less')
const path = require('path')
// Don't open the browser during development
process.env.BROWSER = 'none'

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#98221f',
              '@text-color': '#000000',
              '@color-error': 'rgba(231, 105, 95, 1)',
              '@color-success': 'rgba(82, 203, 103, 1)',
              '@place-holder-text': 'rgba(29, 68, 73, 0.32)',
              '@border-color': '#e8e8e8',
              '@border-primary-color': 'rgba(196, 110, 110, 0.16)',
              '@layout-bg-color': '#F2F4F8',
              '@padding-md': '16px',
              '@control-padding-horizontal': '@padding-md',
              '@height-lg': '44px',
              '@screen-md-min': '600px',
              '@screen-sm': '600px',
              '@primary-6': 'black',
              '@error-color': '#f5222d',
              '@text-color-secondary': '#fff',
              '@border-color-base': '#dee2e6'
            },
            javascriptEnabled: true
          }
        }
      }
    }
  ],
  webpack: {
    alias: {
      '@components': path.join(path.resolve(__dirname, './src/components')),
      '@assets': path.join(path.resolve(__dirname, './src/assets')),
      '@models': path.join(path.resolve(__dirname, './src/models')),
      '@lib': path.join(path.resolve(__dirname, './src/lib')),
      '@scenes': path.join(path.resolve(__dirname, './src/scenes')),
      '@services': path.join(path.resolve(__dirname, './src/services')),
      '@stores': path.join(path.resolve(__dirname, './src/stores')),
      '@utils': path.join(path.resolve(__dirname, './src/utils'))
    },
    plugins: [],
    configure: (webpackConfig, { env, paths }) => {
      if (!webpackConfig.plugins) {
        config.plugins = []
      }

      webpackConfig.plugins.push(
        process.env.NODE_ENV === 'production'
          ? new CopyWebpackPlugin({
              patterns: [
                {
                  from: 'node_modules/@aspnet/signalr/dist/browser/signalr.min.js'
                },
                {
                  from: 'node_modules/abp-web-resources/Abp/Framework/scripts/libs/abp.signalr-client.js',
                  to: 'assets/abp.signalr-client.js'
                },
                {
                  from: 'src/lib/abp.js'
                }
              ]
            })
          : new CopyWebpackPlugin({
              patterns: [
                {
                  from: 'node_modules/@aspnet/signalr/dist/browser/signalr.min.js'
                },
                {
                  from: 'node_modules/abp-web-resources/Abp/Framework/scripts/libs/abp.signalr-client.js',
                  to: 'assets/abp.signalr-client.js'
                },
                {
                  from: 'src/lib/abp.js'
                }
              ]
            })
      )

      return webpackConfig
    }
  }
}
