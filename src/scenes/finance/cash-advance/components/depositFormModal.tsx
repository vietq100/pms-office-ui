import { useEffect, useState } from 'react'
import { Form, Modal, Row, Col, Button, Input, Tooltip } from 'antd'
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
import { DepositModel } from '@models/finance/cashAdvanceModel'
import feeService from '@services/fee/feeService'
import feeTypeService from '@services/fee/feeTypeService'
import unitService from '@services/project/unitService'

const { formVerticalLayout } = AppConsts

const DepositFormModal = ({ visible, data, handleOK, handleCancel, cashAdvanceStore }) => {
  const [form] = Form.useForm()
  const disabledDate = (current) => {
    return current > new Date() ? true : false
  }
  const [initialValues, setInitialValues] = useState<any>({})
  const [userOptions, setUserOptions] = useState<any[]>([])
  const [paymentChannelList, setPaymentChannelList] = useState<any[]>([])
  const [feeTypes, setFeeTypes] = useState<any[]>([])
  const { paymentChannels } = cashAdvanceStore
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (visible) {
      initDeposit()
      handleSearchUsers('')
      getListFeeType('')
    }
  }, [visible])

  const searchPaymentChannelList = async (paymentChannelId) => {
    const paymentMethodResult = await feeService.getPaymentMethodList({
      paymentChannelId
    })
    console.log()

    form.setFieldValue('cashChannelExternalId', undefined)
    setPaymentChannelList(paymentMethodResult.items ?? [])
  }
  const initDeposit = async () => {
    if (data) {
      setUserOptions([data])
      const deposit = new DepositModel(data)
      setInitialValues(deposit)
      form.setFieldsValue(deposit)
    } else {
      setUserOptions([data])
      const deposit = new DepositModel(undefined)
      setInitialValues(deposit)
      form.setFieldsValue(deposit)
    }
  }

  const onOk = debounce(async () => {
    return form.validateFields().then(async (values) => {
      try {
        if (values.feeTypeId === -1) {
          values.feeTypeId = null
        }
        setLoading(true)
        if (data?.unitId) {
          await cashAdvanceStore.createDeposit({
            unitId: data?.unitId,
            ...values
          })
        } else {
          await cashAdvanceStore.createDeposit({
            ...values
          })
        }

        setLoading(false)
        await handleOK()
        handleCancel()
        form.resetFields()
      } catch {
        setLoading(false)
      }
    })
  }, 200)

  const onCancel = async () => {
    form.resetFields()
    handleCancel()
  }

  const handleSearchUsers = debounce(async (keyword) => {
    const data = await await unitService.getAll({ keyword })
    setUserOptions(data?.items)
  }, 200)
  const getListFeeType = debounce(async (keyword) => {
    const listFeeTypes = await feeTypeService.getList({ keyword, isActice: true })

    // listFeeTypes.unshift({
    //   code: 'ALL',
    //   description: 'Select All',
    //   id: -1,
    //   isActive: true,
    //   name: 'Select All'
    // })

    setFeeTypes(listFeeTypes)
  }, 200)

  const selectFeeTypes = {
    onSearch: getListFeeType
  }

  return (
    <>
      <Modal
        title={L('DEPOSIT_FORM_TITLE')}
        open={visible}
        okText={L('BTN_SAVE')}
        onOk={onOk}
        cancelText={L('BTN_CANCEL')}
        onCancel={onCancel}
        confirmLoading={cashAdvanceStore.isLoading}
        destroyOnClose
        footer={[
          <>
            <Button onClick={onCancel}>{L('BTN_CANCEL')}</Button>
            <Button type="primary" loading={loading} onClick={onOk}>
              {L('BTN_SAVE')}
            </Button>
          </>
        ]}
        maskClosable={false}
        okButtonProps={{
          disabled: !isGrantedAny(appPermissions.CashAdvance.create, appPermissions.CashAdvance.update),
          className: !isGrantedAny(appPermissions.CashAdvance.create, appPermissions.CashAdvance.update) ? 'd-none' : ''
        }}>
        <Form layout="vertical" initialValues={initialValues} form={form} validateMessages={validateMessages}>
          <Row gutter={16}>
            {data?.id && (
              <Col sm={{ span: 24 }}>
                <Form.Item label={L('DEPOSIT_UNIT_NAME')}>
                  <Input value={data?.unit?.fullUnitCode} disabled />
                </Form.Item>
              </Col>
            )}
            {!data?.id && (
              <Col sm={{ span: 24 }}>
                <Form.Item label={L('DEPOSIT_UNIT_NAME')} name="unitId" rules={[{ required: true }]}>
                  <Select
                    showSearch
                    showArrow
                    allowClear
                    disabled={data?.id}
                    filterOption={false}
                    className="full-width"
                    onSearch={handleSearchUsers}
                    size="middle">
                    {userOptions?.map((unit: any) => (
                      <Select.Option value={unit?.id} key={unit?.id}>
                        {unit?.fullUnitCode} <span className="text-muted small">({unit?.name})</span>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            <Col md={{ span: 24 }}>
              <FormSelect
                disabled={data}
                label="FEE_TYPE"
                name="feeTypeId"
                options={feeTypes}
                rule={rules.feeTypeId}
                selectProps={selectFeeTypes}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormSelect
                label="DEPOSIT_PAYMENT_CHANNEL"
                name="cashChanelId"
                options={paymentChannels}
                onChange={searchPaymentChannelList}
                rule={rules.paymentChannel}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <Form.Item
                label={L('DEPOSIT_PAYMENT_CHANNEL_DETAIL')}
                {...formVerticalLayout}
                name="cashChannelExternalId">
                <Select allowClear showSearch filterOption={false} className="full-width">
                  {paymentChannelList.map((item: any, index) => (
                    <Select.Option key={index} value={item.id}>
                      <Tooltip
                        trigger="contextMenu"
                        title={
                          <>
                            <label className="fw-bold">({item.accountNo})</label>
                            {` - ${item.code} - ${item.beneficiaryName}`}
                          </>
                        }>
                        <label className="fw-bold">({item.accountNo})</label>
                        {` - ${item.code} - ${item.beneficiaryName}`}
                      </Tooltip>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col md={{ span: 24 }}>
              <FormDatePicker
                label="DEPOSIT_DEPOSIT_DATE"
                name="cashAdvanceDate"
                rule={rules.date}
                disabledDate={disabledDate}
              />
            </Col>
            <Col md={{ span: 24 }}>
              <FormCurrency
                label="DEPOSIT_AMOUNT"
                name="totalAmount"
                rule={rules.balanceAmount}
                min={0}
                maxLength={13}
              />
            </Col>

            <Col md={{ span: 24 }}>
              <FormTextArea label="DEPOSIT_DESCRIPTION" maxLength={2001} name="description" rule={rules.description} />
            </Col>
            {/* <Col md={{ span: 24 }}>
              <FormCheckbox initialValue={false} label={L('IS_DEPOSIT')} name="isDeposit" />
            </Col> */}
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default DepositFormModal
