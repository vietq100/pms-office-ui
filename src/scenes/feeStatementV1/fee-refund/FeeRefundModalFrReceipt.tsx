import { L } from '@lib/abpUtility'
import { Col, Form, Input, Modal, Row, Radio } from 'antd'
import React from 'react'
import { FormInstance } from 'antd/lib/form'
import { validateMessages } from '@lib/validation'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import { IFeeRefundModel } from '@models/fee'
import FeeStore from '@stores/fee/feeStore'
import { OptionModel } from '@models/global'
import residentService from '@services/member/resident/residentService'
import FormSelect from '@components/FormItem/FormSelect'
import feeService from '@services/fee/feeService'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'

const paymentChanel = {
  cash: 1,
  bank: 2,
  cashAdvance: 5
}

const disabledDate = (current) => {
  return current > new Date() ? true : false
}
export const rules = {
  description: [{ required: true }],
  userId: [{ required: true }],
  paymentChannel: [{ required: true }],
  cashAdvance: [{ required: true }],
  date: [{ required: true }]
}

interface Props {
  record: any
  navigate: any
  feeStore?: FeeStore
  cashAdvanceStore?: CashAdvanceStore
  visible: boolean
  onClose: () => void
  onOk: (refundData: IFeeRefundModel) => Promise<any>
}

interface State {
  loading: boolean
  userOptions: OptionModel[]
  paymentChannels: any
  isSelectCashAdvance: boolean
  listCashAdvance: OptionModel[]
}

export default class FeeRefundModalFrReceipt extends React.PureComponent<Props, State> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      userOptions: [],
      paymentChannels: [],
      isSelectCashAdvance: false,
      listCashAdvance: []
    }
  }

  componentDidUpdate = async (prevProps: Readonly<Props>) => {
    if (!prevProps.visible && this.props.visible) {
      const { feeRefundModel } = this.props.feeStore || {}
      this.form.current?.setFieldsValue(feeRefundModel || {})
      await this.getUserInUnit()
    }
  }

  getUserInUnit = async () => {
    this.setState({ loading: true })
    const unitId = this.props.record.unitId
    const userOptions = await residentService
      .getResidentInUnit({ maxResultCount: 50, skipCount: 0, unitId })
      .finally(() => {
        this.setState({ loading: false })
      })
    const paymentChannels = await feeService.getPaymentChannels({})
    this.setState({ userOptions })
    this.setState({ paymentChannels })
  }

  getCashAdvanceWallets = async (unitId) => {
    if (unitId) {
      await this.props.cashAdvanceStore?.getCashAdvanceWallets({ unitId })
      const listCashAdvance =
        this.props.cashAdvanceStore?.cashAdvanceWallets.map((item) => ({
          id: item?.feeType?.id,
          value: item?.feeType?.id,
          label: `${item?.cashNumber ?? '-'} (${item.feeType?.name})`
        })) ?? []

      this.setState({ listCashAdvance: listCashAdvance })
    }
  }

  onChangePaymentChannel = (channelId: number) => {
    if (channelId === paymentChanel.cashAdvance) {
      if (this.props.record?.unitId) {
        this.getCashAdvanceWallets(this.props.record?.unitId)
      }
      this.setState({ isSelectCashAdvance: true })
    } else {
      this.setState({ isSelectCashAdvance: false })
    }
  }

  onSave = async () => {
    try {
      this.setState({ loading: true })
      await this.form.current
        ?.validateFields()
        .then(async (values: any) => {
          values.id = this.props.record.id
          await this.props.onOk({
            ...(this.props.feeStore?.feeRefundModel || {}),
            ...(values || {})
          })
        })
        .finally(() => this.setState({ loading: false }))
    } catch {
      this.setState({ loading: false })
    }
  }
  onCloseModal = () => {
    this.setState({ isSelectCashAdvance: false })
    this.props.onClose()
  }

  render(): React.ReactNode {
    const { visible } = this.props
    const { userOptions, paymentChannels } = this.state

    return (
      <Modal
        open={visible}
        destroyOnClose
        title={L('FEE_REFUND_RECEIPT_ID_{0}_MODAL_TITLE', this.props.record.id)}
        cancelText={L('BTN_CANCEL')}
        onCancel={this.onCloseModal}
        onOk={this.onSave}
        confirmLoading={this.state.loading}>
        <Form layout="vertical" ref={this.form} validateMessages={validateMessages} size="middle">
          <Row gutter={16}>
            <Col md={{ span: 12 }} sm={{ span: 24 }} className="ant-form-item">
              <span className="ant-form-item-label">
                <label>{L('FEE_REFUND_DEPOSIT_BALANCE')}</label>
              </span>
              <CurrencyInput value={this.props.record.paidAmount} disabled />
            </Col>
            <Col md={{ span: 12 }} sm={{ span: 24 }} className="ant-form-item">
              <span className="ant-form-item-label">
                <label>{L('FEE_REFUND_REFUND_AMOUNT')}</label>
              </span>
              <CurrencyInput value={this.props.record.paidAmount} disabled />
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item
                name="refundDescription"
                label={L('DESCRIPTION')}
                rules={rules.description}
                initialValue={L('REFUND_DEFAULT_DESCRIPTION')}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormSelect
                label={L('FEE_REFUND_AMENITY_PAYMENT_CHANNEL')}
                rule={rules.paymentChannel}
                name="paymentChanel"
                onChange={(value) => this.onChangePaymentChannel(value)}
                options={paymentChannels}
              />
            </Col>
            {this.state.isSelectCashAdvance && (
              <Col md={{ span: 24 }} sm={{ span: 24 }}>
                <FormSelect
                  label={L('FEE_REFUND_AMENITY_CASH_ADVANCE')}
                  rule={rules.cashAdvance}
                  name="moveIntoCashAdvanceFeeTypeId"
                  options={this.state.listCashAdvance}
                />
              </Col>
            )}
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <FormDatePicker label="REFUND_DATE" name="payableDate" rule={rules.date} disabledDate={disabledDate} />
            </Col>
            <Col md={{ span: 24 }} sm={{ span: 24 }}>
              <Form.Item name="userId" label={L('FEE_REFUND_RECEIVER')} rules={rules.userId}>
                <Radio.Group options={userOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
