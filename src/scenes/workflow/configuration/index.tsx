import * as React from 'react'

import { Button, Col, Row, Select, Tabs } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'

import AppComponentBase from '../../../components/AppComponentBase'
import { isGrantedAny, L } from '../../../lib/abpUtility'
import Stores from '../../../stores/storeIdentifier'
import WfConfigurationStore from '../../../stores/workflow/wfConfigurationStore'
import WfRoleStore from '../../../stores/workflow/wfRoleStore'
import Filter from '../../../components/Filter'
import { appPermissions, modules } from '../../../lib/appconst'
import {
  CustomFieldConfigurationModel,
  PropertyConfigurationModel,
  StatusTransitionModel
} from '../../../models/Workflow/ConfigurationModels'
import TablePropertyConfiguration from './components/tablePropertyConfiguration'
import TableCustomFieldConfiguration from './components/tableCustomFieldConfiguration'
import TableStatusTransition from './components/tableStatusTransition'

const { TabPane } = Tabs
export interface IWfConfigurationProps {
  wfConfigurationStore: WfConfigurationStore
  wfRoleStore: WfRoleStore
  moduleId?: number
}

export interface IWfConfigurationState {
  modalVisible: boolean
  selectedTab: string
  loadedTab: any
  wfPropertyConfig: PropertyConfigurationModel
  wfCustomFieldConfig: CustomFieldConfigurationModel
  wfStatusTransition: StatusTransitionModel
  filters: any
}
const settingTabs = {
  property: 'WF_PROPERTY_CONFIGURE',
  customField: 'WF_CUSTOM_FIELD_CONFIGURE',
  statusTransition: 'WF_STATUS_TRANSITION'
}
@inject(Stores.WfConfigurationStore, Stores.WfRoleStore)
@observer
class WfConfiguration extends AppComponentBase<IWfConfigurationProps, IWfConfigurationState> {
  formRef: any = React.createRef()

  state = {
    modalVisible: false,
    selectedTab: settingTabs.property,
    loadedTab: {},
    wfPropertyConfig: new PropertyConfigurationModel(),
    wfCustomFieldConfig: new CustomFieldConfigurationModel(),
    wfStatusTransition: new StatusTransitionModel(),
    filters: { moduleId: undefined, roleId: undefined }
  }

  async componentDidMount() {
    if (this.props.moduleId) {
      this.setState({
        filters: { moduleId: this.props.moduleId, roleId: undefined }
      })
      this.props.wfRoleStore.getList(this.props.moduleId)
    }
  }

  getConfiguration = async () => {
    if (!this.state.filters.moduleId || !this.state.filters.roleId) {
      return
    }
    switch (this.state.selectedTab) {
      case settingTabs.property: {
        await this.props.wfConfigurationStore.getPropertyConfig(this.state.filters)
        this.setState({
          wfPropertyConfig: this.props.wfConfigurationStore.wfPropertyConfig
        })
        break
      }
      case settingTabs.customField: {
        await this.props.wfConfigurationStore.getCustomFieldConfig(this.state.filters)
        this.setState({
          wfCustomFieldConfig: this.props.wfConfigurationStore.wfCustomFieldConfig
        })
        break
      }
      default: {
        await this.props.wfConfigurationStore.getStatusTransition(this.state.filters)
        this.setState({
          wfStatusTransition: this.props.wfConfigurationStore.wfStatusTransition
        })
      }
    }
  }

  updateConfiguration = async () => {
    switch (this.state.selectedTab) {
      case settingTabs.property: {
        await this.props.wfConfigurationStore.updatePropertyConfig(this.state.wfPropertyConfig)
        break
      }
      case settingTabs.customField: {
        await this.props.wfConfigurationStore.updateCustomFieldConfig(this.state.wfCustomFieldConfig)
        break
      }
      default: {
        await this.props.wfConfigurationStore.updateStatusTransition(this.state.wfStatusTransition)
      }
    }
  }

  handleSearch = (name, value) => {
    this.setState({ filters: { ...this.state.filters, [name]: value } }, async () => {
      if (name === 'moduleId') {
        this.props.wfRoleStore.getList(value)
      }
      await this.getConfiguration()
    })
  }

