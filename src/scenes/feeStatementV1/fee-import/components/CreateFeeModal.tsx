import FormCurrency from '@components/FormItem/FormCurrency'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormInput from '@components/FormItem/FormInput'
import FormSelect from '@components/FormItem/FormSelect'
import FormTextArea from '@components/FormItem/FormTextArea'
import { isGranted, L, LNotification } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import { validateMessages } from '@lib/validation'
import feeService from '@services/fee/feeService'
import feeTypeService from '@services/fee/feeTypeService'
import packageFeeService from '@services/fee/packageFeeService'
import FeeStore from '@stores/fee/feeStore'
import { Modal } from 'antd'
import Form from 'antd/es/form'
import { Col, Row } from 'antd/es/grid'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { portalLayouts } from '@components/Layout/Router/router.config'
import companyService from '@services/project/companyService'
import { filterOptions } from '@lib/helper'
const confirm = Modal.confirm
type Props = {
  feeStore?: FeeStore
  visible: boolean
  onClose: () => void
}

const CreateFeeModal = (props: Props) => {
  const navigate = useNavigate()
  const [feeTypeOption, setFeeTypeOption] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [feePackageOption, setFeePackageOption] = React.useState<any[]>([])
  const [listAllCompany, setListAllCompany] = React.useState<any[]>([])
  const [form] = Form.useForm()

  const handleOk = async () => {
    const values = await form.validateFields()
    confirm({
      title: values.isCreateReceipt
        ? LNotification('TITLE_SAVE_CREATE_RECEIPT_MODEL_CREATE_FEE')
        : LNotification('TITLE_SAVE_MODEL_CREATE_FEE'),
      content: values.isCreateReceipt
        ? LNotification('CONTENT_SAVE_CREATE_RECEIPT_MODEL_CREATE_FEE')
        : LNotification('CONTENT_SAVE_MODEL_CREATE_FEE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: async () => {
        setIsLoading(true)
        const res = await feeService.createFee(values)
        setIsLoading(false)
        if (res.receiptId) {
          form.resetFields()
          navigate(portalLayouts.feeReceiptDetailV1.path.replace(':id', res.receiptId))
        } else {
          form.resetFields()
          props.onClose()
        }
      }
    })
  }

  React.useEffect(() => {
    handleSearchFeeType('')
    handleSearchFeePackage('')
    handleGetAllCompany()
  }, [])

  const handleSearchFeeType = async (keyword: string) => {
    const res = await feeTypeService.getList({
      keyword,
      isActive: true
    })
    setFeeTypeOption(res)
  }
  const handleSearchFeePackage = async (keyword: string) => {
    const res = await packageFeeService.getAll({
      keyword
    })
    setFeePackageOption(res.items)
  }

  const handleGetAllCompany = async () => {
    const res = await companyService.getListCompany()

    setListAllCompany(res)
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
      <Modal
        destroyOnClose
        style={{ top: 10 }}
        maskClosable={false}
        title={L('CREATE_FEE')}
        open={props.visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={() => {
          form.resetFields()
          props.onClose()
        }}
        onOk={handleOk}
        confirmLoading={isLoading}
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
                options={listAllCompany}
                label={L('FEE_CREATE_COMPANY')}
                name="companyId"
                selectProps={{
                  filterOption: filterOptions
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
              <FormCurrency
                maxLength={13}
                rule={[
                  { required: true },
                  () => ({
                    validator(_, value) {
                      if (value < 1) {
                        return Promise.reject(L('PLEAE_INPUT_NUMBER_GREATER_THAN_0'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
                label={L('TOTAL_AMOUNT')}
                name="totalAmount"
              />
            </Col>
            <Col sm={{ span: 24 }}>
              <FormTextArea
                rule={[{ required: true, max: 2000 }]}
                maxLength={2001}
                label={L('DESCRIPTION')}
                name="description"
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default CreateFeeModal
