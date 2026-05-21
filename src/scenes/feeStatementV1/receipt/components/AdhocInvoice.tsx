import FormCurrency from '@components/FormItem/FormCurrency'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'
import { L } from '@lib/abpUtility'

import { validateMessages } from '@lib/validation'
import feeService from '@services/fee/feeService'
import feeTypeService from '@services/fee/feeTypeService'
import packageFeeService from '@services/fee/packageFeeService'
import { Button } from 'antd'
import Form from 'antd/es/form'
import { Col, Row } from 'antd/es/grid'
import Card from 'antd/lib/card'
import React from 'react'
import AppConst from '@lib/appconst'
import { PreviewReceipt } from '@scenes/feeStatementV1/fee-import/components/PreviewReceipt'
import { portalLayouts } from '@components/Layout/Router/router.config'
const { feeSourceGroup, feeGroupType } = AppConst
type Props = {
  infoPayer: any
  navigate: any
}

const AdhocInvoice = (props: Props) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [feeTypeOption, setFeeTypeOption] = React.useState<any[]>([])
  const [feePackageOption, setFeePackageOption] = React.useState<any[]>([])

  const [dataSend, setDataSend] = React.useState<any>()
  const [dataShow, setDataShow] = React.useState<any>()
  const [showPreview, setShowPreview] = React.useState(false)
  const [form] = Form.useForm()

  React.useEffect(() => {
    handleSearchFeeType('')
    handleSearchFeePackage('')
  }, [])

  const handleSearchFeeType = async (keyword: string) => {
    let res
    switch (props?.infoPayer?.groupName) {
      case feeSourceGroup.feeManagement:
        res = await feeTypeService.getList({
          keyword,
          groupId: feeGroupType.feeManagement,
          isRefundable: false
        })
        break
      case feeSourceGroup.feeDeposit:
        res = await feeTypeService.getList({
          keyword,
          groupId: feeGroupType.feeManagement,
          isRefundable: true
        })
        break
      default:
        res = await feeTypeService.getList({
          keyword,
          groupId: feeGroupType.feeReservationDeposit
        })
        break
    }

    setFeeTypeOption(res)
  }
  const handleSearchFeePackage = async (keyword: string) => {
    const res = await packageFeeService.getAll({
      keyword
    })
    setFeePackageOption(res.items)
  }
  const onPreview = async () => {
    const values = await form.validateFields()
    setDataSend(values)

    setDataShow({ ...props.infoPayer, feePackage: feePackageOption, feeType: feeTypeOption })

    setShowPreview(true)
  }

  const onSave = async () => {
    const values = await form.validateFields()
    if (props.infoPayer) {
      values.isCreateReceipt = true
      values.unitId = props.infoPayer.unitId
      values.receiptInfo = {
        feePayer: { residentId: props.infoPayer.residentId },
        paymentChanelId: props.infoPayer.paymentChanelId,
        paymentChannelExternalId: props.infoPayer?.paymentChannelExternalId,
        incomingDate: props.infoPayer.incomingDate
      }
      setIsLoading(true)

      const res = await feeService.createFee(values)

      setIsLoading(false)
      form.resetFields()
      setShowPreview(false)
      if (res.receiptId) {
        props.navigate(portalLayouts.feeReceiptDetailV1.path.replace(':id', res.receiptId))
      }
    }
  }
  const handleFindBillNumber = async () => {
    const values = await form.getFieldsValue()
    const name =
      feeTypeOption.find((e) => e.id === values.feeTypeId)?.code +
      '/' +
      feePackageOption.find((e) => e.id === values.packageId)?.name
    if (!name.includes('undefined')) {
      form.setFields([{ name: 'billNumber', value: name }])
    }
  }

  return (
    <>
      <Card>
        <Form layout="vertical" validateMessages={validateMessages} form={form}>
          <Row gutter={16}>
            <Col sm={{ span: 24 }}>
              <FormSelect
                rule={[{ required: true }]}
                options={feeTypeOption}
                label={L('FEE_TYPE')}
                name="feeTypeId"
                selectProps={{
                  onSearch: handleSearchFeeType,
                  onChange: handleFindBillNumber
                }}
              />
            </Col>
            <Col sm={{ span: 24 }}>
              <FormSelect
                rule={[{ required: true }]}
                options={feePackageOption}
                label={L('FEE_PACKAGE')}
                name="packageId"
                selectProps={{
                  onSearch: handleSearchFeePackage,
                  onChange: handleFindBillNumber
                }}
              />
            </Col>

            <Col sm={{ span: 12 }}>
              <FormDatePicker name="informDate" label={L('FROM_DATE')} />
            </Col>
            <Col sm={{ span: 12 }}>
              <FormDatePicker name="dueDate" label={L('TO_DATE')} />
            </Col>
            <Col sm={{ span: 24 }}>
              <FormInput label={L('FEE_BILL_NUMBER')} name="billNumber" />
            </Col>
            <Col sm={{ span: 24 }}>
              <FormCurrency rule={[{ required: true }]} label={L('TOTAL_AMOUNT')} name="totalAmount" />
            </Col>
            <Col sm={{ span: 24 }}>
              <FormTextArea
                rows={2}
                rule={[{ required: true, max: 2000 }]}
                maxLength={2001}
                label={L('DESCRIPTION')}
                name="description"
              />
            </Col>
            <></>
          </Row>
        </Form>
        <Col sm={{ span: 24 }}>
          <Button type="primary" loading={isLoading} onClick={onPreview}>
            {L('BTN_PREVIEW')}
          </Button>
        </Col>
      </Card>
      <PreviewReceipt
        showFrom="Receipt"
        visible={showPreview}
        onCancel={() => {
          setShowPreview(false)
        }}
        dataSend={dataSend}
        dataShow={dataShow}
        onCreate={onSave}
      />
    </>
  )
}

export default AdhocInvoice
