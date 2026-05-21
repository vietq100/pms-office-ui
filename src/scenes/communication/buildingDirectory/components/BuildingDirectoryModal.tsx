import { useEffect, useState } from 'react'
import { Form, Modal, Input, Row, Col } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import { GlobalOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons/lib'
import NumberInput from '@components/Inputs/NumberInput'

const { formVerticalLayout } = AppConsts

export const BuildingDirectoryModal = ({ visible, loading, handleOK, data, handleCancel, onClose }: any) => {
  const [form] = Form.useForm()
  const [initialValues, setInitialValues] = useState({})

  useEffect(() => {
    if (data) {
      setInitialValues(data)
      form.setFieldsValue(data)
    }
  }, [data])

  const onOk = async () => {
    return form.validateFields().then(async () => {
      const dataForm = form.getFieldsValue() || {}
      await handleOK({ ...dataForm, id: data.id })
      onClose()
      form.resetFields()
    })
  }

  const onCancel = async () => {
    form.resetFields()
    handleCancel()
  }

  return (
    <Modal
      title={L('BUILDING_DIRECTORY')}
      open={visible || false}
      okText={L('BTN_SAVE')}
      onOk={onOk}
      cancelText={L('BTN_CANCEL')}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      maskClosable={false}
      okButtonProps={{
        disabled: data.id && !isGrantedAny(appPermissions.buildingDirectory.update),
        className: !isGrantedAny(appPermissions.buildingDirectory.create, appPermissions.buildingDirectory.update)
          ? 'd-none'
          : ''
      }}>
      <Form
        layout="vertical"
        name="form_in_modal"
        initialValues={initialValues}
        form={form}
        validateMessages={validateMessages}
        size="middle">
        <Row gutter={16}>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item
              label={L('CONTACT_INFO_NAME')}
              {...formVerticalLayout}
              name="displayName"
              rules={rules.displayName}>
              <Input />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item label={L('SORT_ORDER')} {...formVerticalLayout} name="position">
              <NumberInput />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item label={L('EMAIL_ADDRESS')} {...formVerticalLayout} name="emailAddress">
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item label={L('PHONE_NUMBER')} {...formVerticalLayout} name="phoneNumber" rules={rules.phoneNumber}>
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <Form.Item label={L('URL')} {...formVerticalLayout} name="url" rules={rules.url}>
              <Input prefix={<GlobalOutlined />} />
            </Form.Item>
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <Form.Item label={L('DESCRIPTION')} {...formVerticalLayout} name="description">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
