
import { Route, Routes } from 'react-router-dom'

import DocumentTitle from 'react-document-title'
import LanguageSelect from './Header/LanguageSelect'
import { userLayout } from './Router/router.config'
import { AppConfiguration } from '../../lib/appconst'

const title = AppConfiguration.appLayoutConfig.title
function UserLayout() {
  return (
    <DocumentTitle title={title}>
      <div className="container">
        <div className={'lang'} style={{ paddingRight: '4px' }}>
          <LanguageSelect wrapClass="auth-language" type="horizontal" />
        </div>
        <Routes>
          {Object.keys(userLayout).map((key: any, index: number) => {
            const route = userLayout[key]
            const ItemComponent = route.component
            if (!ItemComponent) {
              return null
            }

            return <Route key={index} path={route.path} element={<ItemComponent />} />
          })}
        </Routes>
      </div>
    </DocumentTitle>
  )
}

export default UserLayout
