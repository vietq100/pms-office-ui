import { Col, Form, Modal, Row, Input, Button } from 'antd'

import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { inject, observer } from 'mobx-react'

import { validateMessages } from '@lib/validation'
import React from 'react'
import { LockOutlined, PhoneOutlined } from '@ant-design/icons'
import ContractorStore from '@stores/contractor/contractorStore'
import Stores from '@stores/storeIdentifier'
import rules from './validation'
import { ContactModel } from '@models/contractor/contractorModel'
import Password from 'antd/es/input/Password'

const { formVerticalLayout } = AppConsts

export interface Props {
  visibleCreateUser: boolean
  dataContact: any

  onClose: () => void
  contractorStore: ContractorStore
}

const CreateUserContractorModal = inject(Stores.ContractorStore)(
  observer((props: Props) => {
    React.useEffect(() => {
      getDetail()
    }, [props.visibleCreateUser === true])

    const genRandomPassword = () => {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const passwordLength = 9
      let password = 'C1@t'
      for (let i = 0; i <= passwordLength; i++) {
        const randomNumber = Math.floor(Math.random() * chars.length)
        password += chars.substring(randomNumber, randomNumber + 1)
      }
      form.setFieldValue('password', password)
    }

    const getDetail = () => {
      form.setFieldsValue(props.dataContact)
    }
    const onSave = () => {
      setTimeout(() => {
        form.validateFields().then(async (values: any) => {
          const data = new ContactModel(
            props.dataContact.id,
            props.dataContact.contactEmail,
            props.dataContact.contactName,
            props.dataContact.contactPhone,
            props.dataContact.contractorId,
            //  values.setRandomPassword,
            values.password
          )

          props.contractorStore.createUserContractor(data)

          form.resetFields()
          props.onClose()
        })
      }, 200)
    }

    const [form] = Form.useForm()
    return (
      <Modal
        open={props.visibleCreateUser}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={() => {
          form.resetFields(), props.onClose()
        }}
        onOk={onSave}
        title={L('CREATE_CONTACT_USER')}>
        <Form form={form} layout={'vertical'} validateMessages={validateMessages} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('CONTACT_NAME')} {...formVerticalLayout} name="contactName" rules={rules.contactName}>
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('CONTACT_PHONENUMBER')}
                {...formVerticalLayout}
                name="contactPhone"
                rules={rules.contactPhoneNumber}>
                <Input prefix={<PhoneOutlined />} disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('CONTACT_EMAIL')} {...formVerticalLayout} name="contactEmail">
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('CONTRACTOR_DOCUMENT_DESCRIPTION')} {...formVerticalLayout} name="remark">
                <Input.TextArea rows={2} disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 16, offset: 0 }}>
              <Form.Item
                label={L('CONTRACTOR_DOCUMENT_PASSWORD')}
                {...formVerticalLayout}
                name="password"
                rules={rules.password}>
                <Password prefix={<LockOutlined className="site-form-item-icon"></LockOutlined>} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item label={L('CONTACT_GEN_PASS')}>
                <Button type="primary" shape="default" size="middle" onClick={() => genRandomPassword()}>
                  {L('RANDOME')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  })
)

export default CreateUserContractorModal
