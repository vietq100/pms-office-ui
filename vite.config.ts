import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true
    })
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@models': path.resolve(__dirname, './src/models'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@scenes': path.resolve(__dirname, './src/scenes'),
      '@services': path.resolve(__dirname, './src/services'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
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
        }
      }
    }
  },
  server: {
    port: 3000
  }
})
