import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import Utils from './utils/utils'
import initializeStores from './stores/storeInitializer'
import registerServiceWorker from './registerServiceWorker'
import appDataService from './services/appDataService'
import './index.css'
import './styles/custom-bootstrap.less'
import './styles/custom-ant.less'
import './styles/app.less'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ConfigProvider } from 'antd'
import type { ThemeConfig } from 'antd'
import NoInternetConnection from './components/AppCheckInternet'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#98221f',
    colorLink: '#98221f',
    colorPrimaryText: '#98221f',
    colorPrimaryTextActive: '#98221f',
  },
}

Utils.setLocalization()
appDataService.getAppConfiguration().then(async () => {
  const stores = initializeStores()

  const root = createRoot(document.getElementById('root')!)
  root.render(
    <Provider {...stores}>
      <ConfigProvider theme={theme}>
        <BrowserRouter>
          <ErrorBoundary>
            <NoInternetConnection>
              <App />
            </NoInternetConnection>
          </ErrorBoundary>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  )

  registerServiceWorker()
})
