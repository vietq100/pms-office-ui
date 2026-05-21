import { Form, Modal, Input, Row, Col } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import React from 'react'
const { formVerticalLayout } = AppConsts

export const InventoryLocationModal = ({ visible, onCreate, onCancel, inventoryLocationStore }: any) => {
  const [form] = Form.useForm(undefined)
  React.useEffect(() => {
    if (inventoryLocationStore?.editInventoryLocation) {
      form.setFieldsValue({ ...inventoryLocationStore?.editInventoryLocation })
    }
  }, [inventoryLocationStore?.editInventoryLocation])
  const handleCreate = async () => {
    const values = await form.validateFields()
    if (!inventoryLocationStore.editInventoryLocation?.id) {
      await inventoryLocationStore.create(values)
    } else {
      await inventoryLocationStore.update({
        ...inventoryLocationStore.editInventoryLocation,
        ...values
      })
    }
    onCreate()
  }
  return (
    <Modal
      forceRender
      title={L('INVENTORY_LOCATION')}
      visible={visible}
      okText={L('BTN_SAVE')}
      onOk={handleCreate}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update),
        className: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update) ? 'd-none' : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item label={L('NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
              <Input />
            </Form.Item>
          </Col>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
