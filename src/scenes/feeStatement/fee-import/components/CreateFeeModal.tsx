import { HomeOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import FormCheckbox from '@components/FormItem/FormCheckbox'
import FormCurrency from '@components/FormItem/FormCurrency'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { isGranted, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import feeService from '@services/fee/feeService'
import feeTypeService from '@services/fee/feeTypeService'
import packageFeeService from '@services/fee/packageFeeService'
import projectService from '@services/project/projectService'
import unitService from '@services/project/unitService'
import FeeStore from '@stores/fee/feeStore'
import Form from 'antd/es/form'
import { Col, Row } from 'antd/es/grid'
import Select from 'antd/es/select'
import Modal from 'antd/lib/modal/Modal'
import React from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
  feeStore?: FeeStore
  visible: boolean
  onClose: () => void
}

const CreateFeeModal = (props: Props) => {
  const navigate = useNavigate()
  const [feeTypeOption, setFeeTypeOption] = React.useState<any[]>([])
  const [feePackageOption, setFeePackageOption] = React.useState<any[]>([])
  const [unitOption, setUnitOption] = React.useState<any[]>([])
  const [form] = Form.useForm()
  const [isCreateReceipt, setIsCreateReceipt] = React.useState(false)
  const [listPayment, setListPayment] = React.useState<any[]>([])
  const handleOk = async () => {
    const values = await form.validateFields()
    const res = await feeService.createFee(values)
    if (res.receiptId) {
      navigate(portalLayouts.feeReceiptDetail.path.replace(':id', res.receiptId))
    } else {
      props.onClose()
    }
  }

  React.useEffect(() => {
    handleSearchFeeType('')
    handleSearchFeePackage('')
    handleSearchUnit('')
    feeService.getListPaymentChannels({}).then((res) => {
      setListPayment(res)
    })
  }, [])
  const handleSearchFeeType = async (keyword: string) => {
    const res = await feeTypeService.getList({
      keyword,
      groupName: 'FeeStatement'
    })
    setFeeTypeOption(res)
  }
  const handleSearchFeePackage = async (keyword: string) => {
    const res = await packageFeeService.getAll({
      keyword
    })
    setFeePackageOption(res.items)
  }
  const handleSearchUnit = async (keyword: string) => {
    const res = await unitService.getAll({ keyword })
    setUnitOption(res.items)
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
  const [resident, setResident] = React.useState<any[]>([])
  const handleSearchResident = async (keyword: string) => {
    const result = await projectService.filterUnitUsers({
      keyword,
      unitId: form.getFieldValue('unitId')
    })
    setResident(result)
  }
  return (
    <Modal
      destroyOnClose
      title={L('CREATE_FEE')}
      visible={props.visible}
      cancelText={L('BTN_CANCEL')}
      onCancel={props.onClose}
      onOk={handleOk}
      okButtonProps={{
        className: !isGranted(appPermissions.feeStatement.create) ? 'd-none' : ''
      }}>
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
          <Col sm={{ span: 24 }}>
            <FormSelect
              rule={[{ required: true }]}
              options={unitOption}
              label={L('FULL_UNIT_CODE')}
              name="unitId"
              selectProps={{
                onSearch: handleSearchUnit
              }}
            />
          </Col>
          <Col sm={{ span: 12 }}>
            <FormDatePicker rule={[{ required: true }]} name="informDate" label={L('FROM_DATE')} />
          </Col>
          <Col sm={{ span: 12 }}>
            <FormDatePicker rule={[{ required: true }]} name="dueDate" label={L('TO_DATE')} />
          </Col>
          <Col sm={{ span: 24 }}>
            <FormInput rule={[{ required: true }]} label={L('FEE_BILL_NUMBER')} name="billNumber" />
          </Col>
          <Col sm={{ span: 24 }}>
            <FormCurrency rule={[{ required: true }]} label={L('TOTAL_AMOUNT')} name="totalAmount" />
          </Col>
          <Col sm={{ span: 24 }}>
            <FormTextArea rule={[{ required: true, max: 2000 }]} label={L('DESCRIPTION')} name="description" />
          </Col>
          <Col sm={{ span: 24 }}>
            <FormCheckbox
              label={L('CREATE_RECEIP')}
              name="isCreateReceipt"
              onChange={(e) => {
                setIsCreateReceipt(e.target.checked)
              }}
            />
          </Col>
          {isCreateReceipt && (
            <>
              <Col sm={{ span: 24 }}>
                <FormSelect
                  rule={[{ required: true }]}
                  options={resident}
                  label={L('WORK_ORDER_RESIDENT')}
                  name={['receiptInfo', 'feePayer', 'residentId']}
                  selectProps={{
                    onSearch: handleSearchResident,
                    onChange: handleFindBillNumber
                  }}
                  optionModal={(option, index) => {
                    return !option.displayName ? null : (
                      <Select.Option key={index} value={option.id}>
                        {option.displayName}
                        <div className="text-muted small" style={{ display: 'flex' }}>
                          <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                            <HomeOutlined className="mr-1" />
                            {option.fullUnitCode}
                          </span>

                          <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                            {option.emailAddress && option.emailAddress.length && (
                              <>
                                <UserOutlined className="mr-1" />
                                {option.userName}
                              </>
                            )}
                          </span>
                          <span className={'text-truncate'} style={{ flex: 1 }}>
                            {option.phoneNumber && option.phoneNumber.length && (
                              <>
                                <PhoneOutlined className="mr-1" />
                                {option.phoneNumber}
                              </>
                            )}
                          </span>
                        </div>
                      </Select.Option>
                    )
                  }}
                />
              </Col>
              <Col sm={{ span: 12 }}>
                <FormSelect
                  rule={[{ required: true }]}
                  options={listPayment}
                  label={L('PAYMENT_CHANEL')}
                  name={['receiptInfo', 'paymentChanelId']}
                />
              </Col>
              <Col sm={{ span: 12 }}>
                <FormDatePicker
                  rule={[{ required: true }]}
                  name={['receiptInfo', 'incomingDate']}
                  label={L('CREATE_DATE')}
                />
              </Col>
            </>
          )}
        </Row>
      </Form>
    </Modal>
  )
}

export default CreateFeeModal
