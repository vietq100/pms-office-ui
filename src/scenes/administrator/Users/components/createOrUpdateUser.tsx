import * as React from 'react'

import { Checkbox, Input, Modal, Tabs, Form, Col, Row, Select } from 'antd'
import { GetRoles } from '@services/administrator/user/dto/getRolesOuput'
import { L } from '@lib/abpUtility'
import rules from './createOrUpdateUser.validation'
import { validateMessages } from '@lib/validation'
import AppConsts from '@lib/appconst'

const { formVerticalLayout } = AppConsts
const TabPane = Tabs.TabPane

export interface ICreateOrUpdateUserProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  roles: GetRoles[]
  formRef: any
}

class CreateOrUpdateUser extends React.Component<ICreateOrUpdateUserProps> {
  state = {
    confirmDirty: false,
    displayNames: []
  }

  buildDisplayName = () => {
    let name = this.props.formRef.current.getFieldValue('name') || ''
    let surname = this.props.formRef.current.getFieldValue('surname') || ''
    if (name.length && surname.length) {
      name = name.trim()
      surname = surname.trim()
      this.setState({
        displayNames: [`${name} ${surname}`, `${surname} ${name}`]
      })
    }
  }

  compareToFirstPassword = (rule: any, value: any, callback: any) => {
    const form = this.props.formRef.current
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  validateToNextPassword = (rule: any, value: any, callback: any) => {
    const form = this.props.formRef.current
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  render() {
    const { roles } = this.props
    const { visible, onCancel, onCreate } = this.props
    const { displayNames } = this.state

    const options = roles.map((x: GetRoles) => {
      return { label: x.displayName, value: x.normalizedName }
    })

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={'User'}>
        <Form ref={this.props.formRef} validateMessages={validateMessages} layout={'vertical'} size="middle">
          <Tabs defaultActiveKey={'userInfo'} size={'small'}>
            <TabPane tab={'User'} key={'user'}>
              <Row gutter={[16, 0]}>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item label={L('Name')} {...formVerticalLayout} name="name" rules={rules.name}>
                    <Input onChange={this.buildDisplayName} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item label={L('Surname')} {...formVerticalLayout} name="surname" rules={rules.surname}>
                    <Input onChange={this.buildDisplayName} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
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
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item label={L('UserName')} {...formVerticalLayout} name="userName" rules={rules.userName}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item label={L('Email')} {...formVerticalLayout} name="emailAddress" rules={rules.emailAddress}>
                    <Input />
                  </Form.Item>
                </Col>
                {this.props.modalType === 'edit' ? (
                  <Col sm={{ span: 12, offset: 0 }}>
                    <Form.Item
                      label={L('Password')}
                      {...formVerticalLayout}
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: 'Please input your password!'
                        },
                        {
                          validator: this.validateToNextPassword
                        }
                      ]}>
                      <Input type="password" />
                    </Form.Item>
                  </Col>
                ) : null}
                {this.props.modalType === 'edit' ? (
                  <Col sm={{ span: 12, offset: 0 }}>
                    <Form.Item
                      label={L('ConfirmPassword')}
                      {...formVerticalLayout}
                      name="confirm"
                      rules={[
                        {
                          required: true,
                          message: L('ConfirmPassword')
                        },
                        {
                          validator: this.compareToFirstPassword
                        }
                      ]}>
                      <Input type="password" />
                    </Form.Item>
                  </Col>
                ) : null}
                <Col sm={{ span: 12, offset: 0 }}>
                  <Form.Item label={L('ACTIVE_STATUS')} {...formVerticalLayout} name="isActive" valuePropName="checked">
                    <Checkbox> </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab={L('Roles')} key={'rol'}>
              <Form.Item {...formVerticalLayout} name="roleNames">
                <Checkbox.Group>
                  <Row>
                    {(options || []).map((item, index) => (
                      <Col span={12} key={index}>
                        <Checkbox value={item.value}>{item.label}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    )
  }
}

export default CreateOrUpdateUser
