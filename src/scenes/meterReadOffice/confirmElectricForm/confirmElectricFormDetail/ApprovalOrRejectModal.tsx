import { Form, Input, Modal, Col, Row, Button } from 'antd'
import { isGrantedAny, L } from '../../../../lib/abpUtility'
import AppConsts, { appPermissions } from '../../../../lib/appconst'
import AppComponentBase from '../../../../components/AppComponentBase'
import { validateMessages } from '../../../../lib/validation'
import React from 'react'

const { formVerticalLayout } = AppConsts

const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IProps {
  visible: boolean
  onCancel: () => void
  typeModalAproval: string
  onOke: (message: string, typeModalAproval: string) => void
}

class ApprovalOrRejectModal extends AppComponentBase<IProps, any> {
  formRef: any = React.createRef()

  componentDidUpdate = async (prevProps: Readonly<IProps>) => {
    if (!prevProps.visible && this.props.visible) {
      if (this.props.visible) {
        this.formRef.current?.resetFields()
      }
    }
  }

  handleSubmit = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      this.setState({ modalVisible: false })
      this.props.onOke(values.description, this.props.typeModalAproval)
      this.props.onCancel()
      form.resetFields()
    })
  }

  render() {
    const { visible, onCancel } = this.props

    return (
      this.props.visible && (
        <Modal
          open={visible}
          onCancel={onCancel}
          destroyOnClose
          title={
            <div className="d-flex justify-content-center w-100">
              {this.props.typeModalAproval === statusApproval.APPROVAL
                ? L('TITLE_TICKET_REQUEST_APPROVAL')
                : L('TITLE_TICKET_REQUEST_REJECT')}
            </div>
          }
          footer={[
            <>
              <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
              {/* {isGrantedAny(appPermissions.building.create, appPermissions.building.update) && ( */}
              <Button key="submit" type="primary" onClick={this.handleSubmit}>
                {L('BTN_SAVE')}
              </Button>
              {/* )} */}
            </>
          ]}
          okButtonProps={{
            className: !isGrantedAny(appPermissions.building.create, appPermissions.building.update) ? 'd-none' : ''
          }}>
          <Form ref={this.formRef} layout="vertical" validateMessages={validateMessages} size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item
                  label={L('BUILDING_DESCRIPTION')}
                  {...formVerticalLayout}
                  name="description"
                  rules={[
                    { required: this.props.typeModalAproval === statusApproval.APPROVAL ? false : true },
                    { max: 500 }
                  ]}>
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      )
    )
  }
}

export default ApprovalOrRejectModal
