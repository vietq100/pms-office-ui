import React from 'react'

import { Col, Form, Input, Row, Select, Switch, DatePicker, Card, Table, Tabs, Modal, Button, Checkbox } from 'antd'
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { L, LNotification, isGrantedAny } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { moduleAvatar, dateFormat, appPermissions, defaultAvatar } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import StaffStore from '../../../../stores/member/staff/staffStore'
import RoleStore from '../../../../stores/administrator/roleStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import AvatarUpload from '../../../../components/FileUpload/AvatarUpload'
import UserStore from '../../../../stores/administrator/userStore'
import { filterOptions } from '../../../../lib/helper'
import { validateMessages } from '../../../../lib/validation'
import groupBy from 'lodash/groupBy'
import withRouter from '@components/Layout/Router/withRouter'
import FormTextArea from '@components/FormItem/FormTextArea'
import NoRole from '@components/ComponentNoRole'

const { align, formVerticalLayout, genders } = AppConsts
const { confirm } = Modal

export interface IStaffFormProps {
  navigate: any
  params: any
  staffStore: StaffStore
  projectStore: ProjectStore
  roleStore: RoleStore
  userStore: UserStore
}

@inject(Stores.StaffStore, Stores.UserStore, Stores.ProjectStore, Stores.RoleStore)
@observer
class StaffCreate extends AppComponentBase<IStaffFormProps> {
  state = {
    isDirty: false,
    tabActiveKey: 'STAFF_INFO',
    selectingStaffProject: {} as any,
    staffProjects: [] as any,
    displayNames: [],
    selectedProjectId: undefined,
    groupRoles: [] as any,
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
    // Need to wait to get all role first. If not -> the logic will be wrong
    await this.props.roleStore.getAllRoles()
    const { allRoles } = this.props.roleStore

    this.isGranted(appPermissions.staff.detail) &&
      (await Promise.all([
        await this.getDetail(this.props?.params?.id),

        await this.props.projectStore.filterOptions({})
      ]))
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
            onClick={() => this.onRemoveStaffProject(record)}
          />
        )
      }
    })
    this.setState({
      columns: [...this.state.columns, ...columns],
      groupRoles: groupBy(allRoles, 'group')
    })
  }

  componentWillUnmount() {
    this.props.userStore.editUserProfilePicture = defaultAvatar
    this.props.staffStore.createStaff()
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.props.staffStore.createStaff()
    } else {
      // Need to wait to get all role first. If not -> the logic will be wrong
      await this.props.staffStore.getProjectRoles({ id: this.props?.params?.id }, this.props.roleStore.allRoles)
      await this.props.staffStore.get(id)
    }
    this.formRef.current.setFieldsValue({ ...this.props.staffStore.editStaff })
  }

  findProjects = async (keyword) => {
    this.props.projectStore.filterOptions({ keyword })
  }

  changeSelectingStaffProject = (id, project) => {
    this.setState({ selectingStaffProject: project })
  }

  addStaffProject = async () => {
    if (!this.state.selectingStaffProject || !this.state.selectingStaffProject.value) {
      return
    }
    const project = {
      id: this.state.selectingStaffProject.value,
      name: this.state.selectingStaffProject?.children
    }
    this.props.staffStore.createStaffProject(project, this.props.roleStore.allRoles)
    this.setState({ staffProjects: [...this.state.staffProjects, { project }] })
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

  onUpdateStaffProject = async () => {
    await this.props.staffStore.updateProjectRoles(this.props.staffStore.editStaff.id)
    this.props.navigate(-1)
  }

  onRemoveStaffProject = async (project) => {
    await this.props.staffStore.removeStaffProject(project)
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.staffStore.editStaff?.id) {
        await this.props.staffStore.update({
          ...this.props.staffStore.editStaff,
          ...values
        })
      } else {
        await this.props.staffStore.create(values)
      }

      this.props.navigate(-1)
    })
  }

  onCancel = () => {
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          this.props.navigate(-1)
        }
      })
      return
    }
    this.props.navigate(-1)
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
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
          {tabActiveKey === 'STAFF_INFO' && isGrantedAny(appPermissions.staff.create, appPermissions.staff.update) && (
            <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
        </Col>
      </Row>
    )
  }

  render() {
    const disabledDate = (current) => {
      return current > new Date() ? true : false
    }
    const { displayNames, columns, selectedProjectId, groupRoles } = this.state
    const {
      staffStore: { staffProjectRoles, isLoading },
      projectStore: { projectOptions }
    } = this.props
    // const profilePictureUrl = this.props.userStore.editUserProfilePicture
    return this.isGranted(appPermissions.staff.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} id="staff-detail">
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={L('STAFF_TAB_INFO')} key="STAFF_INFO">
              <Form
                ref={this.formRef}
                layout={'vertical'}
                onFinish={this.onSave}
                onAbort={this.onCancel}
                onValuesChange={() => this.setState({ isDirty: true })}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('STAFF_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                      <Input onChange={this.buildDisplayName} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('STAFF_SURNAME')} {...formVerticalLayout} name="surname" rules={rules.surname}>
                      <Input onChange={this.buildDisplayName} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('STAFF_FULL_NAME')}
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
                    <Form.Item
                      label={L('STAFF_USER_NAME')}
                      {...formVerticalLayout}
                      name="userName"
                      rules={rules.userName}>
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('STAFF_EMAIL')}
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
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('STAFF_IDENTITY_NUMBER')}
                      {...formVerticalLayout}
                      name="identityNumber"
                      rules={rules.identityNumber}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('STAFF_PASSPORT')}
                      {...formVerticalLayout}
                      name="passport"
                      rules={rules.passport}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('STAFF_DOB')} {...formVerticalLayout} name="birthDate">
                      <DatePicker
                        disabledDate={disabledDate}
                        className="full-width"
                        format={dateFormat}
                        placeholder={L('SELECT_DATE')}
                      />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('STAFF_GENDER')} {...formVerticalLayout} name="gender">
                      <Select style={{ width: '100%' }}>
                        {genders.map((gender: any, index) => (
                          <Select.Option key={index} value={gender.value}>
                            {L(gender.name)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {!this.props.staffStore?.editStaff?.id && (
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item
                        label={L('STAFF_PASSWORD')}
                        {...formVerticalLayout}
                        name="password"
                        rules={rules.password}>
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
                      </Form.Item>
                    </Col>
                  )}
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('STAFF_ACTIVE_STATUS')}
                      {...formVerticalLayout}
                      name="isActive"
                      valuePropName="checked">
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 0]}>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FormTextArea label={L('DESCRIPTION')} name="description" />
                  </Col>
                </Row>
                {this.props.staffStore?.editStaff?.id ? (
                  <Col sm={{ span: 2, offset: 0 }}>
                    <Form.Item label={L('IMAGE')}>
                      <AvatarUpload
                        userStore={this.props.userStore}
                        module={moduleAvatar.staff}
                        parentId={this.props.staffStore.editStaff?.id}
                        profilePictureId={this.props.staffStore.editStaff?.profilePictureId}></AvatarUpload>
                    </Form.Item>
                  </Col>
                ) : (
                  <></>
                )}
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item label={L('STAFF_ROLES')} {...formVerticalLayout} name="roleNames">
                    <Checkbox.Group className="d-block">
                      {Object.keys(groupRoles).map((group, index) => (
                        <Row key={index}>
                          <Col span={24}>
                            <b>{group}</b>
                          </Col>
                          {(groupRoles[group] || []).map((role, childIndex) => (
                            <Col span={8} key={childIndex}>
                              <Checkbox value={role.normalizedName} className="text-truncate">
                                {role.displayName}
                              </Checkbox>
                            </Col>
                          ))}
                        </Row>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                </Col>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={L('STAFF_TAB_PROJECTS')}
              key="PROJECT_ROLE"
              disabled={!this.props.staffStore.editStaff?.id}>
              <Row gutter={[8, 8]}>
                <Col sm={{ span: 8, offset: 0 }}>
                  <Select
                    showSearch
                    allowClear
                    className="full-width"
                    filterOption={filterOptions}
                    value={selectedProjectId}
                    onSelect={this.changeSelectingStaffProject}>
                    {this.renderOptions(projectOptions)}
                  </Select>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <Button className="mr-1" onClick={this.addStaffProject}>
                    {L('BTN_ADD_STAFF_PROJECT')}
                  </Button>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Table
                    size="middle"
                    rowKey={(record: any) => record.project.id}
                    columns={columns}
                    dataSource={(staffProjectRoles || []).map((item) => item)}
                    scroll={{ y: 400 }}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(StaffCreate)
