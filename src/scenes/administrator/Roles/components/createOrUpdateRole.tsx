import * as React from 'react'

import { Input, Modal, Tabs, Form, Checkbox } from 'antd'
import { GetAllPermissionsOutput } from '@services/administrator/role/dto/getAllPermissionsOutput'
import { L, LCategory } from '@lib/abpUtility'
import RoleStore from '../../../../stores/administrator/roleStore'
import rules from './createOrUpdateRole.validation'
import { validateMessages } from '@lib/validation'
import groupBy from 'lodash/groupBy'
import AppConst from '@lib/appconst'
import Col from 'antd/lib/grid/col'
import Row from 'antd/lib/grid/row'
import orderBy from 'lodash/orderBy'
import './roleModal.less'

const { formVerticalLayout } = AppConst
const TabPane = Tabs.TabPane
const { TextArea } = Input

export interface ICreateOrUpdateRoleProps {
  roleStore: RoleStore
  visible: boolean
  onCancel: () => void
  modalType: string
  onOk: (grantedPermissions) => void
  permissions: GetAllPermissionsOutput[]
  grantedPermissions: any
  formRef: any
}

class CreateOrUpdateRole extends React.Component<ICreateOrUpdateRoleProps> {
  state = {
    confirmDirty: false,
    groupPermissionAdmins: [] as any,
    groupPermissionUsers: [] as any
  }

  componentDidUpdate(prevProps: Readonly<ICreateOrUpdateRoleProps>): void {
    if (!prevProps.visible && this.props.visible) {
      const permissionAdmin = this.props.permissions.filter((permission) =>
        permission.name.startsWith('PagesAdministration.')
      )
      const permissionUser = this.props.permissions.filter((permission) => permission.name.startsWith('PagesUser.'))

      this.setState({
        groupPermissionAdmins: this.handleGroupPermission(permissionAdmin),
        groupPermissionUsers: this.handleGroupPermission(permissionUser)
      })
    }
  }

  handleGroupPermission(permissions) {
    const groupPermissionObject = groupBy(permissions, 'parentName')
    let groupPermissions = Object.keys(groupPermissionObject).reduce((groupPermissions, key) => {
      // No need to get page permission because it's include in group
      if (key === 'PagesAdministration' || key === 'PagesUser') {
        return groupPermissions
      }
      const selectedPermissions = groupPermissionObject[key].filter(
        (permission) =>
          this.props.grantedPermissions.findIndex((grantedPermission) => grantedPermission === permission.name) !== -1
      )
      groupPermissions.push({
        name: key,
        displayName: LCategory(key),
        isSelected: this.props.grantedPermissions.findIndex((grantedPermission) => grantedPermission === key) !== -1,
        childs: orderBy(groupPermissionObject[key], 'order'),
        selectedPermissions: selectedPermissions.map((item) => item.name)
      })
      return groupPermissions
    }, [] as any)
    groupPermissions = orderBy(groupPermissions, 'displayName')
    return groupPermissions
  }

  selectOrDeselectGroup(groupIndex, isUser?) {
    if (isUser) {
      const { groupPermissionUsers } = this.state
      groupPermissionUsers[groupIndex].isSelected = !groupPermissionUsers[groupIndex].isSelected
      groupPermissionUsers[groupIndex].selectedPermissions = groupPermissionUsers[groupIndex].isSelected
        ? groupPermissionUsers[groupIndex].childs.map((item) => item.name)
        : []

      this.setState({ groupPermissionUsers })
      return
    }
    const { groupPermissionAdmins } = this.state
    groupPermissionAdmins[groupIndex].isSelected = !groupPermissionAdmins[groupIndex].isSelected
    groupPermissionAdmins[groupIndex].selectedPermissions = groupPermissionAdmins[groupIndex].isSelected
      ? groupPermissionAdmins[groupIndex].childs.map((item) => item.name)
      : []

    this.setState({ groupPermissionAdmins })
  }

  selectOrDeselectPermissionChild(groupIndex, checkedValues, isUser?) {
    if (isUser) {
      const { groupPermissionUsers } = this.state
      groupPermissionUsers[groupIndex].selectedPermissions = checkedValues
      this.setState({ groupPermissionUsers })
      return
    }
    const { groupPermissionAdmins } = this.state
    groupPermissionAdmins[groupIndex].selectedPermissions = checkedValues
    this.setState({ groupPermissionAdmins })
  }

