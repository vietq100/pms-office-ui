import * as React from 'react'

import { Col, Form, Input, Row, Select, Switch, DatePicker, Card, Tabs, Button, Table } from 'antd'
import { DeleteOutlined, MailOutlined } from '@ant-design/icons'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { dateFormat, appPermissions, moduleIds } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import { validateMessages } from '../../../../lib/validation'
import AppComponentBase from '@components/AppComponentBase'
import withRouter from '@components/Layout/Router/withRouter'
import FormTextArea from '@components/FormItem/FormTextArea'
import NoRole from '@components/ComponentNoRole'
import AuditLog from '@components/AuditLog'
import AuditLogStore from '@stores/common/auditLogStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import DevelopStore from '@stores/member/develop/developStore'
import { filterOptions } from '@lib/helper'
import ProjectStore from '@stores/project/projectStore'
import RoleStore from '@stores/administrator/roleStore'
import { groupBy } from 'lodash'

const { formVerticalLayout, genders, align } = AppConsts

const TAB_KEY = {
  RESIDENT_INFO: 'RESIDENT_INFO',
  RESIDENT_LOGS: 'RESIDENT_LOGS'
}
export interface IResidentFormProps {
  navigate: any
  params: any
  developStore: DevelopStore
  auditLogStore: AuditLogStore
  projectStore: ProjectStore
  roleStore: RoleStore
}

@inject(Stores.DevelopStore, Stores.ProjectStore, Stores.RoleStore, Stores.AuditLogStore)
@observer
class DevelopDetail extends AppComponentBase<IResidentFormProps> {
  state = {
    tabActiveKey: TAB_KEY.RESIDENT_INFO,
    selectedProjectId: undefined,
    selectingStaffProject: [] as any,

    displayNames: [],
    columns: [
      {
        title: L('UNIT_PROJECT'),
        dataIndex: 'project',
        key: 'project',
        width: 150,
        render: (project) => <div>{project?.name}</div>
      }
    ]
  }

  formRef: any = React.createRef()

