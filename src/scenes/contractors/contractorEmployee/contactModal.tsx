import { Form, Input, Modal, Row, Col } from 'antd'
import { isGrantedAny, L } from '@lib/abpUtility'

import AppConsts, { appPermissions } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import { inject, observer } from 'mobx-react'
import Stores from '@stores/storeIdentifier'
import ContractorStore from '@stores/contractor/contractorStore'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import { PhoneOutlined } from '@ant-design/icons'

const { formVerticalLayout } = AppConsts

export interface IContactModalFormProps {
  contractorStore: ContractorStore
  visibleDetail: boolean
  isUpdateForm: boolean
  onCancel: () => void
  onCreate: () => void
  formRef: any
  isLoading: boolean
}

@inject(Stores.ContractorStore)
@observer
class ContactModal extends AppComponentBase<IContactModalFormProps> {
  render() {
    const {
      onCancel,
      onCreate,
      formRef,
      contractorStore: { editContact }
    } = this.props

    return (
      <Modal
        open={this.props.visibleDetail}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        confirmLoading={this.props.isLoading}
        onOk={onCreate}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.contractor.create, appPermissions.contractor.update),
          className: !isGrantedAny(appPermissions.contractor.create, appPermissions.contractor.update) ? 'd-none' : ''
        }}>
        <Form
          ref={formRef}
          layout="vertical"
          validateMessages={validateMessages}
          initialValues={editContact}
          size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('CONTACT_NAME')} {...formVerticalLayout} name="contactName" rules={rules.contactName}>
                <Input style={{ display: 'block' }} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('CONTACT_PHONENUMBER')}
                {...formVerticalLayout}
                name="contactPhone"
                rules={rules.contactPhoneNumber}>
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item
                label={L('CONTACT_EMAIL')}
                {...formVerticalLayout}
                name="contactEmail"
                rules={rules.emailAddress}>
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <Form.Item label={L('CONTRACTOR_DOCUMENT_DESCRIPTION')} {...formVerticalLayout} name="remark">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ContactModal
