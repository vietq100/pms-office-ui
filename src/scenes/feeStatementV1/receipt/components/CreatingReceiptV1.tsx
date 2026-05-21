import { ArrowDownOutlined, ArrowUpOutlined, WalletOutlined } from '@ant-design/icons'
import { L, LError } from '@lib/abpUtility'
import AppConst, { appPermissions, dateFormat } from '@lib/appconst'
import { formatCurrency, notifyError } from '@lib/helper'
import { validateMessages } from '@lib/validation'
import receiptService from '@services/fee/receiptService'
import PackageFeeStore from '@stores/fee/packageFeeStore'
import ReceiptStore from '@stores/fee/receiptStore'
import Stores from '@stores/storeIdentifier'
import { Button, Col, DatePicker, Divider, Empty, Row, Select, Spin } from 'antd'
import Form from 'antd/lib/form'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import { inject, observer } from 'mobx-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import FormSelect from '@components/FormItem/FormSelect'
import feeService from '@services/fee/feeService'
import FeeStore from '@stores/fee/feeStore'
import AdhocInvoice from './AdhocInvoice'
import { PreviewReceiptBeforeCreate } from './PreviewReceiptBeforeCreate'
import SessionStore from '@stores/sessionStore'
import FormNumber from '@components/FormItem/FormNumber'
import FormInput from '@components/FormItem/FormInput'
import FormCheckbox from '@components/FormItem/FormCheckbox'
import { ConfirmCreateReceiptModal } from './ConfirmCreateReceiptModal'
import dayjs from 'dayjs'
import NoRole from '@components/ComponentNoRole'
import _ from 'lodash'
import ResidentStore from '@stores/member/resident/residentStore'
import companyService from '@services/project/companyService'

const { feeSourceGroup, formVerticalLayout } = AppConst

const FeeReceipt = { FeeStatement: 'FeeStatement' }
const feeSourceGroups = Object.keys(FeeReceipt).map((key) => ({
  label: L(`FEE_SOURCE_GROUP_${key}`),
  value: feeSourceGroup[key]
}))

const PAYMENT_CHANNELS = { cashAdvance: 5 }
const FEE_TYPE = { bookingAmenityFee: 'DEP', depositBookingAmenity: 'DEP' }

type FeeDetail = {
  id?: number
  fullUnitCode: string
  customerName: string
  debitAmount: number
  billNumber: string
  feePayStatusId: number
  description: string
  isSelected: boolean
  feeTypeId: number
  feeType: { name: string; code: string }
  package: { name: string; period: number; year: number }
  cashAdvanceWallet?: { balanceAmount: number }
}

interface Props {
  navigate: any
  packageFeeStore?: PackageFeeStore
  receiptStore?: ReceiptStore
  feeStore?: FeeStore
  residentStore?: ResidentStore
}

