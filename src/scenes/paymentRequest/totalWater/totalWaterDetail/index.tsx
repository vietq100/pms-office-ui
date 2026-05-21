import React from 'react'
import { Col, Form, Row, Card, Button, Modal, Select, Input, DatePicker } from 'antd'
import { validateMessages } from '@lib/validation'
import { inject, observer } from 'mobx-react'
import { L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import { addItemToList, filterOptions } from '@lib/helper'
import AppConsts, { dateFormat, fileTypeGroup } from '@lib/appconst'
import rules from './validation'
import packageFeeService from '@services/fee/packageFeeService'
import FileUploadWrapV2 from '@components/FileUploadV2'
import TotalWaterMeterStore from '@stores/paymentRequest/totalWaterMeterStore'
import FormNumber from '@components/FormItem/FormNumber'
import feeTypeService from '@services/fee/feeTypeService'

const { formVerticalLayout } = AppConsts
const confirm = Modal.confirm

export interface IProps {
  navigate: any
  params: any
  location: any
  fileStore: FileStore
  totalWaterMeterStore: TotalWaterMeterStore
}

@inject(Stores.TotalWaterMeterStore, Stores.FileStore)
@observer
class TotalWaterMeterDetail extends AppComponentBase<IProps> {
  formRef: any = React.createRef()
  formItemElectricReading: any = React.createRef()

  state = {
    files: [] as any,
    idDocument: undefined,
    listCompany: [] as any,
    listPeriod: [] as any,
    uniqueId: '',
    visibleAction: false,
    feePackageCurrent: {} as any
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    await Promise.all([
      this.getLsitPeriod(''),
      await this.handleCurrentFeePackage(),
      this.getDetail(this.props.params?.id)
    ])

    // Update listPeriod after it's fully loaded
    this.setState((prevState) => ({
      listPeriod: addItemToList(prevState.listPeriod, prevState.feePackageCurrent)
    }))
  }

  handleCurrentFeePackage = async () => {
    const feePackageCurrent = await feeTypeService.getCurrent()

    this.setState({ feePackageCurrent })
  }

  getDetail = async (id?) => {
    if (id) {
      await this.props.totalWaterMeterStore.get(id)
      this.setState((prevState) => ({
        idDocument: this.props.totalWaterMeterStore.dataDetail?.uniqueId,
        listPeriod: addItemToList(prevState.listPeriod, this.props.totalWaterMeterStore.dataDetail?.feePackage)
      }))
      this.formRef.current.setFieldsValue({
        ...this.props.totalWaterMeterStore.dataDetail,
        domesticWaterVATPercentage: 5,
        wasteWaterVATPercentage: 8
      })
    } else if (this.props.location.state.copyId) {
      await this.props.totalWaterMeterStore.get(this.props.location.state.copyId)
      this.setState((prevState) => ({
        idDocument: this.props.totalWaterMeterStore.dataDetail?.uniqueId,
        listPeriod: addItemToList(prevState.listPeriod, this.props.totalWaterMeterStore.dataDetail?.feePackage)
      }))
      this.formRef.current.setFieldsValue({
        fromIndex: this.props.totalWaterMeterStore.dataDetail.toIndex,
        domesticWaterUnitPrice: this.props.totalWaterMeterStore.dataDetail.domesticWaterUnitPrice,
        domesticWaterTotalAmount: this.props.totalWaterMeterStore.dataDetail.domesticWaterTotalAmount,
        domesticWaterVATAmount: this.props.totalWaterMeterStore.dataDetail.domesticWaterVATAmount,
        wasteWaterUnitPrice: this.props.totalWaterMeterStore.dataDetail.wasteWaterUnitPrice,
        wasteWaterTotalAmount: this.props.totalWaterMeterStore.dataDetail.wasteWaterTotalAmount,
        wasteWaterVATAmount: this.props.totalWaterMeterStore.dataDetail.wasteWaterVATAmount,
        domesticWaterVATPercentage: this.props.totalWaterMeterStore.dataDetail.domesticWaterVATPercentage,
        wasteWaterVATPercentage: this.props.totalWaterMeterStore.dataDetail.wasteWaterVATPercentage
      })
    } else {
      await this.props.totalWaterMeterStore.initRecord()
      this.formRef.current.setFieldsValue({
        ...this.props.totalWaterMeterStore.dataDetail,
        feePackageId: this.state.feePackageCurrent?.id ?? undefined,
        domesticWaterVATPercentage: this.state.feePackageCurrent?.domesticWaterVATPercentage ?? 5,
        wasteWaterVATPercentage: this.state.feePackageCurrent?.wasteWaterVATPercentage ?? 8
      })
    }
  }
  changeTotalCount = () => {
    const from = this.formRef.current?.getFieldValue('fromIndex')
    const to = this.formRef.current?.getFieldValue('toIndex')
    const total = to - from
    this.formRef.current?.setFieldValue('total', total)
  }
  onSave = async () => {
    const form = this.formRef.current
    const id = this.props.params?.id ? Number(this.props.params.id) : undefined
    form.validateFields().then(async (values: any) => {
      await this.props.totalWaterMeterStore.createOrUpdate({ ...values, id }, this.state.files)
      await this.props.navigate(portalLayouts.totalWaterMeter.path)
    })
  }

  getLsitPeriod = async (keyword: string) => {
    const listPeriod = await packageFeeService.getList({
      keyword,
      isClosed: false
    })

    this.setState({ listPeriod })
  }

  onCancel = () => {
    const { navigate } = this.props

    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        navigate(portalLayouts.totalWaterMeter.path)
      }
    })
    return
  }

  beforeUploadFile = (file) => {
    this.setState({ files: [...this.state.files, file] })
    return false
  }

  onRemoveFile = (file) => {
    const index = this.state.files.indexOf(file)
    const newFileList = [...this.state.files]
    newFileList.splice(index, 1)
    this.setState({ files: newFileList })
  }

  onFormValueChange = (changedValues, allValues) => {
    const {
      fromIndex = 0,
      toIndex = 0,
      total = 0,
      domesticWaterUnitPrice = 0,
      wasteWaterUnitPrice = 0,
      domesticWaterVATPercentage = 0,
      wasteWaterVATPercentage = 0
    } = allValues

    // Calculate Total Item
    if (changedValues.fromIndex !== undefined || changedValues.toIndex !== undefined) {
      const totalItem = Number(toIndex) - Number(fromIndex)
      this.formRef.current.setFieldsValue({
        total: totalItem
      })
    }

    if (
      changedValues.total !== undefined ||
      changedValues.domesticWaterUnitPrice !== undefined ||
      changedValues.domesticWaterVATPercentage !== undefined ||
      changedValues.domesticWaterTotalAmount !== undefined
    ) {
      // Calculate Domestic Water Total Amount & VAT Amount
      const totalAmount = Number(total) * Number(domesticWaterUnitPrice || 0)
      const vatAmount = Number(totalAmount) * (Number(domesticWaterVATPercentage || 0) / 100)

      this.formRef.current.setFieldsValue({
        domesticWaterTotalAmount: totalAmount,
        domesticWaterVATAmount: vatAmount
      })
    }

    // Calculate Waste Water Total Amount & VAT Amount
    if (
      changedValues.total !== undefined ||
      changedValues.wasteWaterUnitPrice !== undefined ||
      changedValues.wasteWaterVATPercentage !== undefined ||
      changedValues.wasteWaterTotalAmount !== undefined
    ) {
      const totalAmount = Number(total) * Number(wasteWaterUnitPrice || 0)
      const vatAmount = Number(totalAmount) * (Number(wasteWaterVATPercentage || 0) / 100)

      this.formRef.current.setFieldsValue({
        wasteWaterTotalAmount: totalAmount,
        wasteWaterVATAmount: vatAmount
      })
    }

    const wasteWaterTotalAmount = total * wasteWaterUnitPrice
    const domesticWaterTotalAmount = total * domesticWaterUnitPrice
    const totalAmount = wasteWaterTotalAmount + domesticWaterTotalAmount

    this.formRef.current.setFieldsValue({ totalAmount })
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>

          <Button
            disabled={this.state.visibleAction}
            type="primary"
            onClick={this.onSave}
            loading={isLoading}
            shape="round">
            {L('BTN_SAVE')}
          </Button>
        </Col>
      </Row>
    )
  }

  public render() {
    return (
      <WrapPageScroll renderActions={() => this.renderActions(false)}>
        <Card bordered={false} style={{ minHeight: 750 }}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onValuesChange={this.onFormValueChange}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 8]}>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('WATER_INDICATORS')}</label>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="dateOfRecording" label={L('RECORD_DATE')}>
                  <DatePicker format={dateFormat} style={{ width: '100%' }} placeholder={L('SELECT_DATE')} />
                </Form.Item>
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('METER_PERIOD')}
                  {...formVerticalLayout}
                  name="feePackageId"
                  rules={rules.companyId}>
                  <Select
                    showSearch
                    allowClear
                    filterOption={filterOptions}
                    className="full-width"
                    onSearch={this.getLsitPeriod}>
                    {this.renderOptions(this.state.listPeriod)}
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }} />
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber label={L('START_RECORD')} name="fromIndex" min={0} placeholder={L('START_RECORD')} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber label={L('END_RECORD')} name="toIndex" min={0} placeholder={L('END_RECORD')} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber label={L('AMOUNT')} name="total" min={0} placeholder={L('AMOUNT')} disabled />
              </Col>
              <>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item label={L('METER_NOTE')} {...formVerticalLayout} name="description">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <label className="title-detail">{L('WATER_FEE')}</label>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber
                    label={L('RENT_PER_M2')}
                    name="domesticWaterUnitPrice"
                    min={0}
                    placeholder={L('RENT_PER_M2')}
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber
                    label={L('TO_PRICE')}
                    name="domesticWaterTotalAmount"
                    min={0}
                    placeholder={L('TO_PRICE')}
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber
                    label={L('RENT_VAT')}
                    name="domesticWaterVATPercentage"
                    min={0}
                    placeholder={L('RENT_VAT')}
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber label={L('GTGT_TAX')} name="domesticWaterVATAmount" min={0} placeholder={L('GTGT_TAX')} />
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <label className="title-detail">{L('DRAINAGE_WASTE_SERVICE_FEE')}</label>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber
                    label={L('RENT_PER_M2')}
                    name="wasteWaterUnitPrice"
                    min={0}
                    placeholder={L('RENT_PER_M2')}
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber label={L('TO_PRICE')} name="wasteWaterTotalAmount" min={0} placeholder={L('TO_PRICE')} />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber
                    label={L('RENT_VAT')}
                    name="wasteWaterVATPercentage"
                    min={0}
                    placeholder={L('RENT_VAT')}
                  />
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <FormNumber label={L('GTGT_TAX')} name="wasteWaterVATAmount" min={0} placeholder={L('GTGT_TAX')} />
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <label className="title-error">{L('TOTAL_PRICE')}</label>
                </Col>
                <Col sm={{ span: 8, offset: 0 }}>
                  <FormNumber
                    label={L('TOTAL_PAYMENT_PRICE')}
                    name="totalAmount"
                    min={0}
                    placeholder={L('TOTAL_PAYMENT_PRICE')}
                  />
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('TRANS_DOCUMENT')}</label>
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <FileUploadWrapV2
                    multiple
                    parentId={this.state.idDocument}
                    fileStore={this.props.fileStore}
                    onRemoveFile={this.onRemoveFile}
                    beforeUploadFile={this.beforeUploadFile}
                    acceptedFileTypes={fileTypeGroup.documentAndImage}
                    totalSize={50}
                    maxSize={25}
                  />
                </Col>
              </>
            </Row>
          </Form>
        </Card>
      </WrapPageScroll>
    )
  }
}

export default withRouter(TotalWaterMeterDetail)
