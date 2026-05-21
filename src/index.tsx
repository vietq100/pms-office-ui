import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import Utils from './utils/utils'
import initializeStores from './stores/storeInitializer'
import registerServiceWorker from './registerServiceWorker'
import appDataService from '@services/appDataService'
import './index.css'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { App as AntdApp, ConfigProvider } from 'antd'
import { ThemeConfig } from 'antd/es/config-provider/context'
import NoInternetConnection from '@components/AppCheckInternet'
import { AntdStaticHelperMount } from '@lib/antdStaticHelper'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#98221f',
    colorLink: '#98221f',
    colorPrimaryText: '#98221f',
    colorPrimaryTextActive: '#98221f'
  }
}

Utils.setLocalization()
appDataService.getAppConfiguration().then(async () => {
  const stores = initializeStores()

  const container = document.getElementById('root') as HTMLElement
  const root = createRoot(container)
  root.render(
    <Provider {...stores}>
      <ConfigProvider theme={theme}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AntdApp>
            <AntdStaticHelperMount />
            <ErrorBoundary>
              <NoInternetConnection>
                <App />
              </NoInternetConnection>
            </ErrorBoundary>
          </AntdApp>
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  )

  registerServiceWorker()
})
