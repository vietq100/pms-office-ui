import * as React from 'react'

import Router from './components/Layout/Router'
import SessionStore from './stores/sessionStore'
import SignalRAspNetCoreHelper from './lib/signalRAspNetCoreHelper'
import Stores from './stores/storeIdentifier'
import { inject, observer } from 'mobx-react'
import withSplashScreen from '@components/Layout/SplashScreen'
import ProjectStore from '@stores/project/projectStore'
import AppConsts from '@lib/appconst'
import CheckInternetConnection from '@components/AppCheckInternet'

const { authorization } = AppConsts
export interface IAppProps {
  sessionStore?: SessionStore
  projectStore?: ProjectStore
}

const App: React.FC<IAppProps> = inject(
  Stores.SessionStore,
  Stores.ProjectStore
)(
  observer((props) => {
    const [isLoading, setIsLoading] = React.useState(true)
    React.useEffect(() => {
    const init = async () => {
        try {
          await props.sessionStore!.getCurrentLoginInformations()

          if (
            !props.sessionStore!.currentLogin.user &&
            window.location.pathname !== '/account/reset-password' &&
            window.location.pathname !== '/account/login' &&
            window.location.pathname !== '/submit/inquiry' &&
            window.location.pathname !== '/submit/delete-account'
          ) {
            window.location.href = '/account/login'
            return
          }

          if (
            !!props.sessionStore!.currentLogin.user &&
            props.sessionStore!.currentLogin.application.features['SignalR']
          ) {
            SignalRAspNetCoreHelper.initSignalR()
          }

          if (!!props.sessionStore!.currentLogin.user && localStorage.getItem(authorization.projectId)) {
            await Promise.all([
              props.sessionStore?.getMyProfilePicture(),
              props.sessionStore!.getOwnProjects({}),
              props.sessionStore!.getWebConfiguration()
            ])
          }
        } catch (error) {
          console.error('[App] init error:', error)
        } finally {
          setIsLoading(false)
        }
      }

      init()
    }, [])

    if (isLoading) return null

    return (
      <CheckInternetConnection>
        <Router isLoading={isLoading} />
      </CheckInternetConnection>
    )
  })
)

export default withSplashScreen(App)