const CreatingReceipt = observer(({ navigate, receiptStore, residentStore }: Props) => {
  const form = useRef<any>(null)
  const isGranted = (permission: string) => abp.auth.isGranted(permission)

  const [feeDetails, setFeeDetails] = useState<FeeDetail[]>([])
  const [feeGroups, setFeeGroups] = useState<any[]>([])

  const [totalDebit, setTotalDebit] = useState(0)
  const [listPayment, setListPayment] = useState<any[]>([])
  const [showCreateReceipt, setShowCreateReceipt] = useState(false)
  const [visiblePreview, setVisiblePreview] = useState(false)
  const [visibleConfirm, setVisibleConfirm] = useState(false)
  const [infoPayer, setInfoPayer] = useState<any>({})

  const [isSortNew, setIsSortNew] = useState(false)
  const [isLoadingConfirmSave, setIsLoadingConfirmSave] = useState(false)

  const [isReceipt, setIsReceipt] = useState(false)
  const [listCompany, setListCompany] = useState([])

  useEffect(() => {
    form.current?.setFieldsValue({ groupName: feeSourceGroup.feeManagement, paymentChannelId: 1 })
    feeService.getListPaymentChannels({}).then(setListPayment)
    getListCompanies()
  }, [])

  const getListCompanies = async () => {
    const result = await companyService.getListCompany()
    setListCompany(result)
  }
  const getSelectedOutStanding = () => {
    const formFeeGroups = form.current?.getFieldValue('feeGroups') || []
    return formFeeGroups.reduce((data, group) => {
      group.feeDetails
        .filter((item) => item.isSelected)
        .forEach((item) => {
          const feeInfo = feeDetails.find((fd) => fd.id === item.feeDetailId)
          data.push({ ...feeInfo, ...item })
        })
      return data
    }, [])
  }

  const getTotalDebitSelected = () => {
    const formFeeGroups = form.current?.getFieldValue('feeGroups') || []
    return formFeeGroups.reduce((total, item) => {
      const selectedFeePaidAmount = item.feeDetails
        .filter((feeItem) => feeItem.isSelected)
        .reduce((acc, feeItem) => acc + Number(feeItem.paidAmount), 0)
      return total + selectedFeePaidAmount
    }, 0)
  }

  const getCashAdvanceAmount = () => {
    let cashAdvanceAmount = 0
    getSelectedOutStanding().forEach((item) => {
      if (Number(item.paidAmount) - item.totalAmount > 0) {
        cashAdvanceAmount += Number(item.paidAmount) - item.debitAmount
      }
    })
    return cashAdvanceAmount
  }

  const getReceiptFeeAmount = () => {
    let receiptFeeAmount = 0
    getSelectedOutStanding().forEach((item) => {
      const diff = Number(item.paidAmount) - item.debitAmount
      if (diff === 0) receiptFeeAmount += Number(item.paidAmount)
      else if (diff > 0) receiptFeeAmount += item.debitAmount
      else receiptFeeAmount += Number(item.paidAmount)
    })
    return receiptFeeAmount
  }

  const getPayerInfo = () => {
    const formData = form.current?.getFieldsValue() || {}
    const { companyId } = formData
    if (!companyId) throw new Error(LError('RESIDENT_WAS_NOT_SELECTED'))
    const foundInfoCompany = residentStore?.residents?.items.find((company: any) => company.companyId === companyId)
    const paymentChannel = listPayment.find((payment: any) => payment.id === formData.paymentChannelId)
    return {
      fullUnitCode: get(foundInfoCompany, 'fullUnitCode'),
      incomingDate: formData.incomingDate,
      paymentChanelId: paymentChannel.id,
      paymentName: paymentChannel?.name,
      paymentChannelExternalId: formData.paymentChannelExternalId,
      groupName: formData.groupName,
      companyId: formData.companyId,
      companyName: foundInfoCompany?.company?.companyName,
      fullName: get(foundInfoCompany, 'displayName'),
      email: get(foundInfoCompany, 'emailAddress'),
      phoneNumber: foundInfoCompany?.phoneNumber,
      cashAdvanceAmount: getCashAdvanceAmount(),
      receiptFeeAmount: getReceiptFeeAmount()
    }
  }

  const validateDEPFee = (feeGroupsData) => {
    const numberSelectedDEPFee = feeGroupsData.reduce((num, group) => {
      return (
        num +
        (group.feeDetails || []).filter(
          (item) => item.isSelected && item.feeTypeCode === FEE_TYPE.depositBookingAmenity
        ).length
      )
    }, 0)
    if (numberSelectedDEPFee > 1) {
      notifyError('', L('ERROR_RECEIPT_ONLY_ALLOW_TO_SELLECT_1_DEP_TO_CREATE_RECEIPT'))
      return false
    }
    return true
  }

  const onPreview = (isReceiptFlag: boolean) => {
    setIsReceipt(isReceiptFlag)
    form.current?.validateFields().then(() => {
      const { feeGroups: formFeeGroups } = form.current?.getFieldsValue() || {}
      if (!validateDEPFee(formFeeGroups)) return
      setInfoPayer(getPayerInfo())
      setVisiblePreview(true)
    })
  }

  const hideShowConfirm = () => setVisibleConfirm((prev) => !prev)

  const onOk = async () => {
    form.current?.validateFields().then(async () => {
      const formData = form.current?.getFieldsValue() || {}
      const { incomingDate, paymentChannelId, feeGroups: formFeeGroups, paymentChannelExternalId } = formData
      if (!validateDEPFee(formFeeGroups)) return

      const feePayer = getPayerInfo()
      const feeDetailsBody = formFeeGroups.reduce((data, group: any) => {
        group.feeDetails
          .filter((item) => item.isSelected)
          .forEach((item) => {
            data.push({ feeDetailId: item.feeDetailId, paidAmount: item.paidAmount })
          })
        return data
      }, [])

      const body = {
        feeDetails: feeDetailsBody,
        feePayer,
        incomingDate,
        paymentChannelId,
        paymentChannelExternalId,
        companyId: feePayer?.companyId
      }

      setIsLoadingConfirmSave(true)
      await receiptStore?.create(body).then((res) => {
        hideShowConfirm()
        setIsLoadingConfirmSave(false)
        navigate(portalLayouts.feeReceiptDetailV1.path.replace(':id', res.id))
      })
    })
  }

  const handleSelectFee = async (groupIndex, feeDetailIndex, debitAmount, cashAdvanceAmount) => {
    const { feeGroups: formFeeGroups, paymentChannelId } = form.current?.getFieldsValue() || {}
    if (
      formFeeGroups.length < groupIndex ||
      !formFeeGroups[groupIndex].feeDetails ||
      formFeeGroups[groupIndex].feeDetails.length < feeDetailIndex
    )
      return

    const { isSelected } = formFeeGroups[groupIndex].feeDetails[feeDetailIndex]
    const isSelectedAll = !formFeeGroups.some((group) => group.feeDetails.some((item) => !item.isSelected))
    formFeeGroups[groupIndex].feeDetails[feeDetailIndex].paidAmount = isSelected
      ? paymentChannelId === PAYMENT_CHANNELS.cashAdvance
        ? cashAdvanceAmount || 0
        : debitAmount
      : 0
    form.current?.setFieldsValue({ isSelectedAll, feeGroups: formFeeGroups })
  }

  const onChangePaymentChannel = (feeGroupsData) => {
    const { paymentChannelId, groupName } = form.current?.getFieldsValue() || {}
    const isCashAdvance = paymentChannelId === PAYMENT_CHANNELS.cashAdvance
    const isDEPFeeGroup = groupName === feeSourceGroup.feeReservationDeposit
    let isSelectedAll = !isDEPFeeGroup
    const formFeeGroups = feeGroupsData.map((item) => {
      const formFeeDetails = item.feeDetails.map((fd) => {
        if (isSelectedAll && isCashAdvance) isSelectedAll = fd.cashAdvanceWallet?.balanceAmount > 0
        return {
          isSelected: isDEPFeeGroup ? false : isCashAdvance ? fd.cashAdvanceWallet?.balanceAmount > 0 : true,
          feeDetailId: fd.id,
          feeTypeCode: fd.feeType?.code,
          feeTypeName: fd.feeType?.name,
          debitAmount: fd.debitAmount,
          paidAmount: isCashAdvance ? fd.cashAdvanceWallet?.balanceAmount || 0 : fd.debitAmount
        }
      })
      return { packageId: item.packageId, feeDetails: formFeeDetails }
    })
    form.current?.setFieldsValue({ feeGroups: formFeeGroups, isSelectedAll })
  }

  const selectOrDeselectAll = () => {
    const { isSelectedAll, feeGroups: formFeeGroups } = form.current?.getFieldsValue() || {}
    formFeeGroups.forEach((group) => {
      ;(group.feeDetails || []).forEach((fd) => (fd.isSelected = isSelectedAll))
    })
    form.current?.setFieldsValue({ feeGroups: formFeeGroups })
  }

  const updatePaidAmount = useCallback(
    debounce((groupIndex, feeDetailIndex) => {
      const { feeGroups: formFeeGroups } = form.current?.getFieldsValue() || {}
      if (
        formFeeGroups.length < groupIndex ||
        !formFeeGroups[groupIndex].feeDetails ||
        formFeeGroups[groupIndex].feeDetails.length < feeDetailIndex
      )
        return
      const isSelected = formFeeGroups[groupIndex].feeDetails[feeDetailIndex].paidAmount > 0
      form.current?.setFieldValue(['feeGroups', groupIndex, 'feeDetails', feeDetailIndex, 'isSelected'], isSelected)
    }, 300),
    []
  )

  const prepareFeeGroups = (groups, selectedFeeId?, isDEPFeeGroup?) => {
    const { cashAdvanceWallets } = receiptStore!
    const remainingWallet = cashAdvanceWallets.reduce((data, item) => {
      data[item.feeType.id] = item.balanceAmount
      return data
    }, {})

    return Object.keys(groups).map((key) => {
      groups[key].forEach((feeDetail) => {
        feeDetail.isSelected = isDEPFeeGroup ? false : !selectedFeeId || selectedFeeId === feeDetail.id
        const remainingWalletBalance =
          remainingWallet[feeDetail.feeTypeId] > feeDetail.debitAmount
            ? feeDetail.debitAmount
            : remainingWallet[feeDetail.feeTypeId]
        remainingWallet[feeDetail.feeTypeId] -= remainingWalletBalance || 0
        feeDetail.cashAdvanceWallet = { balanceAmount: remainingWalletBalance }
      })
      return {
        packageId: key,
        package: groups[key].length ? groups[key][0].package || {} : {},
        feeDetails: groups[key]
      }
    })
  }

  const getOutStanding = async (companyId?, groupName?, selectedFeeId?) => {
    setShowCreateReceipt(false)
    try {
      const formData = form.current?.getFieldsValue() || {}
      companyId = companyId || formData?.companyId
      groupName = groupName || formData?.groupName

      if (companyId) {
        const feeDetailsData = await receiptService.getOutStanding({ companyId })
        const sort = isSortNew
          ? feeDetailsData.sort(
              (a, b) => (new Date(b.package.startDate) as any) - (new Date(a.package.startDate) as any)
            )
          : feeDetailsData.sort(
              (a, b) => (new Date(a.package.startDate) as any) - (new Date(b.package.startDate) as any)
            )
        const isDEPFeeGroup = formData.groupName === feeSourceGroup.feeReservationDeposit
        const groups = _(sort)
          .groupBy((item) => item.packageId)
          .sortBy((group) => feeDetailsData.indexOf(group[0]))
          .value()
        const preparedFeeGroups = await prepareFeeGroups(groups, selectedFeeId, isDEPFeeGroup)
        const total = feeDetailsData.reduce((acc, item) => acc + item.debitAmount, 0)
        onChangePaymentChannel(preparedFeeGroups)
        setFeeDetails(feeDetailsData)
        setFeeGroups(preparedFeeGroups)
        setTotalDebit(total)
      } else {
        setFeeDetails([])
      }
    } catch (e) {
      console.log(e)
    }
  }

  const onSortFeeDetails = () => {
    setIsSortNew((prev) => !prev)
    getOutStanding()
  }

  // const setUnitId = async () => {
  //   const formData = form.current?.getFieldsValue() || {}
  //   const companyId = Number(formData.companyId)
  //   form.current?.setFieldsValue({ companyId })
  //   await getOutStanding(companyId)
  // }

  const totalDebitSelected = getTotalDebitSelected()

  return isGranted(appPermissions.feeReceipt.create) ? (
    <>
      <Form layout={'vertical'} ref={form} validateMessages={validateMessages} size="middle">
        <Row gutter={[16, 8]} className="create-receipt-content">
          <Col md={{ span: 8 }} className="create-receipt-filter">
            <Row gutter={[16, 0]}>
              <Col md={{ span: 24 }}>
                <FormSelect
                  label="CONTRACT_COMPANY"
                  name="companyId"
                  rule={[{ required: true }]}
                  options={listCompany}
                />
              </Col>
              <Col md={{ span: 24 }}>
                <Form.Item
                  name={'incomingDate'}
                  label={L('FEE_RECEIPT_INCOMING_DATE')}
                  rules={[{ required: true }]}
                  initialValue={dayjs()}>
                  <DatePicker
                    format={dateFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                    disabledDate={(current) => current > dayjs()}
                  />
                </Form.Item>
              </Col>
              <Col md={{ span: 24 }}>
                <FormSelect
                  selectProps={{ size: 'middle' }}
                  rule={[{ required: true }]}
                  options={listPayment}
                  label={L('PAYMENT_CHANEL')}
                  name={'paymentChannelId'}
                  onChange={() => {
                    onChangePaymentChannel(feeGroups)
                    form.current?.setFieldsValue({ paymentChannelExternalId: undefined })
                  }}
                />
              </Col>
              <Col md={{ span: 24 }}>
                <Form.Item label={L('PAYMENT_CHANNEL_DETAIL')} {...formVerticalLayout} name="paymentChannelExternalId">
                  <Select style={{ width: '100%' }} options={[]}></Select>
                </Form.Item>
              </Col>
              <Col md={{ span: 24 }}>
                <Form.Item name={'groupName'} label={L('FEE_SOURCE')} rules={[{ required: true }]} shouldUpdate>
                  <Select allowClear filterOption={false} className="full-width" onChange={() => getOutStanding()}>
                    {(feeSourceGroups || []).map((item: any, index) => (
                      <Select.Option key={index} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {!showCreateReceipt ? (
            <Col md={{ span: 16 }} className="flex column receipt-fees">
              <h3 className="mb-0 mt-0 flex-auto">
                <FormCheckbox
                  name="isSelectedAll"
                  formItemClass="mb-0 form-item-small"
                  label={L('RECEIPT_FEE_DETAILS')}
                  onChange={() => selectOrDeselectAll()}
                />
              </h3>
              <div className="flex column create-receipt flex-1">
                <Spin spinning={false}>
                  <Col span={24} style={{ textAlign: 'right' }}>
                    {isSortNew ? (
                      <ArrowUpOutlined style={{ fontSize: '120%' }} onClick={onSortFeeDetails} />
                    ) : (
                      <ArrowDownOutlined style={{ fontSize: '120%' }} onClick={onSortFeeDetails} />
                    )}
                  </Col>
                  {feeGroups.map((feeGroup, feeGroupIndex) => (
                    <React.Fragment key={feeGroupIndex}>
                      <Row gutter={[16, 8]} className="receipt-group-package">
                        <Col sm={{ span: 24 }}>
                          <Divider orientation="left" plain style={{ margin: 0 }}>
                            <h4 style={{ fontWeight: 600 }}>
                              {L('FEE_PACKAGE')}: {feeGroup.package?.name}
                            </h4>
                          </Divider>
                        </Col>
                      </Row>
                      {feeGroup.feeDetails.map((feeDetail: FeeDetail, feeDetailIndex) => {
                        const paidAmount =
                          form.current?.getFieldValue([
                            'feeGroups',
                            feeGroupIndex,
                            'feeDetails',
                            feeDetailIndex,
                            'paidAmount'
                          ]) || 0
                        return (
                          <Row gutter={[8, 16]} key={feeDetailIndex}>
                            <Col sm={{ span: 12 }}>
                              <FormCheckbox
                                name={['feeGroups', feeGroupIndex, 'feeDetails', feeDetailIndex, 'isSelected']}
                                formItemClass="mb-0 form-item-small"
                                label={`${feeDetail.billNumber ? feeDetail.billNumber : L('EMPTY')} - ${
                                  feeDetail.feeType?.name
                                }`}
                                onChange={() =>
                                  handleSelectFee(
                                    feeGroupIndex,
                                    feeDetailIndex,
                                    feeDetail.debitAmount,
                                    feeDetail.cashAdvanceWallet?.balanceAmount
                                  )
                                }
                              />
                              <div className="text-truncate-2 text-muted small" style={{ paddingLeft: '25px' }}>
                                {feeDetail.description}
                                {form.current?.getFieldValue('paymentChannelId') === PAYMENT_CHANNELS.cashAdvance &&
                                  feeDetail.cashAdvanceWallet && (
                                    <b>
                                      <br />
                                      <WalletOutlined />
                                      {formatCurrency(feeDetail.cashAdvanceWallet?.balanceAmount || 0)}
                                    </b>
                                  )}
                              </div>
                            </Col>
                            <Col sm={{ span: 6 }} className="text-right">
                              <div className="small">
                                {L('TOTAL_DEBIT_AMOUNT')}: {formatCurrency(feeDetail.debitAmount)}
                                <br />
                                {paidAmount <= feeDetail.debitAmount ? (
                                  <span>
                                    {L('TOTAL_REMAINING_AMOUNT')}: {formatCurrency(feeDetail.debitAmount - paidAmount)}
                                  </span>
                                ) : (
                                  <span>
                                    {L('AMOUNT_ADDED_TO_CASH_ADVANCE_WALLET')}:{' '}
                                    {'+' + formatCurrency(paidAmount - feeDetail.debitAmount)}
                                  </span>
                                )}
                              </div>
                            </Col>
                            <Col sm={{ span: 6 }}>
                              <FormNumber
                                max={11}
                                formItemClass="mb-0"
                                placeholder={L('PAID_AMOUNT')}
                                disabled={feeDetail.feeType.code === FEE_TYPE.bookingAmenityFee}
                                name={['feeGroups', feeGroupIndex, 'feeDetails', feeDetailIndex, 'paidAmount']}
                                onChange={() => updatePaidAmount(feeGroupIndex, feeDetailIndex)}
                              />
                              <FormInput
                                hidden={true}
                                name={['feeGroups', feeGroupIndex, 'feeDetails', feeDetailIndex, 'feeDetailId']}
                              />
                              <FormInput
                                hidden={true}
                                name={['feeGroups', feeGroupIndex, 'feeDetails', feeDetailIndex, 'feeTypeCode']}
                              />
                              <FormInput
                                hidden={true}
                                name={['feeGroups', feeGroupIndex, 'feeDetails', feeDetailIndex, 'debitAmount']}
                              />
                              <FormInput
                                hidden={true}
                                name={['feeGroups', feeGroupIndex, 'feeDetails', feeDetailIndex, 'feeTypeName']}
                              />
                            </Col>
                          </Row>
                        )
                      })}
                    </React.Fragment>
                  ))}
                  {feeGroups.length === 0 && (
                    <Empty
                      className={'fee-detail-empty'}
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ backgroundColor: 'white', padding: '16px 0', margin: 0 }}
                    />
                  )}
                </Spin>
              </div>
              <Row className="create-receipt-footer">
                <Col sm={{ span: 12 }}>
                  <Row gutter={[0, 8]}>
                    <Button onClick={() => navigate(portalLayouts.ReceiptAndVoucher.path)} className={'mr-2'}>
                      {L('BTN_CANCEL')}
                    </Button>
                    {isGranted(appPermissions.feeReceipt.create) && (
                      <Button
                        className={'mr-2'}
                        type="primary"
                        onClick={() => onPreview(false)}
                        disabled={!totalDebitSelected}>
                        {L('BTN_PREVIEW_NOTICE')}
                      </Button>
                    )}
                    {isGranted(appPermissions.feeReceipt.create) && (
                      <Button type="primary" onClick={() => onPreview(true)} disabled={!totalDebitSelected}>
                        {L('BTN_CONFIRM_PREVIEW')}
                      </Button>
                    )}
                  </Row>
                </Col>
                <Col md={{ span: 12 }} className="text-right">
                  <div className="mb-0">
                    <span>{L('RECEIPT_TOTAL_DEBIT')}: </span>
                    <span className="price">{formatCurrency(totalDebit)}</span>
                  </div>
                  <h4 className="mb-0">
                    <span>{L('RECEIPT_NEED_TO_PAY')}: </span>
                    <span className="total price">{formatCurrency(totalDebitSelected)}</span>
                  </h4>
                </Col>
              </Row>
            </Col>
          ) : (
            <Col md={{ span: 16 }} sm={{ span: 16 }}>
              <h3 className="mb-0 mt-3">{L('ADHOC_INVOID')}</h3>
              <Row style={{ marginTop: 8 }}>
                <AdhocInvoice infoPayer={getPayerInfo()} navigate={navigate} />
              </Row>
            </Col>
          )}
        </Row>
      </Form>
      <PreviewReceiptBeforeCreate
        isReceipt={isReceipt}
        isSortNew={isSortNew}
        sessionStore={new SessionStore()}
        payerInfo={infoPayer}
        visible={visiblePreview}
        onCancel={() => setVisiblePreview(false)}
        dataSelect={getSelectedOutStanding()}
        onReceipt={hideShowConfirm}
      />
      <ConfirmCreateReceiptModal
        isLoadingConfirmSave={isLoadingConfirmSave}
        visible={visibleConfirm}
        onOk={onOk}
        feeGroups={form.current?.getFieldValue('feeGroups') || []}
        onCancel={hideShowConfirm}
      />
    </>
  ) : (
    <NoRole />
  )
})

const InjectedCreatingReceipt = inject(
  Stores.PackageFeeStore,
  Stores.ResidentStore,
  Stores.ReceiptStore
)(CreatingReceipt)
export default withRouter(InjectedCreatingReceipt)
