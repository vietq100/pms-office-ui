import { EditableCell } from '@components/DataTableV2/EditableCell'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { FeeTypeEnum, paymentScheduleStatusEnum } from '@lib/enum'
import { formatNumber, inputNumberFormatter, inputNumberParse, renderDate, calculateDurationToText } from '@lib/helper'
import { generateSchedule } from '@lib/leaseCalculator'
import { validateMessages } from '@lib/validation'
import rules from '../validation'
import { Button, Card, Col, Form, FormInstance, Input, InputNumber, Modal, Row, Table } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useEffect } from 'react'
import FormNumber from '@components/FormItem/FormNumber'
import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'

const previewColumns = [
  {
    title: L('PAYMENT_SCHEDULE_PERIOD_NAME'),
    dataIndex: 'name',
    key: 'name',
    width: 100,
    render: (name: any) => {
      const parts = (name ?? '').split('_')
      return (
        <strong>
          {parts[1] && L('PERIOD_{0}', parts[1])} {parts[3] && L('PATH_{0}', parts[3])}
        </strong>
      )
    }
  },
  { title: L('START_DATE'), dataIndex: 'startDate', key: 'startDate', width: 90, render: renderDate },
  { title: L('END_DATE'), dataIndex: 'endDate', key: 'endDate', width: 90, render: renderDate },
  {
    title: L('RENT_LA_AMOUNT'),
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    align: 'right' as const,
    render: (v: any) => <strong>{formatNumber(v)}</strong>
  }
]

const previewSummary = (data: readonly any[]) => {
  const total = data.reduce((sum, r) => sum + (r.amount ?? 0), 0)
  return (
    <Table.Summary.Row className="row-total">
      <Table.Summary.Cell index={0} colSpan={3}>
        <strong>{L('TOTAL')}</strong>
      </Table.Summary.Cell>
      <Table.Summary.Cell index={1} align="right">
        <strong>{formatNumber(Math.round(total))}</strong>
      </Table.Summary.Cell>
    </Table.Summary.Row>
  )
}

interface IAddendumModalProps {
  visible: boolean
  isLoading: boolean
  onOk: (generatedByUnit: Map<number, { rent: any[]; management: any[] }>) => void
  onCancel: () => void
  formRef: FormInstance
  formAddendum: FormInstance
  selectedUnitIds: number[]
  listUnit: any[]
  addendumRents: any[]
  columnsAddendumRent: any[]
  formAddendumRent: FormInstance
  visibleActionAddendumRent: boolean
  onAddAddendumRentRow: (unitId: number) => void

  addendumManagements: any[]
  columnsAddendumMgmt: any[]
  formAddendumMgmt: FormInstance
  visibleActionAddendumMgmt: boolean
  onAddAddendumMgmtRow: (unitId: number) => void

  existingPayments: any[]
  onPaymentTermChange: (newTerm: any) => void
  addendumPaymentTerm: number
}

