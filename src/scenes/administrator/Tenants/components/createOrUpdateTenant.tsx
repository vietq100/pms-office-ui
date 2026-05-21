import * as React from 'react'

import { Checkbox, Col, Input, Modal, Form } from 'antd'

import { L } from '../../../../lib/abpUtility'
import rules from './createOrUpdateTenant.validation'
import { validateMessages } from '../../../../lib/validation'

export interface ICreateOrUpdateTenantProps {
  visible: boolean
  modalType: string
  onCreate: () => void
  onCancel: () => void
  formRef: any
}

class CreateOrUpdateTenant extends React.Component<ICreateOrUpdateTenantProps> {
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
        md: { span: 6 },
        lg: { span: 6 },
        xl: { span: 6 },
        xxl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
        md: { span: 18 },
        lg: { span: 18 },
        xl: { span: 18 },
        xxl: { span: 18 }
      }
    }

    const tailFormItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
        md: { span: 6 },
        lg: { span: 6 },
        xl: { span: 6 },
        xxl: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 18 },
        sm: { span: 18 },
        md: { span: 18 },
        lg: { span: 18 },
        xl: { span: 18 },
        xxl: { span: 18 }
      }
    }

    const { formRef } = this.props
    const { visible, onCancel, onCreate } = this.props

    return (
      <Modal open={visible} onCancel={onCancel} onOk={onCreate} title={L('Tenants')} width={550}>
        <Form ref={formRef} validateMessages={validateMessages} size="middle">
          <Form.Item label={L('TenancyName')} {...formItemLayout} name="tenancyName" rules={rules.tenancyName}>
            <Input />
          </Form.Item>
          <Form.Item label={L('Name')} {...formItemLayout} name="name" rules={rules.name}>
            <Input />
          </Form.Item>
          {this.props.modalType === 'edit' ? (
            <Form.Item
              label={L('AdminEmailAddress')}
              {...formItemLayout}
              name="adminEmailAddress"
              rules={rules.adminEmailAddress}>
              <Input />
            </Form.Item>
          ) : null}
          {this.props.modalType === 'edit' ? (
            <Form.Item label={L('DatabaseConnectionString')} {...formItemLayout} name="connectionString">
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item label={L('ACTIVE_STATUS')} {...tailFormItemLayout} name="isActive" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Col>{L('Default password is  123qwe')}</Col>
        </Form>
      </Modal>
    )
  }
}

export default CreateOrUpdateTenant
