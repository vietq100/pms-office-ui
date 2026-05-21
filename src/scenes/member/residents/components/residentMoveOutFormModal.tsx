import * as React from 'react'

import { Col, Form, Input, Modal, Row } from 'antd'
import { L, LNotification } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import ResidentStore from '@stores/member/resident/residentStore'
import { validateMessages } from '@lib/validation'
import Spin from 'antd/lib/spin'

const { formVerticalLayout } = AppConsts

export interface IUnitFormProps {
  residentStore?: ResidentStore
  visible: boolean
  onCancel: () => void
  onSave: () => void
  initialValue: any
}

@inject(Stores.ResidentStore)
@observer
class ResidentMoveInFormModal extends AppComponentBase<IUnitFormProps> {
  formRef: any = React.createRef()
  state = {
    confirmDirty: false,
    residents: [],
    loading: false,
    initialValue: {}
  }

  async componentDidMount() {
    this.props.residentStore?.getMemberTypes()
    this.props.residentStore?.getMemberRoles()
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      this.setState({ loading: true })
      await this.props.residentStore?.moveOut({
        ...values,
        unitId: this.props.initialValue?.unitId
      })
      this.setState({ loading: false })
      form.resetFields()
      this.props.onSave()
    })
  }
  onCancel = () => {
    const form = this.formRef.current

    form.resetFields()
    this.props.onCancel()
  }
  render() {
    const { visible, initialValue } = this.props
    return (
      <Modal
        style={{ height: 400 }}
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={this.onCancel}
        onOk={this.onSave}
        title={L('UNIT_MOVE_OUT')}
        confirmLoading={this.state.loading}>
        <Spin tip={LNotification('SAVING_MESSAGE')} spinning={this.state.loading}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            initialValues={initialValue}
            validateMessages={validateMessages}
            size="middle">
            <Row>
              {/* <Col style={{ display: 'none' }} sm={{ span: 24, offset: 0 }}>
                <Form.Item name={'unitId'}>
                  <Input hidden={true} />
                </Form.Item>
              </Col> */}
              <Col style={{ display: 'none' }} sm={{ span: 24, offset: 0 }}>
                <Form.Item name={'userId'}>
                  <Input hidden={true} />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item
                  name={'moveOutReason'}
                  label={L('UNIT_MOVE_OUT_REASON')}
                  {...formVerticalLayout}
                  rules={[{ required: true }]}>
                  <Input.TextArea />
                </Form.Item>
              </Col>{' '}
            </Row>
          </Form>
        </Spin>
      </Modal>
    )
  }
}

export default ResidentMoveInFormModal
