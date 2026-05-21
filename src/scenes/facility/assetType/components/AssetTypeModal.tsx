import { useEffect, useState } from 'react'
import { Form, Modal, Input, Row, Col, Switch } from 'antd'
import { L, isGrantedAny, LNotification } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { notifySuccess } from '@lib/helper'
import rules from '../validation'
const { formVerticalLayout } = AppConsts

export const AssetTypeModal = ({ visible, handleOK, data, handleCancel, onClose }: any) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (data) {
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
    <Modal
      width={'40%'}
      title={L('ASSET_TYPE')}
      visible={visible}
      okText={L('BTN_SAVE')}
      onOk={onOk}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: !isGrantedAny(appPermissions.asset.create, appPermissions.asset.update),
        className: !isGrantedAny(appPermissions.asset.create, appPermissions.asset.update) ? 'd-none' : ''
      }}>
      <Form layout="vertical" form={form} validateMessages={validateMessages} size="middle">
        <Row gutter={[16, 8]}>
          <Col md={{ span: 20 }} sm={{ span: 24 }}>
            <Form.Item
              label={L('ASSET_TYPE_NAME')}
              {...formVerticalLayout}
              name="assetTypeName"
              rules={rules.assetTypeName}>
              <Input
              // onChange={({ target: { value } }) => value}
              />
            </Form.Item>
          </Col>
          <Col md={{ span: 4 }} sm={{ span: 24 }}>
            <Form.Item name="isActive" label={L('STATUS')} valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
