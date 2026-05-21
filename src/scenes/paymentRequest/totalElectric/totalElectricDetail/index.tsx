import React from 'react'
import { Col, Form, Row, Card, Button, Modal, Select, Input, DatePicker, InputNumber } from 'antd'
import { validateMessages } from '@lib/validation'
import { inject, observer } from 'mobx-react'
import { L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import { addItemToList, filterOptions, notifyInfo } from '@lib/helper'
import AppConsts, { dateFormat, fileTypeGroup } from '@lib/appconst'
import rules from './validation'
import companyService from '@services/project/companyService'
import packageFeeService from '@services/fee/packageFeeService'
import FileUploadWrapV2 from '@components/FileUploadV2'
import TotalElectricMeterStore from '@stores/paymentRequest/totalElectricMeterStore'
import Spreadsheet from './spreadsheet'
import feeTypeService from '@services/fee/feeTypeService'

const { formVerticalLayout } = AppConsts
const confirm = Modal.confirm

export interface IDeliveryFormProps {
  navigate: any
  params: any
  location: any
  fileStore: FileStore
  totalElectricMeterStore: TotalElectricMeterStore
}

@inject(Stores.TotalElectricMeterStore, Stores.FileStore)
@observer
class TotalElectricMeterDetail extends AppComponentBase<IDeliveryFormProps> {
  formRef: any = React.createRef()

  state = {
    files: [] as any,
    idDocument: undefined,
    listCompany: [] as any,
    listPeriod: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    visibleAction: false,
    feePackageCurrent: {} as any
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    await Promise.all([
      this.getistCompanies(),
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
      await this.props.totalElectricMeterStore.get(id)
      this.setState((prevState) => ({
        idDocument: this.props.totalElectricMeterStore.dataDetail?.uniqueId,
        listPeriod: addItemToList(prevState.listPeriod, this.props.totalElectricMeterStore.dataDetail?.feePackage)
      }))
      this.formRef.current.setFieldsValue({
        ...this.props.totalElectricMeterStore.dataDetail,
        vatPercentage: this.props.totalElectricMeterStore.dataDetail?.vatPercentage ?? 8
      })
    } else if (this.props.location.state.copyId) {
      await this.props.totalElectricMeterStore.get(this.props.location.state.copyId)
      this.setState((prevState) => ({
        idDocument: this.props.totalElectricMeterStore.dataDetail?.uniqueId,
        listPeriod: addItemToList(prevState.listPeriod, this.props.totalElectricMeterStore.dataDetail?.feePackage)
      }))
      this.formRef.current.setFieldsValue({
        lowFromIndex: this.props.totalElectricMeterStore.dataDetail.lowToIndex,
        peakFromIndex: this.props.totalElectricMeterStore.dataDetail.peakToIndex,
        normalFromIndex: this.props.totalElectricMeterStore.dataDetail.normalToIndex
      })
    } else {
      await this.props.totalElectricMeterStore.initRecord()
      this.formRef.current.setFieldsValue({
        ...this.props.totalElectricMeterStore.dataDetail,
        feePackageId: this.state.feePackageCurrent?.id ?? undefined,
        vatPercentage: 8
      })
    }
  }
  checkValidListElectric = (listItemElectric) => {
    const isArrayNotNullIndex: boolean = listItemElectric.every(
      (item) => item.previousReading !== null && item.newReading !== null
    )

    if (isArrayNotNullIndex === false) {
      notifyInfo(LNotification('WARNING'), LNotification('TABLE_INDEX_NOT_NULL'))
      return false
    }
    return isArrayNotNullIndex
  }
  onSave = async () => {
    const form = this.formRef.current
    const id = this.props.params?.id ? Number(this.props.params.id) : undefined
    form.validateFields().then(async (values: any) => {
      await this.props.totalElectricMeterStore.createOrUpdate({ ...values, id }, this.state.files)
      await this.props.navigate(portalLayouts.totalElectricMeter.path)
    })
  }
  getistCompanies = async () => {
    const listCompany = await companyService.getListCompany()

    this.setState({ listCompany })
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
        navigate(portalLayouts.totalElectricMeter.path)
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
            onFinish={this.onSave}
            onAbort={this.onCancel}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 8]}>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('INFOR_MASTER_ELECTRIC_CLOCK')}</label>
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

              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="vatPercentage" label={L('RENT_VAT')}>
                  <InputNumber style={{ width: '100%' }} placeholder={L('RENT_VAT')} min={0} />
                </Form.Item>
              </Col>

              <>
                <Col sm={{ span: 24, offset: 0 }}>
                  <label className="title-detail">{L('METER_ELECTRIC_READING')}</label>
                </Col>
                <Col sm={{ span: 24 }}>
                  <Spreadsheet form={this.formRef} data={this.props.totalElectricMeterStore.dataDetail} />
                </Col>
                <Col sm={{ span: 24, offset: 0 }}>
                  <Form.Item label={L('METER_NOTE')} {...formVerticalLayout} name="description">
                    <Input.TextArea rows={4} />
                  </Form.Item>
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

export default withRouter(TotalElectricMeterDetail)
