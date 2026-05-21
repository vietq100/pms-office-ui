import { L, isGrantedAny } from '@lib/abpUtility'
import { Button, Col, Form, Modal, Radio, Row } from 'antd'
import React from 'react'

import { validateMessages } from '@lib/validation'

import { appPermissions } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormSelect from '@components/FormItem/FormSelect'
import VoucherStore from '@stores/fee/voucherStore'
import { OptionModel } from '@models/global'
import residentService from '@services/member/resident/residentService'
import dayjs from 'dayjs'
const disabledDate = (current) => {
  return current > new Date() ? true : false
}
interface Props {
  voucherStore: VoucherStore
  visible: boolean
  dataSend: any
  onCancel: () => void
  onCancelAndRefresh: () => void
}

interface State {
  userOptions: OptionModel[]
  loading: boolean
}

export default class VoucherDetailModal extends AppComponentBase<Props, State> {
  form: any = React.createRef()

  state = {
    userOptions: [],
    loading: false
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        await Promise.all([this.getUserInUnit(), this.props.voucherStore.getChannels(), this.initValue()])
      }
    }
  }

  initValue = () => {
    this.form.current?.setFieldsValue({
      id: this.props.dataSend?.id,
      description: this.props.dataSend?.description,
      userId: this.props.dataSend?.user?.id,
      paymentChannel: this.props.dataSend?.paymentChannelId,
      payableDate: this.props.dataSend?.payableDate ? dayjs(this.props.dataSend?.payableDate) : null,
      otherNote: this.props.dataSend?.otherNote
    })
  }
  getUserInUnit = async () => {
    this.setState({ loading: true })
    const unitId = this.props.dataSend?.unit?.id
    const userOptions = await residentService
      .getResidentInUnit({ maxResultCount: 50, skipCount: 0, unitId })
      .finally(() => {
        this.setState({ loading: false })
      })

    this.setState({ userOptions })
  }

  handleSubmit = async () => {
    this.form.current.validateFields().then(async (values: any) => {
      this.props.voucherStore.update({
        id: this.props.dataSend?.id,
        ...values
      })
      this.props.onCancelAndRefresh()
    })
  }

  render(): React.ReactNode {
    const { visible, onCancel } = this.props
    const { userOptions } = this.state
    return (
      this.props.visible && (
        <Modal
          open={visible}
          destroyOnClose
          maskClosable={false}
          title={L('VOUCHER_MODAL_TITLE')}
          cancelText={L('BTN_CANCEL')}
          onCancel={() => {
            onCancel()
          }}
          footer={[
            <>
              <Button
                onClick={() => {
                  onCancel()
                }}>
                {L('BTN_CANCEL')}
              </Button>
              <Button type="primary" onClick={this.handleSubmit}>
                {L('BTN_SAVE')}
              </Button>
            </>
          ]}
          okButtonProps={{
            disabled: !isGrantedAny(appPermissions.feeVoucher.create, appPermissions.feeVoucher.update),
            className: !isGrantedAny(appPermissions.feeVoucher.create, appPermissions.feeVoucher.update) ? 'd-none' : ''
          }}>
          <Form layout="vertical" ref={this.form} validateMessages={validateMessages} size="middle">
            <Row gutter={16}>
              <Col md={{ span: 24 }}>
                <FormTextArea
                  label="VOUCHER_DESCRIPTION"
                  maxLength={2001}
                  name="description"
                  rows={2}
                  rule={[{ required: true, max: 2000 }]}
                />
              </Col>
              <Col md={{ span: 16 }}>
                <FormSelect
                  label="DEPOSIT_PAYMENT_CHANNEL"
                  name="paymentChannel"
                  options={this.props.voucherStore?.listChannel}
                  rule={[{ required: true }]}
                />
              </Col>
              <Col md={{ span: 8 }}>
                <FormDatePicker
                  disabledDate={disabledDate}
                  label="VOUCHER_DATE"
                  name="payableDate"
                  rule={[{ required: true }]}
                />
              </Col>
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <Form.Item name="userId" label={L('FEE_REFUND_RECEIVER')} rules={[{ required: true }]}>
                  <Radio.Group options={userOptions} />
                </Form.Item>
              </Col>
              <Col md={{ span: 24 }}>
                <FormTextArea
                  label="VOUCHER_OTHER_NOTE"
                  maxLength={2001}
                  name="otherNote"
                  rows={2}
                  rule={[{ required: false, max: 2000 }]}
                />
              </Col>
            </Row>
          </Form>
        </Modal>
      )
    )
  }
}
