import * as React from 'react'

import { Checkbox, Input, Modal, Form } from 'antd'
import { L } from '../../../../lib/abpUtility'
import rules from './validation'
import { validateMessages } from '../../../../lib/validation'

export interface ICreateOrUpdateLanguageProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  formRef: any
}

class LanguageFormModal extends React.Component<ICreateOrUpdateLanguageProps> {
  state = {
    confirmDirty: false
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
    const itemLayout = {
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

    const { visible, onCancel, onCreate } = this.props

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={onCreate}
        title={'Language'}>
        <Form ref={this.props.formRef} validateMessages={validateMessages} size="middle">
          <Form.Item label={L('LANGUAGE_NAME')} {...formItemLayout} name="name" rules={rules.name}>
            <Input />
          </Form.Item>
          <Form.Item label={L('LANGUAGE_ICON')} {...formItemLayout} name="icon" rules={rules.surname}>
            <Input />
          </Form.Item>
          <Form.Item label={L('LANGUAGE_IS_ENABLED')} {...itemLayout} name="isEnabled" valuePropName="checked">
            <Checkbox> </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default LanguageFormModal