const AddendumModal = ({
  visible,
  isLoading,
  onOk,
  onCancel,
  formRef,
  formAddendum,
  selectedUnitIds,
  listUnit,
  addendumRents,
  columnsAddendumRent,
  formAddendumRent,
  visibleActionAddendumRent,
  onAddAddendumRentRow,
  addendumManagements,
  columnsAddendumMgmt,
  formAddendumMgmt,
  visibleActionAddendumMgmt,
  onAddAddendumMgmtRow,

  existingPayments,
  onPaymentTermChange,
  addendumPaymentTerm
}: IAddendumModalProps) => {
  const watchedExpiryDate = Form.useWatch('expiryDate', formAddendum)

  const generatedByUnit = useMemo(() => {
    const commencementDate = formRef.getFieldValue('commencementDate')
    const expiryDate = watchedExpiryDate
    const paymentTerm = addendumPaymentTerm ?? formRef.getFieldValue('paymentTerm')
    const paymentDate = formRef.getFieldValue('paymentDate')

    if (!commencementDate || !expiryDate || paymentTerm == null)
      return new Map<number, { rent: any[]; management: any[] }>()

    const getPaidItems = (unitId: number, feeTypeId: number) =>
      existingPayments.filter(
        (p) => p.unitId === unitId && p.feeTypeId === feeTypeId && p.statusId === paymentScheduleStatusEnum.paid
      )

    const getMaxPaidEndDate = (paidItems: any[]): dayjs.Dayjs | null => {
      if (!paidItems.length) return null
      return paidItems.reduce((max, p) => {
        const d = dayjs(p.endDate)
        return d.isAfter(max) ? d : max
      }, dayjs(paidItems[0].endDate))
    }

    const map = new Map<number, { rent: any[]; management: any[] }>()
    selectedUnitIds.forEach((unitId) => {
      const paidRent = getPaidItems(unitId, FeeTypeEnum.rentFee)
      const paidMgmt = getPaidItems(unitId, FeeTypeEnum.managerFee)
      const maxPaidRent = getMaxPaidEndDate(paidRent)
      const maxPaidMgmt = getMaxPaidEndDate(paidMgmt)

      const rentDetails = addendumRents.filter(
        (r) => r.unitId === unitId && !r._isNew && r.startDate && r.endDate && r.amount
      )
      const mgmtDetails = addendumManagements.filter(
        (r) => r.unitId === unitId && !r._isNew && r.startDate && r.endDate && r.amount
      )

      const rentStart = maxPaidRent ? maxPaidRent.add(1, 'day').toISOString() : commencementDate
      const mgmtStart = maxPaidMgmt ? maxPaidMgmt.add(1, 'day').toISOString() : commencementDate

      const rentStartIndex = paidRent.length + 1
      const mgmtStartIndex = paidMgmt.length + 1

      const newRent = dayjs(rentStart).isBefore(dayjs(expiryDate))
        ? generateSchedule(rentDetails, rentStart, expiryDate, paymentTerm, paymentDate, unitId, rentStartIndex)
        : []
      const newMgmt = dayjs(mgmtStart).isBefore(dayjs(expiryDate))
        ? generateSchedule(mgmtDetails, mgmtStart, expiryDate, paymentTerm, paymentDate, unitId, mgmtStartIndex)
        : []

      map.set(unitId, {
        rent: [...paidRent.map((p) => ({ ...p, isPast: true })), ...newRent],
        management: [...paidMgmt.map((p) => ({ ...p, isPast: true })), ...newMgmt]
      })
    })
    console.log(map)
    return map
  }, [addendumRents, addendumManagements, watchedExpiryDate, addendumPaymentTerm, selectedUnitIds, existingPayments])

  const contractTotals = useMemo(() => {
    const validRents = addendumRents.filter((r) => !r._isNew && r.startDate && r.endDate && r.amount)
    const validMgmts = addendumManagements.filter((r) => !r._isNew && r.startDate && r.endDate && r.amount)
    const totalAmount = [...validRents, ...validMgmts].reduce((sum, r) => sum + (r.totalAmount ?? r.amount ?? 0), 0)
    const totalAmountIncludeVat = [...validRents, ...validMgmts].reduce(
      (sum, r) => sum + (r.totalAmountIncludeVat ?? Math.round((r.amount ?? 0) * (1 + (r.vatPercent ?? 0) / 100))),
      0
    )
    return { totalAmount: Math.round(totalAmount), totalAmountIncludeVat: Math.round(totalAmountIncludeVat) }
  }, [addendumRents, addendumManagements])

  useEffect(() => {
    formAddendum.setFieldsValue({
      contractAmount: contractTotals.totalAmount,
      contractAmountIncludeVat: contractTotals.totalAmountIncludeVat
    })
  }, [contractTotals])

  useEffect(() => {
    const commencementDate = formRef.getFieldValue('commencementDate')
    if (commencementDate && watchedExpiryDate) {
      const leaseTerm = calculateDurationToText(commencementDate, watchedExpiryDate)
      formAddendum.setFieldValue('leaseTerm', leaseTerm)
    } else {
      formAddendum.setFieldValue('leaseTerm', null)
    }
  }, [watchedExpiryDate])

  return (
    <Modal
      title={L('BTN_CREATE_ADDENDUM')}
      open={visible}
      onOk={() => onOk(generatedByUnit)}
      onCancel={onCancel}
      width={'99%'}
      style={{ top: 20 }}
      okText={L('BTN_CREATE_AMENDMENT')}
      cancelText={L('BTN_CANCEL')}
      confirmLoading={isLoading}>
      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Card title={L('CONTRACT_ORIGINAL_INFO')} bordered size="small">
            <Form layout="vertical" size="middle">
              <Row gutter={[16, 0]}>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_REFERENCE_NUMBER')}>
                    <Input disabled value={formRef.getFieldValue('referenceNumber')} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_SIGN_DATE')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('signContractDate')
                          ? dayjs(formRef.getFieldValue('signContractDate')).format('DD/MM/YYYY')
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_START_DATE')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('commencementDate')
                          ? dayjs(formRef.getFieldValue('commencementDate')).format('DD/MM/YYYY')
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_EXPIRED_DATE')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('expiryDate')
                          ? dayjs(formRef.getFieldValue('expiryDate')).format('DD/MM/YYYY')
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>

                <Col sm={12}>
                  <Form.Item label={L('CONTRACT_WATER_FEE_AMOUNT')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('waterFeeAmount')
                          ? inputNumberFormatter(formRef.getFieldValue('waterFeeAmount'))
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col sm={12}>
                  <Form.Item label={L('CONTRACT_ELECTRIC_FEE_AMOUNT')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('electricFeeAmount')
                          ? inputNumberFormatter(formRef.getFieldValue('electricFeeAmount'))
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_PAYMENT_TERM')}>
                    <Input
                      disabled
                      value={
                        AppConsts.contractOfficeTime.find((t) => t.value === formRef.getFieldValue('paymentTerm'))
                          ?.label ?? ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_LEASETIME')}>
                    <Input disabled value={formRef.getFieldValue('leaseTerm')} />
                  </Form.Item>
                </Col>
                <Col sm={12}>
                  <Form.Item label={L('CONTRACT_AMOUNT')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('contractAmount')
                          ? inputNumberFormatter(formRef.getFieldValue('contractAmount'))
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col sm={12}>
                  <Form.Item label={L('CONTRACT_AMOUNT_INCLUDE_VAT')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('contractAmountIncludeVat')
                          ? inputNumberFormatter(formRef.getFieldValue('contractAmountIncludeVat'))
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={L('ADDENDUM_INFO')} bordered size="small">
            <Form form={formAddendum} layout="vertical" size="middle" validateMessages={validateMessages}>
              <Row gutter={[16, 0]}>
                <Col sm={12}>
                  <FormInput
                    rule={[...rules.maxText, ...rules.required]}
                    label="CONTRACT_REFERENCE_NUMBER"
                    name="referenceNumber"
                  />
                </Col>
                <Col span={12}>
                  <FormDatePicker label="ADDENDUM_SIGN_DATE" name="signContractDate" rule={rules.required} />
                </Col>
                <Col span={12}>
                  <Form.Item label={L('CONTRACT_START_DATE')}>
                    <Input
                      disabled
                      value={
                        formRef.getFieldValue('commencementDate')
                          ? dayjs(formRef.getFieldValue('commencementDate')).format('DD/MM/YYYY')
                          : ''
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <FormDatePicker
                    label="CONTRACT_EXPIRED_DATE"
                    name="expiryDate"
                    rule={rules.required}
                    disabledDate={(current) => {
                      const commencementDate = formRef.getFieldValue('commencementDate')
                      return current && current < dayjs(commencementDate)?.endOf('day')
                    }}
                  />
                </Col>

                <Col sm={12}>
                  <Form.Item
                    rules={[...rules.required, ...rules.maxNumber]}
                    label={L('CONTRACT_WATER_FEE_AMOUNT')}
                    name="waterFeeAmount">
                    <InputNumber
                      className="w-100"
                      formatter={(value) => inputNumberFormatter(value)}
                      parser={(value) => inputNumberParse(value)}
                    />
                  </Form.Item>
                </Col>
                <Col sm={12}>
                  <Form.Item
                    rules={[...rules.required, ...rules.maxNumber]}
                    label={L('CONTRACT_ELECTRIC_FEE_AMOUNT')}
                    name="electricFeeAmount">
                    <InputNumber
                      className="w-100"
                      formatter={(value) => inputNumberFormatter(value)}
                      parser={(value) => inputNumberParse(value)}
                    />
                  </Form.Item>
                </Col>
                <Col sm={12}>
                  <FormSelect
                    label="CONTRACT_PAYMENT_TERM"
                    name="paymentTerm"
                    rule={rules.required}
                    options={AppConsts.contractOfficeTime}
                    selectProps={{ onChange: onPaymentTermChange }}
                  />
                </Col>
                <Col sm={12}>
                  <FormInput label="CONTRACT_LEASETIME" name="leaseTerm" disabled />
                </Col>
                <Col span={12}>
                  <FormNumber label={L('CONTRACT_AMOUNT')} name="contractAmount" disabled />
                </Col>
                <Col span={12}>
                  <FormNumber label={L('CONTRACT_AMOUNT_INCLUDE_VAT')} name="contractAmountIncludeVat" disabled />
                </Col>
                <Col sm={24}>
                  <FormTextArea rule={rules.maxTextArea} label="CONTRACT_NOTE" name="note" />
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Section 1: Edit Addendum fee tables per unit */}
      <div className="mt-3">
        {selectedUnitIds.map((unitId) => {
          const unit = listUnit.find((u) => u.id === unitId)

          return (
            <Card key={unitId} className="mt-2">
              <div className="unit-text-hightlight mt-1">{unit?.name ?? unitId}</div>
              <div className="title-detail">{L('RENT_FEE')}</div>
              <Form form={formAddendumRent} layout="vertical" size="middle" validateMessages={validateMessages}>
                <Table
                  pagination={false}
                  size="small"
                  components={{ body: { cell: EditableCell } }}
                  bordered
                  dataSource={addendumRents.filter((r) => r.unitId === unitId)}
                  columns={columnsAddendumRent}
                  rowKey={(record) => record.id}
                  rowClassName={(record) =>
                    record._isNew || record._savedAsNew
                      ? 'row-addendum-new'
                      : record._priceChanged
                      ? 'row-addendum-changed'
                      : ''
                  }
                  scroll={{ x: 1000 }}
                />
              </Form>

              <Button
                className="mt-1"
                onClick={() => onAddAddendumRentRow(unitId)}
                disabled={visibleActionAddendumRent}>
                {L('ADD_NEW_ROW')}
              </Button>

              <div className="title-detail">{L('FEE_TYPE_CONFIG_MANAGEMENT')}</div>
              <Form form={formAddendumMgmt} layout="vertical" size="middle" validateMessages={validateMessages}>
                <Table
                  pagination={false}
                  size="small"
                  components={{ body: { cell: EditableCell } }}
                  bordered
                  dataSource={addendumManagements.filter((r) => r.unitId === unitId)}
                  columns={columnsAddendumMgmt}
                  rowKey={(record) => record.id}
                  rowClassName={(record) =>
                    record._isNew || record._savedAsNew
                      ? 'row-addendum-new'
                      : record._priceChanged
                      ? 'row-addendum-changed'
                      : ''
                  }
                  scroll={{ x: 1000 }}
                />
              </Form>

              <Button
                className="mt-1 mb-2"
                onClick={() => onAddAddendumMgmtRow(unitId)}
                disabled={visibleActionAddendumMgmt}>
                {L('ADD_NEW_ROW')}
              </Button>
            </Card>
          )
        })}
      </div>

      {/* Section 2: Payment Schedule Preview (tách theo unit) */}
      <div className="mt-4">
        <div className="mb-2 title-detail">
          <strong>{L('PAYMENT_SCHEDULE_PREVIEW')}</strong>
        </div>
        {selectedUnitIds.map((unitId) => {
          const unit = listUnit.find((u) => u.id === unitId)
          return (
            <Card key={unitId} className="mt-2">
              <div className="unit-text-hightlight mt-1">{unit?.name ?? unitId}</div>
              <Row gutter={[8, 0]} className="mt-2">
                <Col span={12}>
                  <div className="mb-1">
                    <strong>{L('PAYMENT_SCHEDULE_EXISTING')}</strong>
                  </div>
                  <div className="mb-1">
                    <strong>{L('RENT_FEE')}</strong>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-1">
                    <strong>{L('PAYMENT_SCHEDULE_NEW')}</strong>
                  </div>
                  <div className="mb-1">
                    <strong>{L('RENT_FEE')}</strong>
                  </div>
                </Col>
              </Row>
              <Row gutter={[8, 0]}>
                <Col span={12}>
                  <Table
                    size="small"
                    bordered
                    pagination={false}
                    rowKey={(_, i) => `exist-rent-${unitId}-${i}`}
                    columns={previewColumns}
                    summary={previewSummary}
                    dataSource={existingPayments.filter(
                      (p) => p.unitId === unitId && p.feeTypeId === FeeTypeEnum.rentFee
                    )}
                    rowClassName={(r) =>
                      r.id && r.statusId === paymentScheduleStatusEnum.paid ? 'row-paid' : 'row-remove'
                    }
                    scroll={{ x: 'max-content' }}
                  />
                </Col>
                <Col span={12}>
                  <Table
                    size="small"
                    bordered
                    pagination={false}
                    rowKey={(_, i) => `gen-rent-${unitId}-${i}`}
                    columns={previewColumns}
                    summary={previewSummary}
                    dataSource={generatedByUnit.get(unitId)?.rent ?? []}
                    rowClassName={(r) =>
                      r.id && r.statusId === paymentScheduleStatusEnum.paid ? 'row-paid' : 'row-new'
                    }
                    scroll={{ x: 'max-content' }}
                  />
                </Col>
              </Row>
              <Row gutter={[8, 0]} className="mt-2">
                <Col span={12}>
                  <div className="mb-1">
                    <strong>{L('MANAGER_FEE')}</strong>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-1">
                    <strong>{L('MANAGER_FEE')}</strong>
                  </div>
                </Col>
              </Row>
              <Row gutter={[8, 0]}>
                <Col span={12}>
                  <Table
                    size="small"
                    bordered
                    pagination={false}
                    rowKey={(_, i) => `exist-mgmt-${unitId}-${i}`}
                    columns={previewColumns}
                    summary={previewSummary}
                    dataSource={existingPayments.filter(
                      (p) => p.unitId === unitId && p.feeTypeId === FeeTypeEnum.managerFee
                    )}
                    rowClassName={(r) => (r.statusId === paymentScheduleStatusEnum.paid ? 'row-paid' : 'row-remove')}
                    scroll={{ x: 'max-content' }}
                  />
                </Col>
                <Col span={12}>
                  <Table
                    size="small"
                    bordered
                    pagination={false}
                    rowKey={(_, i) => `gen-mgmt-${unitId}-${i}`}
                    columns={previewColumns}
                    summary={previewSummary}
                    dataSource={generatedByUnit.get(unitId)?.management ?? []}
                    rowClassName={(r) => (r.statusId === paymentScheduleStatusEnum.paid ? 'row-paid' : 'row-new')}
                    scroll={{ x: 'max-content' }}
                  />
                </Col>
              </Row>
            </Card>
          )
        })}
      </div>
    </Modal>
  )
}

export default AddendumModal
