import * as React from 'react'

import { Col, Form, Input, Modal, Row, Select } from 'antd'
import { MailOutlined, UserOutlined } from '@ant-design/icons'
import { L } from '../../../../../lib/abpUtility'
import rules from './validation'
import AppConsts, { moduleAvatar } from '../../../../../lib/appconst'
import AvatarUpload from '../../../../FileUpload/AvatarUpload'
import SessionStore from '../../../../../stores/sessionStore'
import { useState } from 'react'
import { validateMessages } from '@lib/validation'
const { formVerticalLayout } = AppConsts

export interface IMyProfileProps {
  sessionStore?: SessionStore
  visible: boolean
  onCancel: () => void
  formRef: any
}

const MyProfileFormModal: React.FC<IMyProfileProps> = ({ sessionStore, visible, onCancel }) => {
  const [form] = Form.useForm()
  const [displayNames, setDisplayName] = useState([])
  const [loading, setLoading] = useState(false)

  const buildDisplayName = () => {
    let name = form.getFieldValue('name') || ''
    let surname = form.getFieldValue('surname') || ''
    if (name.length && surname.length) {
      name = name.trim()
      surname = surname.trim()
      setDisplayName([`${name} ${surname}`, `${surname} ${name}`] as any)
    }
  }

  const onUpdate = () => {
    form.validateFields().then(async (values: any) => {
      setLoading(true)
      await sessionStore
        ?.updateMyProfile({
          ...values
        })
        .finally(() => setLoading(false))

      onCancel()
    })
  }
  return (
    <Modal
      open={visible}
      cancelText={L('BTN_CANCEL')}
      okText={L('BTN_SAVE')}
      onCancel={onCancel}
      onOk={onUpdate}
      title={L('MY_PROFILE_TILE')}
      confirmLoading={loading}>
      <Form
        form={form}
        layout={'vertical'}
        initialValues={sessionStore?.currentLogin?.user}
        size="middle"
        validateMessages={validateMessages}>
        <Row gutter={[16, 0]}>
          <Col sm={{ span: 24, offset: 0 }} className="mb-3">
            <AvatarUpload module={moduleAvatar.myProfile} sessionStore={sessionStore}></AvatarUpload>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item label={L('MY_PROFILE_NAME')} {...formVerticalLayout} name="name" rules={rules.name}>
              <Input onChange={buildDisplayName} />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item label={L('MY_PROFILE_SURNAME')} {...formVerticalLayout} name="surname" rules={rules.surname}>
              <Input onChange={buildDisplayName} />
            </Form.Item>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item
              label={L('MY_PROFILE_FULL_NAME')}
              {...formVerticalLayout}
              name="displayName"
              rules={rules.displayName}>
              <Select style={{ width: '100%' }}>
                {displayNames.map((item: any, index) => (
                  <Select.Option key={index} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col sm={{ span: 12, offset: 0 }}>
            <Form.Item label={L('MY_PROFILE_USER_NAME')} {...formVerticalLayout} name="userName" rules={rules.userName}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col sm={{ span: 24, offset: 0 }}>
            <Form.Item
              label={L('MY_PROFILE_EMAIL')}
              {...formVerticalLayout}
              name="emailAddress"
              rules={rules.emailAddress}>
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          {/*<Col sm={{ span: 12, offset: 0 }}>*/}
          {/*  <Form.Item label={L('MY_PROFILE_PHONE')} {...formVerticalLayout} name="phoneNumber">*/}
          {/*    <Input prefix={<PhoneOutlined />} />*/}
          {/*  </Form.Item>*/}
          {/*</Col>*/}
        </Row>
      </Form>
    </Modal>
  )
}

export default MyProfileFormModal