  async componentDidMount() {
    await this.props.roleStore.getAllRoles()
    const { allRoles } = this.props.roleStore
    this.isGranted(appPermissions.resident.detail) &&
      (await Promise.all([this.getDetail(this.props.params?.id), this.props.projectStore.filterOptions({})]))
    const columns = [] as any
    columns.push({
      title: L('ACTIONS'),
      dataIndex: `operation`,
      key: `operation`,
      width: 90,
      align: align.right,
      render: (role, record) => {
        return (
          <Button
            size="small"
            className="ml-1"
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => this.isGranted(appPermissions.resident.update) && this.onRemoveStaffProject(record)}
          />
        )
      }
    })
    this.setState({
      columns: [...this.state.columns, ...columns],
      groupRoles: groupBy(allRoles, 'group')
    })
  }

  buildDisplayName = () => {
    let name = this.formRef.current.getFieldValue('name') || ''
    let surname = this.formRef.current.getFieldValue('surname') || ''
    if (name.length && surname.length) {
      name = name.trim()
      surname = surname.trim()
      this.setState({
        displayNames: [`${name} ${surname}`, `${surname} ${name}`]
      })
    }
  }

  getDetail = async (id?) => {
    if (id) {
      await this.props.developStore.get(id)
      await this.props.developStore.getProjectRoles({ id: this.props?.params?.id }, this.props.roleStore.allRoles)

      this.formRef.current.setFieldsValue({
        ...this.props.developStore.editDevelop
      })
    }
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  changeSelectingStaffProject = (id, project) => {
    this.setState({ selectingStaffProject: project })
  }
  findProjects = async (keyword) => {
    this.props.projectStore.filterOptions({ keyword })
  }
  onRemoveStaffProject = async (project) => {
    await this.props.developStore.removeStaffProject(project)
  }
  onUpdateStaffProject = async () => {
    await this.props.developStore.updateProjectRoles(this.props.developStore.editDevelop.id)
    this.props.navigate(-1)
  }
  addStaffProject = async () => {
    if (this.state.selectingStaffProject.length < 1) {
      return
    }
    const listProjectAdd = this.state.selectingStaffProject.map((item) => ({
      id: item.value,
      name: item.children
    }))

    this.props.developStore.createStaffProject(listProjectAdd, this.props.roleStore.allRoles)
  }
  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })

      if (this.props.developStore.editDevelop?.id) {
        this.isGranted(appPermissions.resident.update) &&
          (await this.props.developStore.update({
            ...this.props.developStore.editDevelop,
            ...values
          }))
      }
      form.resetFields()
      this.setState({ loading: false })
      this.props.navigate(portalLayouts.developManagement.path)
    })
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }} flex="1">
          <Button
            className="mr-1"
            onClick={() => this.props.navigate(portalLayouts.developManagement.path)}
            shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === 'PROJECT_ROLE' && isGrantedAny(appPermissions.staff.create, appPermissions.staff.update) && (
            <Button
              type="primary"
              className="mr-1"
              onClick={this.onUpdateStaffProject}
              loading={isLoading}
              shape="round">
              {L('BTN_UPDATE_PROJECT_ROLE')}
            </Button>
          )}
          {tabActiveKey === TAB_KEY.RESIDENT_INFO &&
            isGrantedAny(appPermissions.resident.create, appPermissions.resident.update) && (
              <>
                <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
                  {L('BTN_SAVE')}
                </Button>
              </>
            )}
        </Col>
      </Row>
    )
  }

  render() {
    const { displayNames, selectedProjectId, columns } = this.state

    const {
      developStore,
      projectStore: { projectOptions }
    } = this.props
    const { isLoading, staffProjectRoles } = developStore

    const disabledDate = (current) => {
      return current > new Date() ? true : false
    }
    return this.isGranted(appPermissions.resident.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} id="resident-detail" style={{ minHeight: 750 }}>
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={L('RESIDENT_TAB_INFO')} key={TAB_KEY.RESIDENT_INFO}>
              <Form
                ref={this.formRef}
                layout={'vertical'}
                onFinish={this.onSave}
                onValuesChange={() => this.setState({ isDirty: true })}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('RESIDENT_USER_NAME')} {...formVerticalLayout} name="userName">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('RESIDENT_EMAIL')}
                      {...formVerticalLayout}
                      name="emailAddress"
                      rules={rules.emailAddress}>
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('STAFF_PHONE')}
                      {...formVerticalLayout}
                      name="phoneNumber"
                      rules={rules.phoneNumber}>
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('RESIDENT_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                      <Input onChange={this.buildDisplayName} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('RESIDENT_SURNAME')}
                      {...formVerticalLayout}
                      name="surname"
                      rules={rules.surname}>
                      <Input onChange={this.buildDisplayName} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('RESIDENT_DISPLAY_NAME')}
                      {...formVerticalLayout}
                      name="displayName"
                      rules={rules.displayName}>
                      <Select style={{ width: '100%' }}>
                        {displayNames.map((item: any, index) => (
                          <Select.Option key={index} value={item}>
                            {item}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('RESIDENT_DOB')} {...formVerticalLayout} name="birthDate">
                      <DatePicker
                        disabledDate={disabledDate}
                        className="full-width"
                        format={dateFormat}
                        placeholder={L('SELECT_DATE')}
                      />
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('RESIDENT_GENDER')} {...formVerticalLayout} name="gender">
                      <Select style={{ width: '100%' }}>
                        {genders.map((gender: any, index) => (
                          <Select.Option key={index} value={gender.value}>
                            {L(gender.name)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('RESIDENT_ACTIVE_STATUS')}
                      {...formVerticalLayout}
                      name="isActive"
                      valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FormTextArea label={L('DESCRIPTION')} name="description" />
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>

            {this.props.params?.id && (
              <>
                <Tabs.TabPane
                  tab={L('STAFF_TAB_PROJECTS')}
                  key="PROJECT_ROLE"
                  disabled={!this.props.developStore.editDevelop?.id}>
                  <Row gutter={[8, 8]}>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Select
                        showSearch
                        allowClear
                        mode="multiple"
                        className="full-width"
                        filterOption={filterOptions}
                        value={selectedProjectId}
                        onChange={this.changeSelectingStaffProject}>
                        {this.renderOptions(projectOptions)}
                      </Select>
                    </Col>
                    {this.isGranted(appPermissions.staff.update) && (
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Button className="mr-1" onClick={this.addStaffProject}>
                          {L('BTN_ADD_STAFF_PROJECT')}
                        </Button>
                      </Col>
                    )}
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Table
                        size="middle"
                        rowKey={(record) => record.project.id}
                        columns={columns}
                        dataSource={(staffProjectRoles || []).map((item) => item)}
                        scroll={{ y: 400 }}
                      />
                    </Col>
                  </Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab={L('RESIDENT_LOGS')} key={TAB_KEY.RESIDENT_LOGS}>
                  <AuditLog
                    moduleId={moduleIds.resident}
                    parentId={this.props.developStore.editDevelop?.id}
                    auditLogStore={this.props.auditLogStore}
                  />
                </Tabs.TabPane>
              </>
            )}
          </Tabs>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(DevelopDetail)