  handleSelectOrDeselectProperty = (checked, name, statusId, field) => {
    const { wfPropertyConfig } = this.state
    const row = wfPropertyConfig.rows.find((row) => row.propertyName === name)
    if (row) {
      const item = row.items.find((item) => item.statusId === statusId)
      if (item) {
        item[field] = checked
      }
    }

    this.setState({ wfPropertyConfig })
  }

  handleSelectOrDeselectCustomField = (checked, customFieldId, statusId, field) => {
    const { wfCustomFieldConfig } = this.state
    const row = wfCustomFieldConfig.rows.find((row) => row.customFieldId === customFieldId)
    if (row) {
      const item = row.items.find((item) => item.statusId === statusId)
      if (item) {
        item[field] = checked
      }
    }

    this.setState({ wfCustomFieldConfig })
  }

  handleSelectOrDeselectStatusTransition = (checked, statusId, statusToId, field) => {
    const { wfStatusTransition } = this.state
    const row = wfStatusTransition.rows.find((row) => row.statusId === statusId)
    if (row) {
      const item = row.items.find((item) => item.statusId === statusToId)
      if (item) {
        item[field] = checked
      }
    }

    this.setState({ wfStatusTransition })
  }

  onChangeTab = (selectedTab) => {
    const isLoadedTab = this.state.loadedTab[selectedTab]
    this.setState(
      {
        selectedTab,
        loadedTab: { ...this.state.loadedTab, [selectedTab]: true }
      },
      () => {
        if (!isLoadedTab) {
          this.getConfiguration()
        }
      }
    )
  }

  groupActions = (
    <>
      {isGrantedAny(appPermissions.workflow.create, appPermissions.workflow.update) && (
        <Button type="primary" size={'small'} shape="round" icon={<SaveOutlined />} onClick={this.updateConfiguration}>
          {L('BTN_SAVE')}
        </Button>
      )}
    </>
  )

  public render() {
    const { allRoles } = this.props.wfRoleStore
    const { wfPropertyConfig, wfCustomFieldConfig, wfStatusTransition, filters } = this.state

    return (
      <>
        <Filter title={this.L('FILTER')} handleRefresh={this.getConfiguration}>
          <Row gutter={[16, 8]}>
            {!this.props.moduleId && (
              <Col sm={{ span: 8, offset: 0 }}>
                <Select
                  showSearch
                  allowClear
                  className="full-width"
                  onChange={(value) => this.handleSearch('moduleId', value)}
                  placeholder={L('WF_MODULE')}>
                  {this.renderOptions(modules)}
                </Select>
              </Col>
            )}

            <Col sm={{ span: 8, offset: 0 }}>
              <Select
                showSearch
                allowClear
                className="full-width"
                onChange={(value) => this.handleSearch('roleId', value)}
                placeholder={L('WF_ROLE')}
                disabled={!filters.moduleId}>
                {this.renderOptions(allRoles)}
              </Select>
            </Col>
          </Row>
        </Filter>
        <Tabs onChange={this.onChangeTab} activeKey={this.state.selectedTab} tabBarExtraContent={this.groupActions}>
          <TabPane tab={L(settingTabs.property)} key={settingTabs.property}>
            <TablePropertyConfiguration
              loading={this.props.wfConfigurationStore.isLoading}
              wfPropertyConfig={wfPropertyConfig}
              onChange={this.handleSelectOrDeselectProperty}
            />
          </TabPane>
          <TabPane tab={L(settingTabs.customField)} key={settingTabs.customField}>
            <TableCustomFieldConfiguration
              loading={this.props.wfConfigurationStore.isLoading}
              wfCustomFieldConfig={wfCustomFieldConfig}
              onChange={this.handleSelectOrDeselectCustomField}
            />
          </TabPane>
          <TabPane tab={L(settingTabs.statusTransition)} key={settingTabs.statusTransition}>
            <TableStatusTransition
              loading={this.props.wfConfigurationStore.isLoading}
              wfStatusTransition={wfStatusTransition}
              onChange={this.handleSelectOrDeselectStatusTransition}
            />
          </TabPane>
        </Tabs>
      </>
    )
  }
}

export default WfConfiguration
