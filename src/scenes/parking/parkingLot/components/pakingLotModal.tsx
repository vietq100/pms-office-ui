import { Form, Modal, Input, Row, Col, InputNumber } from 'antd'
import { L, isGranted } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import React from 'react'
import { inputNumberFormatter } from '@lib/helper'

const { formVerticalLayout } = AppConsts

export const PakingLotModal = ({ visible, onCreate, onCancel, id, data }: any) => {
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue(data?.editParkingLot)
    }
  }, [visible])
  const [form] = Form.useForm()
  return (
    <Modal
      title={id ? L('EDIT_PARKINGLOT') : L('ADD_PARKINGLOT')}
      visible={visible}
      okText={L('BTN_SAVE')}
      onOk={async () => {
        const formValues = await form.validateFields()
        onCreate(formValues)
      }}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: id && !isGranted(appPermissions.parking.update)
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('CODE_PARKINGLOT')}
              {...formVerticalLayout}
              name="code"
              className="full-width"
              rules={rules.name}>
              <Input />
            </Form.Item>
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('NAME_PARKINGLOT')}
              {...formVerticalLayout}
              name="name"
              className="full-width"
              rules={rules.name}>
              <Input />
            </Form.Item>
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('NUM_OF_SLOT')}
              {...formVerticalLayout}
              name="numOfSlots"
              className="full-width"
              rules={rules.name}>
              <InputNumber
                className="full-width"
                min={0}
                placeholder={L('BOOKING_RULE_NUMBER_MAXIMUM_EXTEND_SLOT_PLACEHOLDER')}
                size={'middle'}
                formatter={(value) => inputNumberFormatter(value)}
              />
            </Form.Item>
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
              <Input.TextArea className="full-width" rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
