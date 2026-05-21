import * as React from 'react'

import { Col, Form, Input, Modal, Row } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { L } from '../../../../../lib/abpUtility'
import { ruleChangePassword } from './validation'
import accountServices from '../../../../../services/account/accountService'
import AppConsts from '../../../../../lib/appconst'
import { validateMessages } from '@lib/validation'
const { formVerticalLayout } = AppConsts

export interface IUnitFormProps {
  visible: boolean
  onCancel: () => void
  onCreate: () => void
}

class ChangePasswordModal extends React.Component<IUnitFormProps> {
  state = {
    loading: false
  }

  formRef: any = React.createRef()

  handleChangePassword = () => {
    const { onCreate } = this.props
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })
      await accountServices.changePassword(values).finally(() => this.setState({ loading: false }))
      form.resetFields()
      onCreate && onCreate()
    })
  }

  render() {
    const { visible, onCancel } = this.props

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={() => {
          onCancel(), this.formRef.current.resetFields()
        }}
        onOk={this.handleChangePassword}
        title={L('CHANGE_PASSWORD_TILE')}
        confirmLoading={this.state.loading}>
        <Form ref={this.formRef} layout={'vertical'} size="middle" validateMessages={validateMessages}>
          <Row>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('CHANGE_PASSWORD_PASSWORD')}
                {...formVerticalLayout}
                name="currentPassword"
                rules={ruleChangePassword.currentPassword}>
                <Input type="password" prefix={<LockOutlined className="site-form-item-icon" />} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('CHANGE_PASSWORD_NEW_PASSWORD')}
                {...formVerticalLayout}
                name="newPassword"
                rules={ruleChangePassword.newPassword}>
                <Input type="password" prefix={<LockOutlined className="site-form-item-icon" />} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('CHANGE_PASSWORD_NEW_PASSWORD_RETYPE')}
                {...formVerticalLayout}
                name="newPasswordReType"
                rules={ruleChangePassword.newPasswordReType}>
                <Input type="password" prefix={<LockOutlined className="site-form-item-icon" />} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ChangePasswordModal
