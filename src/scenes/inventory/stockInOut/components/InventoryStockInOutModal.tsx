import { useEffect, useState } from 'react'
import { Form, Modal, Input, Row, Col } from 'antd'
import { L, isGrantedAny, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { formItemLayout } from '@lib/formLayout'
import { notifySuccess } from '@lib/helper'
import rules from './validation'

export const InventoryStockInOutModal = ({ visible, handleOK, data, handleCancel, onClose }: any) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState({})

  useEffect(() => {
    if (data) {
      setInitialValues(data)
      form.setFieldsValue(data)
    }
  }, [data])

  const onOk = async () => {
    setLoading(true)
    return form
      .validateFields()
      .then(async () => {
        const dataForm = form.getFieldsValue() || {}
        await handleOK({ ...dataForm, id: data.id })
        setLoading(false)
        notifySuccess(LNotification('SUCCESS'), LNotification(L('ITEM_UPDATE_SUCCEED')))
        onClose()
        form.resetFields()
      })
      .catch(() => setLoading(false))
  }

  const onCancel = async () => {
    form.resetFields()
    handleCancel()
  }

  return (
    <div>
      <Modal
        title={L('INVENTORY_LOCATION')}
        visible={visible}
        okText={L('BTN_SAVE')}
        onOk={onOk}
        cancelText={L('BTN_CANCEL')}
        onCancel={onCancel}
        confirmLoading={loading}
        destroyOnClose
        maskClosable={false}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update),
          className: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update) ? 'd-none' : ''
        }}>
        <Form
          layout="vertical"
          initialValues={initialValues}
          form={form}
          validateMessages={validateMessages}
          size="middle">
          <Row gutter={16}>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('INVENTORY_LOCATION_NAME')} {...formItemLayout} name="name" rules={rules.name}>
                <Input onChange={({ target: { value } }) => value} />
              </Form.Item>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('INVENTORY_LOCATION_DESCRIPTION')} {...formItemLayout} name="description">
                <Input.TextArea rows={3} onChange={({ target: { value } }) => value} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
