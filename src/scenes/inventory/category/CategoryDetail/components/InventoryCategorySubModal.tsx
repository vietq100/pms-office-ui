import { Form, Modal, Input, Row, Col, Select } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { checkMultiLanguageMaxLength, checkMultiLanguageRequired, validateMessages } from '@lib/validation'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'
import NumberInput from '@components/Inputs/NumberInput'
import React from 'react'
import { renderOptions } from '@lib/helper'
const { formVerticalLayout } = AppConsts

export const InventoryCategorySubModal = ({
  inventoryCategoryStore,
  visible,
  onCancel,
  parentId,
  inventoryCategoryOptions
}: any) => {
  const [form] = Form.useForm()
  React.useEffect(() => {
    if (visible && parentId) {
      getDataCreate(parentId)
    }
  }, [visible])

  const getDataCreate = async (parentId) => {
    await inventoryCategoryStore.createInventorySubCategory(parentId)

    form.setFieldsValue({
      ...inventoryCategoryStore?.editInventoryCategory,
      parentId: Number(parentId)
    })
  }

  const handleOk = async () => {
    return form.validateFields().then(async (values: any) => {
      if (!inventoryCategoryStore?.editInventoryCategory?.id) {
        await inventoryCategoryStore.create(values)
      } else {
        await inventoryCategoryStore.update({
          ...inventoryCategoryStore?.editInventoryCategory,
          ...values
        })
      }
      onCancel(true)
    })
  }

  const onCancelModal = () => {
    form.resetFields()
    onCancel(false)
  }

  return (
    <Modal
      title={L('INVENTORY_CATEGORY')}
      open={visible}
      okText={L('BTN_SAVE')}
      onOk={handleOk}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancelModal}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update),
        className: !isGrantedAny(appPermissions.inventory.create, appPermissions.inventory.update) ? 'd-none' : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={16}>
          <Col md={{ span: 24 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('NAME')}
              {...formVerticalLayout}
              name="names"
              rules={[
                {
                  required: true,
                  validator: (rule, value) => checkMultiLanguageRequired(rule, value, 'LIBRARY_DOCUMENT_NAME')
                },
                {
                  max: 250,
                  validator: (rule, value) => checkMultiLanguageMaxLength(rule, value)
                }
              ]}>
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
