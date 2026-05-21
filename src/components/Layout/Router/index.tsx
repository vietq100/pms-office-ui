import { Route, Routes } from 'react-router-dom'
import { layoutRouter } from './router.config'
import withRouter from './withRouter'

const Router = ({ isLoading }) => {
  const UserLayout = layoutRouter.userLayout
  const AppLayout = layoutRouter.appLayout
  const PublicLayout = layoutRouter.publicLayout
  const SubmitLayout = layoutRouter.submitLayout

  return isLoading ? null : (
    <Routes>
      <Route path="/account/*" element={<UserLayout />} />
      <Route path="/submit/*" element={<SubmitLayout />} />
      <Route path="/public/*" element={<PublicLayout />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  )
}

export default withRouter(Router)
