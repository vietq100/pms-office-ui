import { Form, Modal, Input, Row, Col, Select } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import NumberInput from '@components/Inputs/NumberInput'
import rules from './validation'
import React from 'react'
const { formVerticalLayout } = AppConsts

export const InventoryCategoryModal = ({
  visible,
  onCreate,
  onCancel,
  parentId,
  renderOptions,
  inventoryCategoryOptions,
  inventoryCategoryStore
}: any) => {
  const [form] = Form.useForm()
  React.useEffect(() => {
    if (inventoryCategoryStore?.editInventoryCategory)
      form.setFieldsValue({
        ...inventoryCategoryStore.editInventoryCategory
      })
  }, [visible])
  const handleOk = async () => {
    const formValues = await form.validateFields()
    if (!formValues.names.filter((item) => item.value !== '').length) {
      return form.setFields([{ name: 'names', errors: [L('REQUIRED')] }])
    }
    onCreate(formValues)
  }
  return (
    <Modal
      title={L('INVENTORY_CATEGORY')}
      visible={visible}
      okText={L('BTN_SAVE')}
      onOk={handleOk}
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
            <Form.Item label={L('NAME')} {...formVerticalLayout} name="names" rules={rules.names}>
              <MultiLanguageInput />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('SORT_ORDER')} {...formVerticalLayout} name="sortOrder">
              <NumberInput />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
              <Input.TextArea rows={1} />
            </Form.Item>
          </Col>
          {parentId && (
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item label={L('PARENT')} {...formVerticalLayout} name="parentId">
                <Select filterOption={false} style={{ width: '100%' }} disabled>
                  {renderOptions(inventoryCategoryOptions)}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  )
}