  onSave = () => {
    const grantedPermissions = [] as any
    const { groupPermissionAdmins, groupPermissionUsers } = this.state
    ;[...groupPermissionAdmins, ...groupPermissionUsers].forEach((group) => {
      if (group.isSelected) {
        grantedPermissions.push(group.name)
      }
      group.selectedPermissions.forEach((selectedPermission) => {
        if (grantedPermissions.findIndex((permission) => permission === selectedPermission) === -1) {
          grantedPermissions.push(selectedPermission)
        }
      })
    })

    this.props.onOk(grantedPermissions)
  }

  render() {
    const { groupPermissionAdmins } = this.state

    return (
      <Modal
        open={this.props.visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={this.props.onCancel}
        title={L('ST_ROLE')}
        onOk={this.onSave}
        width={800}
        confirmLoading={this.props.roleStore.isLoading}>
        <Form ref={this.props.formRef} validateMessages={validateMessages} layout={'vertical'} size="middle">
          <Tabs defaultActiveKey={'role'} size={'small'} tabBarGutter={64}>
            <TabPane tab={L('ST_ROLE_INFO')} key={'role'}>
              <Form.Item label={L('ST_ROLE_UNIQUE_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
                <Input />
              </Form.Item>
              <Form.Item
                label={L('ST_ROLE_DISPLAY_NAME')}
                {...formVerticalLayout}
                name="displayName"
                rules={rules.displayName}>
                <Input />
              </Form.Item>
              <Form.Item label={L('ST_ROLE_DESCRIPTION')} {...formVerticalLayout} name="description">
                <TextArea />
              </Form.Item>
            </TabPane>
            <TabPane tab={L('ST_ROLE_ADMIN_PERMISSION')} key={'admin-permission'}>
              {groupPermissionAdmins.map((groupPermission, index) => (
                <div className="group-permission-item" key={index}>
                  <div className="group-label">
                    <Checkbox checked={groupPermission.isSelected} onChange={() => this.selectOrDeselectGroup(index)}>
                      {groupPermission.displayName}
                    </Checkbox>
                  </div>
                  <Checkbox.Group
                    className="full-width pt-3 mt-2"
                    onChange={(checkedValues) => this.selectOrDeselectPermissionChild(index, checkedValues)}
                    value={groupPermission.selectedPermissions}>
                    <Row>
                      {groupPermission.childs.map((permission, childIndex) => (
                        <Col span={8} key={childIndex}>
                          <Checkbox value={permission.name} className="text-truncate">
                            {permission.displayName}
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </div>
              ))}
            </TabPane>
            {/*<TabPane tab={L('ST_ROLE_USER_PERMISSION')} key={'user-permission'}>*/}
            {/*  {groupPermissionUsers.map((groupPermission, index) =>*/}
            {/*    <div className="group-permission-item" key={index}>*/}
            {/*      <div className="group-label">*/}
            {/*        <Checkbox checked={groupPermission.isSelected}*/}
            {/*                  onChange={() => this.selectOrDeselectGroup(index, true)}>*/}
            {/*          {LCategory(groupPermission.name)}*/}
            {/*        </Checkbox>*/}
            {/*      </div>*/}
            {/*      <Checkbox.Group className="full-width pt-3 mt-2"*/}
            {/*                      onChange={(checkedValues) => 
              this.selectOrDeselectPermissionChild(index, checkedValues, true)}*/}
            {/*                      value={groupPermission.selectedPermissions}>*/}
            {/*        <Row>*/}
            {/*          {groupPermission.childs.map((permission, childIndex) =>*/}
            {/*            <Col span={8} key={childIndex}>*/}
            {/*              <Checkbox value={permission.name} className="text-truncate">*/}
            {/*                {permission.displayName}*/}
            {/*              </Checkbox>*/}
            {/*            </Col>)*/}
            {/*          }*/}
            {/*        </Row>*/}
            {/*      </Checkbox.Group>*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*</TabPane>*/}
          </Tabs>
        </Form>
      </Modal>
    )
  }
}

export default CreateOrUpdateRole
