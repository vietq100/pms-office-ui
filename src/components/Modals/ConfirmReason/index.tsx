import { Col, Form, Input, Modal, Row } from 'antd'
import React, { useEffect } from 'react'
import { L } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'

interface ConfirmReasonProps {
  title: string
  confirmMessage: string
  visible: boolean
  onCancel: (visible) => void
  onOk: (val) => void
}

const ConfirmReason: React.FC<ConfirmReasonProps> = ({ title, confirmMessage, visible, onCancel, onOk }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ reason: '' })
    }
  }, [visible])

  const handleCancel = () => {
    onCancel(false)
  }
  const handleAgree = () => {
    form.validateFields().then(async () => {
      const dataForm = form.getFieldsValue() || {}
      onOk(dataForm.reason)
    })
  }
  return (
    <Modal
      title={L(title)}
      visible={visible}
      onOk={handleAgree}
      onCancel={handleCancel}
      okText={L('BTN_AGREE')}
      cancelText={L('BTN_CANCEL')}>
      {L(confirmMessage)}
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col sm={{ span: 24 }}>
            <Form.Item name="reason" rules={[{ required: true }]}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default ConfirmReason
