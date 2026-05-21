import { Form, Modal, Input, Row, Col } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import React from 'react'

const { formVerticalLayout } = AppConsts

export const InventoryBrandModal = ({ visible, onCreate, onCancel, id, inventoryBrandStore }: any) => {
  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue(inventoryBrandStore?.editInventoryBrand)
    }
  }, [visible])
  const [form] = Form.useForm()
  return (
    <Modal
      title={id ? L('EDIT_BRAND') : L('ADD_BRAND')}
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
        disabled: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update),
        className: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update) ? 'd-none' : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item label={L('NAME')} {...formVerticalLayout} name="name" className="full-width" rules={rules.name}>
              <Input />
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
