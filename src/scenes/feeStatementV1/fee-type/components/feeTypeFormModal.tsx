import * as React from 'react'

import { Input, Modal, Form } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import rules from './validation'
import { validateMessages } from '../../../../lib/validation'
import TextArea from 'antd/lib/input/TextArea'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import feeTypeService from '@services/fee/feeTypeService'
import { appPermissions, validateStatus } from '@lib/appconst'
import debounce from 'lodash/debounce'

export interface IFeeTypeFormModalProps {
  visible: boolean
  onCancel: () => void
  modalType: string
  onCreate: () => void
  formRef: any
}

class FeeTypeFormModal extends React.Component<IFeeTypeFormModalProps> {
  state = {
    confirmDirty: false,
    validateStatus: undefined
  }

  checkExist = debounce((value) => {
    this.setState({ validateStatus: validateStatus.validating })
    feeTypeService.checkExist(value).then((res) => {
      this.setState({
        validateStatus: res ? validateStatus.error : validateStatus.success
      })
    })
  }, 200)

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
        title={L('FEE_TYPE')}
        okButtonProps={{
          disabled:
            !isGrantedAny(appPermissions.feeType.create, appPermissions.feeType.update) ||
            this.state.validateStatus === validateStatus.error
        }}>
        <Form ref={this.props.formRef} validateMessages={validateMessages} size="middle">
          <Form.Item
            label={L('FEE_TYPE_CODE')}
            {...formItemLayout}
            name="code"
            rules={rules.code}
            validateStatus={this.state.validateStatus}>
            <Input onChange={({ target: { value } }) => this.checkExist(value)} />
          </Form.Item>
          <Form.Item label={L('FEE_TYPE_NAME')} {...formItemLayout} name="names" rules={rules.name}>
            <MultiLanguageInput />
          </Form.Item>
          <Form.Item label={L('FEE_TYPE_DESCRIPTION')} {...itemLayout} name="description">
            <TextArea />
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default FeeTypeFormModal
