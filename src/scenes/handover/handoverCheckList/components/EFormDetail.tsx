import EFormStore from '@stores/eForm/eFormStore'
import Stores from '@stores/storeIdentifier'
import { Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import CreateEForm from './EFormCreateOrEdit'
import EFormResponseList from '../eFormResponse'
import './EFormDetail.less'
import { L, isGranted } from '@lib/abpUtility'
import withRouter from '@components/Layout/Router/withRouter'
import ProjectStore from '@stores/project/projectStore'
import NoRole from '@components/ComponentNoRole'
import { appPermissions } from '@lib/appconst'

const { TabPane } = Tabs
const TabKeys = {
  CreateOrEditForm: 'EFORM_EDIT_FORM_TAB',
  ReviewForm: 'EFORM_REVIEW_FORM_TAB',
  FormComments: 'EFORM_COMMENT_TAB'
}
interface EFormCreateProps {
  navigate: any
  eFormStore: EFormStore
  projectStore: ProjectStore
}

const EFormDetail = inject(
  Stores.EFormStore,
  Stores.CommentStore,
  Stores.SessionStore,
  Stores.ProjectStore
)(
  observer(({ navigate, eFormStore, projectStore }: EFormCreateProps) => {
    return isGranted(appPermissions.eForm.detail) ? (
      <div>
        <Tabs type="card">
          <TabPane tab={L(TabKeys.CreateOrEditForm)} key={TabKeys.CreateOrEditForm}>
            <CreateEForm eFormStore={eFormStore} />
          </TabPane>
          <TabPane tab={L(TabKeys.ReviewForm)} key={TabKeys.ReviewForm}>
            <EFormResponseList
              navigate={navigate}
              eFormStore={eFormStore}
              projectStore={projectStore}
              formId={eFormStore.editEForm?.id}
            />
          </TabPane>
        </Tabs>
      </div>
    ) : (
      <NoRole />
    )
  })
)

export default withRouter(EFormDetail)
