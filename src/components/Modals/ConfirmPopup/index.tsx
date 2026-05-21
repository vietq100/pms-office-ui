import { Col, Form, Input, Modal, Row } from 'antd'
import React, { useEffect } from 'react'
import { L, LError } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
import AppConsts from '@lib/appconst'
import { ExclamationCircleFilled } from '@ant-design/icons'

const { textConfirmPopup } = AppConsts

interface ConfirmReasonProps {
  title: string
  confirmMessage: string
  hintConfirm: string
  visible: boolean
  onCancel: (refresh) => void
  onOk: (val) => void
  idNeedConfirm: any
}

const ConfirmPopup: React.FC<ConfirmReasonProps> = ({
  title,
  confirmMessage,
  hintConfirm,
  visible,
  onCancel,
  onOk
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ valueCheck: '' })
    }
  }, [visible])

  const handleCancel = () => {
    onCancel(false)
  }
  const handleAgree = () => {
    form.validateFields().then(async () => {
      const dataForm = form.getFieldsValue() || {}
      if (dataForm.valueCheck === textConfirmPopup.confirm) {
        onOk(true)
        form.resetFields()
      } else {
        return form.setFields([
          {
            name: 'valueCheck',
            errors: [LError('TEXT_CONFIRM_NOT_CORRECT')]
          }
        ])
      }
    })
  }
  return (
    <Modal
      width="25%"
      title={
        <>
          <ExclamationCircleFilled style={{ color: '#F0B86E' }} /> {L(title)}
        </>
      }
      open={visible}
      onOk={handleAgree}
      onCancel={handleCancel}
      okText={L('BTN_SAVE')}
      cancelText={L('BTN_CANCEL')}>
      {L(confirmMessage)}
      <div className="mt-1"> {L(hintConfirm)}</div>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="small">
        <Row gutter={16}>
          <Col sm={{ span: 24 }}>
            <Form.Item name="valueCheck">
              <Input size="small" placeholder={L('PLACEHOLDER_INPUT_CONFIRM')} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default ConfirmPopup
