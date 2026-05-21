import { useEffect, useState } from 'react'
import { Form, Modal, Row, Col, Card, Divider } from 'antd'
import { L, isGrantedAny } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import FormSelect from '@components/FormItem/FormSelect'
import FormCurrency from '@components/FormItem/FormCurrency'
import debounce from 'lodash/debounce'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import Select from 'antd/es/select'
import { WithDrawModel } from '@models/finance/cashAdvanceModel'
import residentService from '@services/member/resident/residentService'
import feeService from '@services/fee/feeService'
import { OptionModel } from '@models/global'
import FormInput from '@components/FormItem/FormInput'
import { filterOptions, formatCurrency } from '@lib/helper'
const { formVerticalLayout } = AppConsts
const Option = Select.Option
const WithDrawModal = ({ visible, data, handleOK, handleCancel, cashAdvanceStore }) => {
  const [form] = Form.useForm()

  const [initialValues, setInitialValues] = useState<any>({})
  const [userOptions, setUserOptions] = useState<any[]>([])
  const [advanceWallets, setAdvanceWallets] = useState<any[]>([])
  const [paymentChannel, setPaymentChannel] = useState<any[]>([])
  const [paymentChannelList, setPaymentChannelList] = useState<any[]>([])
  const [isSelectAdvanceWallets, setIsSelectAdvanceWallets] = useState(false)

  const disabledDate = (current) => {
    return current > new Date() ? true : false
  }

  useEffect(() => {
    if (visible) {
      if (data?.id) {
        initWithDraw()
        handleSearchUsers('')
        getListPayment('')
        cashAdvancesOfUnit(data?.unitId, data?.id)
        setIsSelectAdvanceWallets(false)
      }
    }
  }, [visible])

  const searchPaymentChannelList = async (paymentChannelId) => {
    const paymentMethodResult = await feeService.getPaymentMethodList({
      paymentChannelId
    })
    const dataRemap = (paymentMethodResult.items ?? []).map(
      (item) => new OptionModel(item.id, `${item.code} - ${item.beneficiaryName}(${item.accountNo})`)
    )
    setPaymentChannelList(dataRemap)
  }
  const getListPayment = async (keyword) => {
    const result = await feeService.getListPaymentChannels(keyword)

    setPaymentChannel(result)
  }
  const initWithDraw = async () => {
    setUserOptions([data])
    const withDraw = new WithDrawModel(data)
    setInitialValues(withDraw)
    form.setFieldsValue(withDraw)
  }

  const onOk = debounce(async () => {
    return form.validateFields().then(async (values) => {
      if (values.feeTypeId === -1) {
        values.feeTypeId = null
      }

      await cashAdvanceStore.withDraw({
        ...values,
        cashAdvanceId: data.id
      })

      await handleOK()
      handleCancel()
      form.resetFields()
    })
  }, 200)

  const onCancel = async () => {
    form.resetFields()
    handleCancel()
  }

  const cashAdvancesOfUnit = debounce(async (unitId, cashAdvanceId) => {
    await cashAdvanceStore.getCashAdvanceWallets({ unitId, cashAdvanceId })
    const res = cashAdvanceStore.cashAdvanceWallets.map((item) => ({
      id: item.feeType?.id,
      name: `${item.cashNumber ?? '-'} (${item.feeType?.name})`
    }))
    setAdvanceWallets(res)
  }, 200)
  const handleSearchUsers = debounce(async (keyword) => {
    const data = await residentService.getResidentInUnit({ keyword }, true)

    setUserOptions(data)
  }, 200)

  const onSelectCashAdvance = (value) => {
    if (value) {
      form.setFieldValue('channelId', 5) // 5 is cash advance
      setIsSelectAdvanceWallets(true)
    } else {
      form.setFieldValue('channelId', undefined)
      setIsSelectAdvanceWallets(false)
    }
  }
  const selectUserProps = {
    onSearch: handleSearchUsers
  }

  return (
    <>
      <Modal
        title={L('WITH_DRAW_FORM_TITLE')}
        open={visible}
        okText={L('BTN_SAVE')}
        onOk={onOk}
        cancelText={L('BTN_CANCEL')}
        onCancel={onCancel}
        confirmLoading={cashAdvanceStore.isLoading}
        destroyOnClose
        maskClosable={false}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.CashAdvance.create, appPermissions.CashAdvance.withDraw),
          className: !isGrantedAny(appPermissions.CashAdvance.create, appPermissions.CashAdvance.withDraw)
            ? 'd-none'
            : ''
        }}>
        <Form layout="vertical" initialValues={initialValues} form={form} validateMessages={validateMessages}>
          <Row gutter={16}>
            <Card className="w-100" bordered={true}>
              <Row gutter={16}>
                <Col sm={{ span: 24 }}>
                  <label>
                    {L('CASH_NUMBER')}: <strong> {data?.cashNumber ? data?.cashNumber : '--'}</strong>
                  </label>
                </Col>
                <Col sm={{ span: 24 }}>
                  <label>
                    {L('WITH_DRAW_UNIT_NAME')}: <strong> {data?.unit?.name ?? '--'}</strong>
                  </label>
                </Col>
                <Col sm={{ span: 24 }}>
                  <label>
                    {L('FEE_TYPE')}: <strong> {data?.feeType?.name ?? '--'}</strong>
                  </label>
                </Col>
                <Col sm={{ span: 24 }}>
                  <label>
                    {L('BALANCE_AMOUNT')}:{' '}
                    <strong style={{ color: 'green' }}> {formatCurrency(data?.balanceAmount) ?? '--'}</strong>
                  </label>
                </Col>
              </Row>
            </Card>
            <Col sm={{ span: 12 }}>
              <FormInput hidden name="cashNumber" disabled label={L('CASH_NUMBER')} />
            </Col>
            <Col sm={{ span: 12 }}>
              <FormSelect
                label="WITH_DRAW_UNIT_NAME"
                name="unitId"
                hidden
                options={userOptions}
                selectProps={selectUserProps}
                rule={rules.userId}
                disabled
                optionModal={(option, index) => {
                  return !option ? null : (
                    <Select.Option key={index} value={option.unitId}>
                      {option.unit?.fullUnitCode}
                    </Select.Option>
                  )
                }}
              />
            </Col>

            <Col sm={{ span: 24 }}>
              <FormCurrency
                label={L('BALANCE_AMOUNT')}
                name="amount"
                rule={rules.balanceAmount}
                min={0}
                hidden
                maxLength={13}
                disabled
              />
            </Col>
            <Divider orientation="left">{L('WITH_DRAW_INFO')}</Divider>
            <Col md={{ span: 24 }}>
              <FormSelect
                label="CASH_ADVANCE_INHERIT"
                name="moveIntoCashAdvanceFeeTypeId"
                options={advanceWallets}
                onChange={(value) => onSelectCashAdvance(value)}
              />
            </Col>
            <Col md={{ span: 12 }}>
              <Form.Item
                label={L('WITH_DRAW_PAYMENT_CHANNEL')}
                {...formVerticalLayout}
                rules={rules.paymentChannel}
                name="channelId">
                <Select
                  disabled={isSelectAdvanceWallets}
                  style={{ width: '100%' }}
                  showSearch
                  onChange={searchPaymentChannelList}
                  filterOption={filterOptions}>
                  {(paymentChannel || []).map((option, index) => (
                    <Option disabled={option.id === 5} key={index} value={option.value || option.id}>
                      {L(option.label || option.name)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 12 }}>
              <FormSelect
                disabled={isSelectAdvanceWallets}
                label="WITH_DRAW_PAYMENT_CHANNEL_DETAIL"
                name="cashChannelExternalId"
                options={paymentChannelList}
                // rule={rules.paymentChannel}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormDatePicker
                label="WITH_DRAW_DATE"
                name="cashReceiptDate"
                rule={rules.date}
                disabledDate={disabledDate}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormCurrency
                label="WITH_DRAW_AMOUNT"
                name="amount"
                rule={rules.date}
                max={data?.balanceAmount}
                min={0}
                maxLength={13}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormTextArea
                maxLength={2001}
                label="WITH_DRAW_DESCRIPTION"
                name="description"
                rule={rules.description}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default WithDrawModal
