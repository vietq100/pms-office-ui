import * as React from 'react'

import { Form, Input, Modal } from 'antd'
import { L } from '../../../../lib/abpUtility'
import AppConsts from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import AppComponentBase from '../../../../components/AppComponentBase'
import ResidentStore from '../../../../stores/member/resident/residentStore'
import UnitStore from '../../../../stores/project/unitStore'
import { validateMessages } from '../../../../lib/validation'
import FormDatePicker from '@components/FormItem/FormDatePicker'

const { formVerticalLayout } = AppConsts

export interface IUnitFormProps {
  residentStore?: ResidentStore
  unitStore?: UnitStore
  visible: boolean
  onCancel: () => void
  onSave: () => void
  initialValue: any
}

@inject(Stores.UnitStore)
@inject(Stores.ResidentStore)
@observer
class UnitMoveInFormModal extends AppComponentBase<IUnitFormProps> {
  formRef: any = React.createRef()
  state = {
    confirmDirty: false,
    residents: []
  }
  componentDidUpdate = async (prevProps) => {
    if (!prevProps.visible && this.props.visible) {
      this.formRef.current?.setFieldsValue({ ...this.props.initialValue })
    }
  }
  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      await this.props.unitStore?.moveOut(values)
      form.resetFields()
      this.props.onSave()
    })
  }

  render() {
    const { visible, onCancel } = this.props
    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={this.onSave}
        title={L('UNIT_MOVE_OUT')}>
        <Form ref={this.formRef} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Form.Item name={'unitId'} style={{ display: 'none' }} className="mb-0">
            <Input hidden={true} />
          </Form.Item>
          <Form.Item name={'userId'} style={{ display: 'none' }} className="mb-0">
            <Input hidden={true} />
          </Form.Item>
          <Form.Item
            name={'moveOutReason'}
            label={L('UNIT_MOVE_OUT_REASON')}
            {...formVerticalLayout}
            rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <FormDatePicker name="moveOutDate" label={L('MOVE_OUT_DATE')} />
        </Form>
      </Modal>
    )
  }
}

export default UnitMoveInFormModal
