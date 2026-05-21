import EFormStore from '@stores/eForm/eFormStore'
import Stores from '@stores/storeIdentifier'
import { Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import { L, isGranted } from '@lib/abpUtility'
import CommentList from '@components/CommentList'
import { appPermissions, moduleIds } from '@lib/appconst'
import CommentStore from '../../../stores/common/commentStore'
import SessionStore from '@stores/sessionStore'
import withRouter from '@components/Layout/Router/withRouter'
import ProjectStore from '@stores/project/projectStore'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import EFormResponseView from './components/EFormResponseView'
import React from 'react'
import ReactToPrint from 'react-to-print'
import Button from 'antd/es/button'
import EResponseDetailForPrinting from './components/EResponseDetailForPrinting'
import NoRole from '@components/ComponentNoRole'
import ActionFooter from '@components/ActionFooter'
import { portalLayouts } from '@components/Layout/Router/router.config'

const pageStyleA5 = ` 
@page {
  size: a5;
  margin: 0 !important;
}

body {
  transform: scale(0.9);
  width: 100%;  
  transform-origin: top left;
  font-size: 12px !important;
  padding: 0mm !important;
}`

const { TabPane } = Tabs
const TabKeys = {
  FormResponse: 'EFORM_RESPONSE_TAB',
  FormComments: 'EFORM_COMMENT_TAB'
}
interface EFormResponseDetailProps {
  navigate: any
  eFormStore: EFormStore
  commentStore: CommentStore
  sessionStore: SessionStore
  projectStore: ProjectStore
}

const EFormDetail = inject(
  Stores.EFormStore,
  Stores.CommentStore,
  Stores.SessionStore,
  Stores.ProjectStore
)(
  observer(({ eFormStore, commentStore, sessionStore, navigate }: EFormResponseDetailProps) => {
    const { id } = useParams()

    useEffect(() => {
      const initData = async () => {
        id ? await eFormStore.getResponseDetail(Number(id)) : await eFormStore.createEForm()
      }
      initData()
    }, [])
    const componentRef = React.useRef(null)
    const reactToPrintContent = React.useCallback(() => {
      return componentRef.current
    }, [componentRef.current])
    const reactToPrintTrigger = React.useCallback(() => {
      return <Button type="primary">{L('PRINT')}</Button>
    }, [])

    return isGranted(appPermissions.eFormAnswer.detail) ? (
      <Tabs
        type="card"
        onTabClick={(tabKey) => {
          if (tabKey === TabKeys.FormComments) {
            const params = {
              conversationUniqueId: eFormStore.editEFormResponse?.uniqueId,
              moduleId: moduleIds.eform,
              maxResultCount: 10,
              skipCount: 0,
              isIncludeFile: true,
              isPrivate: false
            }
            commentStore.getAll(params)
          }
        }}>
        <TabPane tab={L(TabKeys.FormResponse)} key={TabKeys.FormResponse}>
          <div className="w-100 d-flex justify-content-end">
            <ReactToPrint
              bodyClass={'p-3'}
              content={reactToPrintContent}
              documentTitle={`${L('RESPONDING_FORM')}_${eFormStore.editEFormResponse?.id}`}
              removeAfterPrint
              trigger={reactToPrintTrigger}
              pageStyle={pageStyleA5}
            />
          </div>

          <div style={{ overflow: 'hidden', height: 0 }}>
            <div ref={componentRef}>
              <EResponseDetailForPrinting eFormStore={eFormStore} />
            </div>
          </div>
          <EFormResponseView eFormStore={eFormStore} />
          <ActionFooter show={true}>
            <Button
              shape="round"
              className="mr-1 btn-icon-customize"
              onClick={() => navigate({ pathname: portalLayouts.eFormResponses.path, search: 'keep-filter' })}>
              {L('BTN_BACK_TO_LIST')}
            </Button>
          </ActionFooter>
        </TabPane>
        {eFormStore.editEFormResponse?.uniqueId && (
          <TabPane tab={L(TabKeys.FormComments)} key={TabKeys.FormComments}>
            <CommentList
              moduleId={moduleIds.eform}
              parentId={eFormStore.editEFormResponse?.uniqueId}
              commentStore={commentStore}
              sessionStore={sessionStore}
              isPrivate={false}
            />

            <ActionFooter show={true}>
              <Button
                shape="round"
                className="mr-1 btn-icon-customize"
                onClick={() => navigate(portalLayouts.eFormResponses.path)}>
                {L('BTN_BACK_TO_LIST')}
              </Button>
            </ActionFooter>
          </TabPane>
        )}
      </Tabs>
    ) : (
      <NoRole />
    )
  })
)

export default withRouter(EFormDetail)
