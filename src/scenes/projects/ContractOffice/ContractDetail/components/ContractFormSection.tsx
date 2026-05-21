import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormInput from '@components/FormItem/FormInput'
import FormNumber from '@components/FormItem/FormNumber'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'
import { inputNumberFormatter, inputNumberParse } from '@lib/helper'
import { distributionChannelEnum } from '@lib/enum'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import { Col, Form, FormInstance, InputNumber, Row } from 'antd'
import dayjs from 'dayjs'
import rules from '../validation'

const { contractOfficeTime } = AppConsts

interface IContractFormSectionProps {
  formRef: FormInstance
  listCompany: any[]
  listUnit: any[]
  leaseAgreementStatus: any[]
  laStage: any[]
  onMapDataCompany: (id: any) => void
  calculatorDateLeaseTime: () => void
  onStartManagementDateChange: () => void
  onPaymentDateChange: () => void
  onPaymentTermChange: (newTerm: any) => void
  onLeaseAgreementUnitChange: (vals: any) => void
  isSyncSap?: boolean
}

const ContractFormSection = ({
  formRef,
  listCompany,
  listUnit,
  // leaseAgreementStatus,
  laStage,
  onMapDataCompany,
  calculatorDateLeaseTime,
  onStartManagementDateChange,
  onPaymentDateChange,
  onPaymentTermChange,
  onLeaseAgreementUnitChange,
  isSyncSap
}: IContractFormSectionProps) => {
  return (
    <Form form={formRef} layout={'vertical'} validateMessages={validateMessages} size="middle" disabled={isSyncSap}>
      <Row gutter={[16, 0]}>
        {/* Contract Info */}
        <>
          <Col span={24}>
            <label className="title-detail">{L('CONTRACT_INFO')}</label>
          </Col>

          <Col sm={6}>
            <FormInput
              disabled={false}
              rule={[...rules.maxText, ...rules.required]}
              label="CONTRACT_REFERENCE_NUMBER"
              name="referenceNumber"
            />
          </Col>
          <Col sm={6}>
            <FormSelect
              label="CONTRACT_COMPANY"
              name="companyId"
              rule={rules.required}
              options={listCompany}
              onChange={onMapDataCompany}
            />
          </Col>

          {/* <Col sm={6}>
            <FormSelect label="CONTRACT_STATUS" rule={rules.required} name="statusId" options={leaseAgreementStatus} />
          </Col> */}
          <Col sm={6}>
            <FormSelect label="CONTRACT_STAGE" rule={rules.required} name="stageId" options={laStage} />
          </Col>
          <Col span={6}>
            <FormSelect
              label="DISTRIBUTION_CHANNEL"
              name="distributionChannel"
              rule={rules.required}
              options={[
                { value: distributionChannelEnum.local, label: L('DISTRIBUTION_CHANNEL_LOCAL') },
                { value: distributionChannelEnum.other, label: L('DISTRIBUTION_CHANNEL_OTHER') }
              ]}
            />
          </Col>
          <Col sm={6}>
            <FormInput
              rule={[...rules.maxText]}
              disabled={false}
              label="CONTRACT_PERMANTENT_ADDRESS"
              name="permanentAddress"
            />
          </Col>
          <Col sm={6}>
            <FormInput
              rule={[...rules.maxText]}
              disabled={false}
              label="CONTRACT_BILLING_INFORMATION"
              name="billingInformation"
            />
          </Col>
          <Col sm={12}>
            <FormTextArea rule={rules.maxTextArea} disabled={false} label="CONTRACT_NOTE" name="note" />
          </Col>
          <Col sm={24}>
            <FormTextArea rule={rules.maxTextArea} disabled={false} label="CONTRACT_DESCRIPTION" name="description" />
          </Col>
        </>

        {/* Dates */}
        <>
          <Col span={24} className="my-1">
            <label className="title-detail">{L('CONTRACT_DATES')}</label>
          </Col>
          <Col sm={6}>
            <FormDatePicker disabled={false} label="CONTRACT_SIGN_DATE" name="signContractDate" rule={rules.required} />
          </Col>
          <Col sm={6}>
            <FormDatePicker
              label="CONTRACT_START_DATE"
              name="commencementDate"
              rule={rules.required}
              dateTimeProps={{ onChange: calculatorDateLeaseTime }}
              disabledDate={(current) => {
                const expiryDate = formRef.getFieldValue('expiryDate')
                return current && current > expiryDate?.endOf('day')
              }}
            />
          </Col>
          <Col sm={6}>
            <FormDatePicker
              label="CONTRACT_EXPIRED_DATE"
              name="expiryDate"
              rule={rules.required}
              dateTimeProps={{ onChange: calculatorDateLeaseTime }}
              disabledDate={(current) => {
                const validDate = formRef.getFieldValue('commencementDate')
                return current && current < validDate?.endOf('day')
              }}
            />
          </Col>

          <Col sm={6}>
            <FormInput label="CONTRACT_LEASETIME" name="leaseTerm" disabled />
          </Col>

          <Col sm={6}>
            <FormDatePicker
              label="CONTRACT_START_FEE_DATE"
              name="startFeeDate"
              rule={rules.required}
              disabledDate={(current) => {
                const startDate = formRef.getFieldValue('commencementDate')
                const endDate = formRef.getFieldValue('expiryDate')
                return current && (current < startDate?.startOf('day') || current > endDate?.endOf('day'))
              }}
            />
          </Col>
          <Col sm={6}>
            <FormDatePicker
              label="CONTRACT_START_MANAGEMENT_DATE"
              name="startManagementDate"
              rule={rules.required}
              dateTimeProps={{ onChange: onStartManagementDateChange }}
              disabledDate={(current) => {
                const startDate = formRef.getFieldValue('commencementDate')
                const endDate = formRef.getFieldValue('expiryDate')
                return current && (current < startDate?.startOf('day') || current > endDate?.endOf('day'))
              }}
            />
          </Col>
          <Col sm={6}>
            <FormDatePicker
              label="CONTRACT_PAYMENT_DATE"
              name="paymentDate"
              rule={rules.required}
              dateTimeProps={{ onChange: onPaymentDateChange }}
              disabledDate={(current) => {
                const startFeeDate = formRef.getFieldValue('startFeeDate')
                const endDate = formRef.getFieldValue('expiryDate')
                return (
                  current && (current < dayjs(startFeeDate)?.startOf('day') || current > dayjs(endDate)?.endOf('day'))
                )
              }}
            />
          </Col>
          <Col sm={6}>
            <FormSelect
              label="CONTRACT_PAYMENT_TERM"
              name="paymentTerm"
              rule={rules.required}
              options={contractOfficeTime}
              selectProps={{ onChange: onPaymentTermChange }}
            />
          </Col>
        </>
        {/* Partner Functions */}
        {/* <>
          <Col span={24} className="my-1">
            <label className="title-detail">{L('CONTRACT_PARTNER_FUNCTIONS')}</label>
          </Col>
          <Col sm={6}>
            <FormInput rule={rules.maxText} label="CONTRACT_SOLD_TO_PARTY" name="soldToParty" />
          </Col>
          <Col sm={6}>
            <FormInput rule={rules.maxText} label="CONTRACT_BILL_TO_PARTY" name="billToParty" />
          </Col>
          <Col sm={6}>
            <FormInput rule={rules.maxText} label="CONTRACT_SHIP_TO_PARTY" name="shipToParty" />
          </Col>
          <Col sm={6}>
            <FormInput rule={rules.maxText} label="CONTRACT_PAYER" name="payer" />
          </Col>
        </> */}
        {/* Financials */}
        <>
          <Col span={24} className="my-1">
            <label className="title-detail">{L('CONTRACT_FINANCIALS')}</label>
          </Col>
          <Col sm={6}>
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
          <Col sm={6}>
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
          <Col sm={6}>
            <FormNumber label={L('CONTRACT_AMOUNT')} name="contractAmount" min={0} disabled />
          </Col>
          <Col sm={6}>
            <FormNumber label={L('CONTRACT_AMOUNT_INCLUDE_VAT')} name="contractAmountIncludeVat" min={0} disabled />
          </Col>
        </>

        {/* Unit */}
        <Col span={24} className="my-1">
          <label className="title-detail">{L('CONTRACT_UNIT')}</label>
        </Col>
        <Col span={24}>
          <FormSelect
            label="CONTRACT_UNIT"
            rule={rules.required}
            name="leaseAgreementUnit"
            options={listUnit}
            selectProps={{ mode: 'multiple', onChange: (vals) => onLeaseAgreementUnitChange(vals) }}
          />
        </Col>
      </Row>
    </Form>
  )
}

export default ContractFormSection
