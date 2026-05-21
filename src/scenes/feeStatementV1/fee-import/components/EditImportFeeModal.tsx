import React from 'react'
import AppComponentBase from '@components/AppComponentBase'
import { Modal, Form, Switch, Row, Col, Input } from 'antd'
import { FormInstance } from 'antd/lib/form'
import { notifySuccess } from '@lib/helper'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import CurrencyInput from '@components/Inputs/CurrencyInput'

interface Props {
  visible: boolean
  onClose: () => void
  onOk: (updatedData) => Promise<any>
  data: any
}
interface State {
  loading: boolean
}
export default class EditImportFeeModal extends AppComponentBase<Props, State> {
  form = React.createRef<FormInstance>()
  state = {
    loading: false
  }

  handleOk = () => {
    this.setState({ loading: true })
    this.form.current
      ?.validateFields()
      .then(async () => {
        const dataForm = this.form.current?.getFieldsValue() || {}
        const debitAmount = Number(`${dataForm.debitAmount}`.replace(/,/g, ''))
        await this.props.onOk({
          ...dataForm,
          id: this.props.data.id,
          debitAmount
        })
        this.setState({ loading: false })
        this.props.onClose()
        notifySuccess(LNotification('SUCCESS'), LNotification(this.L('ITEM_UPDATE_SUCCEED')))
      })
      .catch(() => this.setState({ loading: false }))
  }
  render() {
    return (
      <Modal
        destroyOnClose
        title={this.L('EDIT_ITEM')}
        visible={this.props.visible}
        cancelText={this.L('BTN_CANCEL')}
        onCancel={this.props.onClose}
        onOk={this.handleOk}
        confirmLoading={this.state.loading}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.feeStatement.create, appPermissions.feeStatement.update),
          className: !isGrantedAny(appPermissions.feeStatement.create, appPermissions.feeStatement.update)
            ? 'd-none'
            : ''
        }}>
        <Form
          layout="vertical"
          initialValues={this.props.data}
          ref={this.form}
          validateMessages={validateMessages}
          size="middle">
          <Row gutter={16}>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item
                name="debitAmount"
                label={this.L('FEE_EDIT_MODAL_DEBIT_AMOUNT')}
                rules={[
                  () => ({
                    validator(_, value) {
                      if (value < 1) {
                        return Promise.reject(L('PLEAE_INPUT_NUMBER_GREATER_THAN_0'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}>
                {/* <ReactNumeric
                  minimumValue="0"
                  decimalPlaces={0}
                  className="ant-input"
                /> */}
                <CurrencyInput />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label={this.L('DESCRIPTION')} rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item name="isShowToResident" label={this.L('FEE_SHOW_TO_RESIDENT')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }}>
              <Form.Item name="isActive" label={this.L('STATUS')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
