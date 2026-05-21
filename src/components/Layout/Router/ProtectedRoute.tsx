import { Navigate } from 'react-router-dom'
import { isGranted } from '@lib/abpUtility'
// import { loginSteps } from '@lib/appconst'
import AppConsts from '@lib/appconst'
import { userLayout } from '@components/Layout/Router/router.config'
const { authorization } = AppConsts

declare let abp: any

const ProtectedRoute = ({ component, permission, location }: any) => {
  if (!abp || !abp.session) {
    return null
  }
  const hasToken = abp.auth && abp.auth.getToken && abp.auth.getToken()
  const hasUserId = abp.session.userId

  if (!hasUserId && !hasToken) {
    return (
      <Navigate
        to={{
          pathname: '/account' + userLayout.accountLogin.path
        }}
        state={{ from: location }}
      />
    )
  }

  if (!localStorage.getItem(authorization.projectId) && localStorage.getItem(authorization.userType) === '1') {
    return (
      <Navigate
        to={{
          pathname: '/account' + userLayout.accountLogin.path
          // search: `?step=${loginSteps.projectSelect}`
        }}
        state={{ from: location }}
      />
    )
  }
  if (permission && !isGranted(permission)) {
    return (
      <Navigate
        to={{
          pathname: '/exception?type=401'
        }}
        state={{ from: location }}
      />
    )
  }
  return component || null
}

export default ProtectedRoute
