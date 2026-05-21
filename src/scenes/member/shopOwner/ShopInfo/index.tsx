import React from 'react'

import { Col, Form, Input, Row, Select, Switch, DatePicker, Card, Table, Tabs, Modal, Button, Checkbox } from 'antd'
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { L, LNotification, isGrantedAny } from '../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { moduleAvatar, dateFormat, appPermissions, defaultAvatar } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import ShopOwnerStore from '../../../../stores/member/shopOwner/shopOwnerStore'
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

const { align, formVerticalLayout, genders } = AppConsts
const { confirm } = Modal

export interface IShopOwnerFormProps {
  params: any
  navigate: any
  shopOwnerStore: ShopOwnerStore
  projectStore: ProjectStore
  roleStore: RoleStore
  userStore: UserStore
}

@inject(Stores.ShopOwnerStore, Stores.UserStore, Stores.ProjectStore, Stores.RoleStore)
@observer
class ShopOwnerInfo extends AppComponentBase<IShopOwnerFormProps> {
  state = {
    isDirty: false,
    tabActiveKey: 'SHOP_OWNER_INFO',
    selectingShopOwnerProject: {} as any,
    shopOwnerProjects: [] as any,
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
    await this.getDetail(this.props.params?.id)
    const { allRoles } = this.props.roleStore

    const columns = [] as any
    columns.push({
      title: L('ACTIONS'),
      dataIndex: `operation`,
      key: `operation`,
      width: 150,
      align: align.right,
      render: (role, record) => {
        return (
          <Button
            size="small"
            className="ml-1"
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => this.onRemoveShopOwnerProject(record)}
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
    this.props.shopOwnerStore.createShopOwner()
  }

  getDetail = async (id?) => {
    if (!id) {
      await this.props.shopOwnerStore.createShopOwner()
    } else {
      // Need to wait to get all role first. If not -> the logic will be wrong
      // await this.props.shopOwnerStore.getProjectRoles({ id: this.props.params?.id }, this.props.roleStore.allRoles)
      await this.props.shopOwnerStore.get(id)
    }
    this.formRef.current.setFieldsValue({
      ...this.props.shopOwnerStore.editShopOwner
    })
  }

  findProjects = async (keyword) => {
    this.props.projectStore.filterOptions({ keyword })
  }

  changeSelectingShopOwnerProject = (id, project) => {
    this.setState({ selectingShopOwnerProject: project })
  }

  addShopOwnerProject = async () => {
    if (!this.state.selectingShopOwnerProject || !this.state.selectingShopOwnerProject.value) {
      return
    }
    const project = {
      id: this.state.selectingShopOwnerProject.value,
      name: this.state.selectingShopOwnerProject?.children
    }
    this.props.shopOwnerStore.createShopOwnerProject(project, this.props.roleStore.allRoles)
    this.setState({
      shopOwnerProjects: [...this.state.shopOwnerProjects, { project }]
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

  onUpdateShopOwnerProject = async () => {
    await this.props.shopOwnerStore.updateProjectRoles(this.props.shopOwnerStore.editShopOwner.id)
    this.props.navigate(-1)
  }

  onRemoveShopOwnerProject = async (project) => {
    await this.props.shopOwnerStore.removeShopOwnerProject(project)
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.shopOwnerStore.editShopOwner?.id) {
        await this.props.shopOwnerStore.update(
          {
            ...this.props.shopOwnerStore.editShopOwner,
            ...values
          },
          null
        )
      } else {
        await this.props.shopOwnerStore.create(values, null)
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
          {tabActiveKey === 'PROJECT_ROLE' &&
            isGrantedAny(appPermissions.shopOwner.create, appPermissions.shopOwner.update) && (
              <Button
                type="primary"
                className="mr-1"
                onClick={this.onUpdateShopOwnerProject}
                loading={isLoading}
                shape="round">
                {L('BTN_UPDATE_PROJECT_ROLE')}
              </Button>
            )}
          {tabActiveKey === 'SHOP_OWNER_INFO' &&
            isGrantedAny(appPermissions.shopOwner.create, appPermissions.shopOwner.update) && (
              <Button type="primary" onClick={this.onSave} loading={isLoading} shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }

  render() {
    const { columns, selectedProjectId, groupRoles } = this.state
    const {
      shopOwnerStore: { shopOwnerProjectRoles, isLoading },
      projectStore: { projectOptions }
    } = this.props
    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card
          bordered={false}
          id="shop-owner-detail"
          cover={
            <div style={{ position: 'relative' }}>
              <div className="cover-avatar" />
              <div style={{ position: 'absolute', bottom: 0, right: '30px' }}>
                <AvatarUpload
                  userStore={this.props.userStore}
                  module={moduleAvatar.shopOwner}
                  parentId={this.props.shopOwnerStore.editShopOwner?.id}
                  profilePictureId={this.props.shopOwnerStore.editShopOwner?.profilePictureId}></AvatarUpload>
              </div>
            </div>
          }>
          <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab}>
            <Tabs.TabPane tab={L('SHOP_OWNER_TAB_INFO')} key="SHOP_OWNER_INFO">
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
                    <Form.Item label={L('SHOP_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                      <Input onChange={this.buildDisplayName} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('SHOP_OWNER_USER_NAME')}
                      {...formVerticalLayout}
                      name="userName"
                      rules={rules.userName}>
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('SHOP_OWNER_EMAIL')}
                      {...formVerticalLayout}
                      name="emailAddress"
                      rules={rules.emailAddress}>
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('SHOP_OWNER_PHONE')}
                      {...formVerticalLayout}
                      name="phoneNumber"
                      rules={rules.phoneNumber}>
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('SHOP_OWNER_IDENTITY_NUMBER')}
                      {...formVerticalLayout}
                      name="identityNumber"
                      rules={rules.identityNumber}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('SHOP_OWNER_PASSPORT')}
                      {...formVerticalLayout}
                      name="passport"
                      rules={rules.passport}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('SHOP_OWNER_DOB')} {...formVerticalLayout} name="birthDate">
                      <DatePicker className="full-width" format={dateFormat} placeholder={L('SELECT_DATE')} />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item label={L('SHOP_OWNER_GENDER')} {...formVerticalLayout} name="gender">
                      <Select style={{ width: '100%' }}>
                        {genders.map((gender: any, index) => (
                          <Select.Option key={index} value={gender.value}>
                            {L(gender.name)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {!this.props.shopOwnerStore?.editShopOwner?.id && (
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item
                        label={L('SHOP_OWNER_PASSWORD')}
                        {...formVerticalLayout}
                        name="password"
                        rules={rules.password}>
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
                      </Form.Item>
                    </Col>
                  )}
                  <Col sm={{ span: 8, offset: 0 }}>
                    <Form.Item
                      label={L('SHOP_OWNER_ACTIVE_STATUS')}
                      {...formVerticalLayout}
                      name="isActive"
                      valuePropName="checked">
                      <Switch defaultChecked />
                    </Form.Item>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <Form.Item label={L('SHOP_OWNER_ROLES')} {...formVerticalLayout} name="roleNames">
                      <Checkbox.Group className="full-width">
                        {Object.keys(groupRoles).map((group, index) => (
                          <Row key={index}>
                            <Col span={24}>
                              <b>{group}</b>
                            </Col>
                            {(groupRoles[group] || []).map((role, childIndex) => (
                              <Col span={8} key={childIndex}>
                                <Checkbox value={role.name} className="text-truncate">
                                  {role.displayName}
                                </Checkbox>
                              </Col>
                            ))}
                          </Row>
                        ))}
                      </Checkbox.Group>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={L('SHOP_OWNER_TAB_PROJECTS')}
              key="PROJECT_ROLE"
              disabled={!this.props.shopOwnerStore.editShopOwner?.id}>
              <Row gutter={[8, 8]}>
                <Col sm={{ span: 8, offset: 0 }}>
                  <Select
                    showSearch
                    allowClear
                    className="full-width"
                    filterOption={filterOptions}
                    value={selectedProjectId}
                    onSelect={this.changeSelectingShopOwnerProject}>
                    {this.renderOptions(projectOptions)}
                  </Select>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <Button className="mr-1" onClick={this.addShopOwnerProject}>
                    {L('BTN_ADD_SHOP_OWNER_PROJECT')}
                  </Button>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Table
                    size="middle"
                    rowKey={(record) => record.project.id}
                    columns={columns}
                    dataSource={(shopOwnerProjectRoles || []).map((item) => item)}
                    scroll={{ y: 400 }}
                  />
                </Col>
              </Row>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </WrapPageScroll>
    )
  }
}

export default withRouter(ShopOwnerInfo)
