import React from 'react'
import { Col, Form, Row, Card, Button, Modal, Select, Input, Table } from 'antd'
import { validateMessages } from '@lib/validation'
import { inject, observer } from 'mobx-react'
import { L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import ElectricFormStore from '@stores/meterReading/electricFormStore'
import unitService from '@services/project/unitService'
import { addItemToList, filterOptions, notifyInfo } from '@lib/helper'
import AppConsts, { appStatusColors, fileTypeGroup } from '@lib/appconst'
import rules from './validation'
import companyService from '@services/project/companyService'
import packageFeeService from '@services/fee/packageFeeService'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import { CheckCircleFilled, CloseCircleFilled, EditFilled } from '@ant-design/icons'
import columnsElectricReding from './columnsElectricReding'
import { v4 as uuid } from 'uuid'
import FileUploadWrapV2 from '@components/FileUploadV2'
import feeTypeService from '@services/fee/feeTypeService'

const { formVerticalLayout, align } = AppConsts
const confirm = Modal.confirm

export interface IDeliveryFormProps {
  navigate: any
  params: any
  location: any
  fileStore: FileStore
  electricFormStore: ElectricFormStore
}

@inject(Stores.ElectricFormStore, Stores.FileStore)
@observer
class EletricFormDetail extends AppComponentBase<IDeliveryFormProps> {
  formRef: any = React.createRef()
  formItemElectricReading: any = React.createRef()

  state = {
    files: [] as any,
    idDocument: undefined,
    listCompany: [] as any,
    listPeriod: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    visibleAction: false,
    itemElectricReading: [] as any,
    feePackageCurrent: {} as any
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    await Promise.all([
      await this.getistCompanies(),
      await this.handleCurrentFeePackage(),
      await this.getLsitPeriod(''),
      await this.getDetail(this.props.params?.id)
    ])

    // Update listPeriod after it's fully loaded
    this.setState((prevState) => ({
      listPeriod: addItemToList(prevState.listPeriod, prevState.feePackageCurrent)
    }))
  }

  getDetail = async (id?) => {
    if (id) {
      await this.props.electricFormStore.getFormDraft(id)

      this.formRef.current.setFieldsValue({ ...this.props.electricFormStore.meterDetail })

      this.setState({
        idDocument: this.props.electricFormStore.meterDetail?.uniqueId,
        itemElectricReading: this.props.electricFormStore.meterDetail?.electricDetails
      })

      this.formRef.current.setFieldsValue({
        ...this.props.electricFormStore.meterDetail
      })
    } else if (this.props.location.state.copyId) {
      await this.props.electricFormStore.getFormDraft(this.props.location.state.copyId)

      // reset the values as requested
      const clearedDetails = this.props.electricFormStore.meterDetail?.electricDetails.map((item) => ({
        ...item,
        previousReading: item.newReading,
        newReading: null,
        previousSunReading: item.newSunReading,
        newSunReading: null,
        quantitySunConsumption: null,
        quantityConsumption: null,
        quantity: null
      }))

      this.formRef.current.setFieldsValue({
        companyId: this.props.electricFormStore.meterDetail.companyId,
        electricDetails: clearedDetails
      })

      this.setState({
        idDocument: this.props.electricFormStore.meterDetail?.uniqueId,
        itemElectricReading: clearedDetails
      })
    } else {
      await this.props.electricFormStore.initCreate()
      this.setState({ itemElectricReading: [] })
      this.formRef.current.setFieldsValue({
        ...this.props.electricFormStore.meterDetail,
        feePackageId: this.state.feePackageCurrent?.id ?? undefined
      })
    }
  }

  handleCurrentFeePackage = async () => {
    const feePackageCurrent = await feeTypeService.getCurrent()
    this.setState({ feePackageCurrent })
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

  onSave = () => {
    const form = this.formRef.current
    if (this.checkValidListElectric(this.state.itemElectricReading)) {
      form.validateFields().then(async (values: any) => {
        const body = {
          ...values,
          electricDetails: this.state.itemElectricReading.map((item) => ({
            ...item,
            id: typeof item.id !== 'number' ? 0 : item.id,
            quantitySunConsumption: item.quantitySunConsumption || 0
          }))
        }

        if (this.props.params?.id) {
          this.props.electricFormStore.update(
            {
              ...body,
              id: this.props.electricFormStore?.meterDetail?.id
            },
            this.state.files
          )
        } else {
          delete body.id
          this.props.electricFormStore.create(
            {
              ...body
            },
            this.state.files.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          )
        }

        this.props.navigate(portalLayouts.meterElectricOffice.path)
      })
    }
  }

  getistCompanies = async () => {
    const listCompany = await companyService.getListCompany()

    this.setState({ listCompany })
  }

  getListUnit = async (companyId: number) => {
    if (companyId) {
      const listUnit = await unitService.getAllUnitByCompanyId(companyId)

      const dataCovert = listUnit.map((item) => ({
        id: uuid(),
        fullUnitCode: item?.fullUnitCode,
        unitId: item?.id,
        previousReading: null,
        newReading: null,
        quantity: null,
        amount: 0
      }))
      this.setState({ itemElectricReading: dataCovert })
    } else {
      this.setState({ itemElectricReading: [] })
    }
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
        navigate(portalLayouts.meterElectricOffice.path)
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

  // handleAddRow = () => {
  //   this.setState({ visibleAction: true })
  //   this.formItemElectricReading.current.resetFields()
  //   const newRow = { id: uuid() }

  //   const newData = [...this.state.itemElectricReading]

  //   newData.unshift(newRow)

  //   this.setState({ itemElectricReading: newData })
  //   this.setState({ uniqueId: newRow.id })
  // }

  saveRow = async (id: any) => {
    const values = await this.formItemElectricReading.current.validateFields()
    const foundItem = this.state.itemElectricReading.find((item) => item.id === this.state.uniqueId)
    if (id === undefined) {
      if (foundItem) {
        values.quantitySunConsumption = values?.newSunReading - values?.previousSunReading
        values.quantityConsumption = values?.newReading - values?.previousReading
        values.quantity =
          values?.quantityConsumption - values?.quantitySunConsumption > 0
            ? values?.quantityConsumption - values?.quantitySunConsumption
            : 0

        // Merge the found item with the object
        Object.assign(foundItem, values)
      }
    } else {
      values.id = id

      if (foundItem) {
        values.quantitySunConsumption = values?.newSunReading - values?.previousSunReading
        values.quantityConsumption = values?.newReading - values?.previousReading
        values.quantity =
          values?.quantityConsumption - values?.quantitySunConsumption > 0
            ? values?.quantityConsumption - values?.quantitySunConsumption
            : 0

        // Merge the found item with the object
        Object.assign(foundItem, { ...foundItem, ...values })
      }
    }

    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
    this.formItemElectricReading.current?.resetFields()
  }

  handleCancleRow = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó
    if (this.state.previousDataRow === undefined) {
      const newItemElectricReading = this.state.itemElectricReading.filter((item) => item.id !== id)
      this.setState({ itemElectricReading: newItemElectricReading })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleDeleteRow = (id) => {
    const newItemElectricReading = this.state.itemElectricReading.filter((item) => item.id !== id)
    this.setState({ itemElectricReading: newItemElectricReading })
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
    const {
      electricFormStore: { isLoading }
    } = this.props

    const columns = columnsElectricReding(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: 50,
        render: (action, row) => {
          return this.state.uniqueId === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRow(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancleRow(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formItemElectricReading.current.setFieldsValue({
                    ...row
                  })
                  this.setState({ uniqueId: row?.id, visibleAction: true, previousDataRow: { ...row } })
                }}
              />

              {/* <Button
                disabled={this.state.visibleAction && this.state.uniqueId !== row.id}
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => this.handleDeleteRow(row.id)}
              /> */}
            </div>
          )
        }
      },
      this.isEditing
    )

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Card bordered={false} style={{ minHeight: 750 }}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 0]}>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item
                  label={L('CONTRACT_COMPANY')}
                  {...formVerticalLayout}
                  name="companyId"
                  rules={rules.companyId}>
                  <Select
                    showSearch
                    allowClear
                    disabled={this.props.location?.state?.copyId}
                    filterOption={filterOptions}
                    className="full-width"
                    onChange={this.getListUnit}>
                    {this.renderOptions(this.state.listCompany)}
                  </Select>
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

              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('METER_NOTE')} {...formVerticalLayout} name="note">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>

              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('METER_ELECTRIC_READING')}</label>
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <Form
                    ref={this.formItemElectricReading}
                    layout={'vertical'}
                    size="middle"
                    validateMessages={validateMessages}>
                    <Table
                      pagination={false}
                      size="small"
                      components={{
                        body: {
                          cell: EditableCell
                        }
                      }}
                      bordered
                      dataSource={this.state.itemElectricReading}
                      columns={columns}
                      rowKey={(record) => record.id}
                      scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                    />
                  </Form>
                  <style scoped>{`
                    .ant-table-wrapper{
                     margin-bottom: 0px
                   }
               `}</style>
                  {/* <Button
                    type="primary"
                    className="w-100"
                    onClick={this.handleAddRow}
                    disabled={this.state.visibleAction}>
                    {L('ADD_NEW_ROW')}
                  </Button> */}
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

export default withRouter(EletricFormDetail)
