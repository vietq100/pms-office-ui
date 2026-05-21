import { Tabs } from 'antd'
import { L, isGranted } from '@lib/abpUtility'
import WfStatus from '@scenes/workflow/status'
import WfPriority from '@scenes/workflow/priority'
import WfRole from '@scenes/workflow/role'
import WfTracker from '@scenes/workflow/tracker'
import WfCustomField from '@scenes/workflow/customField'
import WfConfiguration from '@scenes/workflow/configuration'
import WfStatusStore from '@stores/workflow/wfStatusStore'
import WfPriorityStore from '@stores/workflow/wfPriorityStore'
import WfRoleStore from '@stores/workflow/wfRoleStore'
import WfTrackerStore from '@stores/workflow/wfTrackerStore'
import SettingWorkflowSLA from '@scenes/workflow/sla'
import WfCustomFieldStore from '@stores/workflow/wfCustomFieldStore'
import WfConfigurationStore from '@stores/workflow/wfConfigurationStore'
import { appPermissions, moduleIds } from '@lib/appconst'
import NoRole from '@components/ComponentNoRole'

const { TabPane } = Tabs

const FeedbackConfig = () => {
  return isGranted(appPermissions.feedbackConfiguration.page) ? (
    <div className="card-container sla-container">
      <Tabs type="card">
        <TabPane tab={L('STATUS')} key="1">
          <WfStatus wfStatusStore={new WfStatusStore()} moduleId={moduleIds.feedback} />
        </TabPane>
        <TabPane tab={L('PRIORITY')} key="2">
          <WfPriority wfPriorityStore={new WfPriorityStore()} moduleId={moduleIds.feedback} />
        </TabPane>
        <TabPane tab={L('ROLE')} key="3">
          <WfRole wfRoleStore={new WfRoleStore()} moduleId={moduleIds.feedback} />
        </TabPane>
        <TabPane tab={L('TRACKER')} key="4">
          <WfTracker wfTrackerStore={new WfTrackerStore()} moduleId={moduleIds.feedback} />
        </TabPane>
        <TabPane tab={L('CUSTOM_FIELD')} key="5">
          <WfCustomField wfCustomFieldStore={new WfCustomFieldStore()} moduleId={moduleIds.feedback} />
        </TabPane>
        <TabPane tab={L('CONFIGURATION')} key="6">
          <WfConfiguration
            wfConfigurationStore={new WfConfigurationStore()}
            wfRoleStore={new WfRoleStore()}
            moduleId={moduleIds.feedback}
          />
        </TabPane>
        <TabPane tab={L('SLA')} key="7">
          <SettingWorkflowSLA moduleId={moduleIds.feedback} />
        </TabPane>
      </Tabs>
    </div>
  ) : (
    <NoRole />
  )
}

export default FeedbackConfig
