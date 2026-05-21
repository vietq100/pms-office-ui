import * as React from 'react'
import { Col, Form, Input, Modal, Row } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { L, LError, LNotification, isGrantedAny } from '../../../lib/abpUtility'
import AppConsts, { appPermissions } from '../../../lib/appconst'
import accountServices from '../../../services/account/accountService'
import { notifySuccess } from '../../../lib/helper'

const { formVerticalLayout } = AppConsts
const rules = {
  adminPassword: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('ADMIN_PASSWORD'))
    }
  ],
  newPassword: [
    {
      required: true,
      message: LError('REQUIRED_FIELD_{0}', L('NEW_USER_PASSWORD'))
    },
    { min: 6, message: LError('MIN_FIELD_LENGTH_{0}', 6) },
    { max: 256, message: LError('MAX_FIELD_LENGTH_{0}', 256) }
  ]
}

export interface IResetPasswordProps {
  visible: boolean
  userId: number
  onCancel: () => void
}

class ResetPasswordFormModal extends React.Component<IResetPasswordProps, any> {
  formRef: any = React.createRef()
  state = { loading: false }

  onSave = () => {
    const { onCancel, userId } = this.props
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })
      await accountServices.adminResetPassword({ ...values, userId }).finally(() => this.setState({ loading: false }))
      notifySuccess(LNotification('SUCCESS'), LNotification('SAVING_SUCCESSFULLY'))
      form.resetFields()
      onCancel && onCancel()
    })
  }

  render() {
    const { visible, onCancel } = this.props
    const { formRef } = this

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_RESET')}
        onCancel={onCancel}
        onOk={() => isGrantedAny(appPermissions.staff.update, appPermissions.resident.update) && this.onSave()}
        title={L('RESET_PASSWORD_MODAL_TITLE')}
        confirmLoading={this.state.loading}>
        <Form ref={formRef} layout={'vertical'} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('ADMIN_PASSWORD')}
                {...formVerticalLayout}
                name="adminPassword"
                rules={rules.adminPassword}>
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('NEW_USER_PASSWORD')}
                {...formVerticalLayout}
                name="newPassword"
                rules={rules.newPassword}>
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ResetPasswordFormModal
