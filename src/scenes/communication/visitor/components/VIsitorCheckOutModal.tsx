import { Form, Input, Modal, Row, Col, DatePicker } from 'antd'
import { isGrantedAny, L } from '@lib/abpUtility'

import AppConsts, { appPermissions, dateTimeFormat } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import { validateMessages } from '@lib/validation'
import rules from './validation'

import React from 'react'
import VisitorStore from '@stores/communication/visitorStore'
import dayjs from 'dayjs'

const { formVerticalLayout } = AppConsts
const currentDate = dayjs()
export interface IContactModalFormProps {
  visible: boolean
  visistor: any
  visitorStore: VisitorStore
  onCancel: () => void
}

@inject(Stores.ContractorStore, Stores.VisitorStore)
@observer
class VisitorCheckOutModal extends AppComponentBase<IContactModalFormProps> {
  formRef: any = React.createRef()

  componentDidUpdate = async (prevProps) => {
    if (prevProps.visistor.id !== this.props.visistor.id) {
      await this.initValue()
    }
  }

  initValue = () => {
    this.formRef.current.setFieldsValue(this.props.visistor)
  }
  handleCheckOut = async () => {
    this.formRef.current.validateFields().then(async (values: any) => {
      await this.props.visitorStore.update(
        {
          ...this.props.visistor,
          checkOutTime: values.checkOutTime
        },
        ''
      )

      this.formRef.current.resetFields()
      this.props.onCancel()
    })
  }
  onCancle = () => {
    this.formRef.current.resetFields()
    this.props.onCancel()
  }
  render() {
    return (
      <Modal
        style={{ width: 400 }}
        open={this.props.visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={this.onCancle}
        //confirmLoading={this.props.isLoading}
        onOk={this.handleCheckOut}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.visitor.create, appPermissions.visitor.update),
          className: !isGrantedAny(appPermissions.visitor.create, appPermissions.visitor.update) ? 'd-none' : ''
        }}>
        <Form
          ref={this.formRef}
          layout="vertical"
          validateMessages={validateMessages}
          initialValues={this.props.visistor}
          size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('VISITOR_NAME')} {...formVerticalLayout} name="visitorName" rules={rules.visitorName}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('VISITOR_IDENTITY_NUMBER')}
                {...formVerticalLayout}
                name="identityCardNumber"
                rules={rules.identityCardNumber}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('VISITOR_MOBILE')} {...formVerticalLayout} name="phoneNumber">
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 8 }}>
              <Form.Item name={'checkOutTime'} rules={rules.checkout} label={this.L('VISITOR_CHECK_OUT_DATE')}>
                <DatePicker
                  format={dateTimeFormat}
                  style={{ width: '100%' }}
                  disabledDate={(d) =>
                    (!this.props.visistor.id && d.isBefore(currentDate)) ||
                    (this.props.visistor.checkInTime && (!d || d.isBefore(this.props.visistor.checkInTime)))
                  }
                  placeholder={L('SELECT_DATE')}
                  showTime
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default VisitorCheckOutModal
