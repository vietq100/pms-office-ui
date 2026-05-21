import { Route, Routes } from 'react-router-dom'
import DocumentTitle from 'react-document-title'
import { publicLayout } from './Router/router.config'
import { AppConfiguration } from '@lib/appconst'
const title = AppConfiguration.appLayoutConfig.title

function PublicLayout() {
  return (
    <DocumentTitle title={title}>
      <div className="container">
        <Routes>
          {Object.keys(publicLayout).map((key: any, index: number) => {
            const route = publicLayout[key]
            const ItemComponent = route.component
            if (!ItemComponent) {
              return null
            }
            return (
              <Route
                key={index}
                path={route.path.slice(8)}
                element={
                  <>
                    <ItemComponent />
                  </>
                }
              />
            )
          })}
        </Routes>
      </div>
    </DocumentTitle>
  )
}

export default PublicLayout
