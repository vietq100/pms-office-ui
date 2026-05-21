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
import { addItemToList, filterOptions, notifyInfo } from '@lib/helper'
import AppConsts, { dateFormat, fileTypeGroup, timeDateFormat } from '@lib/appconst'
import rules from '../managementFeeDetail/validation'
import packageFeeService from '@services/fee/packageFeeService'
import FileUploadWrapV2 from '@components/FileUploadV2'
import Spreadsheet from '../managementFeeDetail/spreadsheet'
import ManagementFeeStore from '@stores/paymentRequest/managementFeeStore'
import FormInput from '@components/FormItem/FormInput'
import SessionStore from '@stores/sessionStore'
import dayjs from 'dayjs'
import developService from '@services/member/develop/developService'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import ApprovalOrRejectModal from '@scenes/ticketRegistration/renovation/renovationDetail/ApprovalOrRejectModal'
import feeTypeService from '@services/fee/feeTypeService'
import ReactToPrint from 'react-to-print'

const { formVerticalLayout, ticketRequestTypeEnum, ticketRequestStatusEnum } = AppConsts
const confirm = Modal.confirm
const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IDeliveryFormProps {
  navigate: any
  params: any
  fileStore: FileStore
  managementFeeStore: ManagementFeeStore
  sessionStore: SessionStore
}

@inject(Stores.ManagementFeeStore, Stores.FileStore, Stores.SessionStore)
@observer
class ManagementFeeDetail extends AppComponentBase<IDeliveryFormProps> {
  formRef: any = React.createRef()
  formHistoryAppropval: any = React.createRef()
  printRef = React.createRef<HTMLDivElement>()

  pageStyle = `
    @page {
      size: A4 portrait;
      margin: 2mm !important;
    }
    body {
      padding: 0 !important;
      margin: 0 !important;
    }
    .print-container {
      padding: 3px !important;
    }
    @media print {
      .hide-on-print {
        display: none !important;
      }
    }
  `

  state = {
    files: [] as any,
    idDocument: undefined,
    listDevelop: [] as any,
    listPeriod: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    allowApprovalOrReject: false,
    typeModalAproval: statusApproval.APPROVAL,
    isShowModalApprocal: false,
    visibleAction: false,
    feePackageCurrent: {} as any
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  async componentDidMount() {
    await Promise.all([
      this.getDevelops(),
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
    if (!id) {
      await this.props.managementFeeStore.initRecord()

      this.formRef.current.setFieldsValue({
        companyName: this.props.sessionStore.project?.investorName,
        companyAddress: this.props.sessionStore.project?.address,
        creatorUser: this.props.sessionStore.currentLogin?.user,
        feePackageId: this.state.feePackageCurrent?.id ?? undefined,
        startOfDate: dayjs(this.state.feePackageCurrent?.startDate),
        endOfDate: dayjs(this.state.feePackageCurrent?.endDate)
      })
    } else {
      await this.props.managementFeeStore.get(id)
      await this.props.managementFeeStore.getListRequestHistory({
        id: this.props.managementFeeStore.dataDetail?.id,
        requestTypeId: ticketRequestTypeEnum.MANAGEMENT_FEE
      })
      this.setState({
        allowApprovalOrReject: this.props.managementFeeStore.listRequestHistory.some(
          (item) => item?.canSendRequest === true
        )
      })
      this.formHistoryAppropval.current.setFieldsValue({
        histories: [...this.props.managementFeeStore.listRequestHistory].map((item) => ({
          ...item,
          lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
        }))
      })
      this.setState({
        idDocument: this.props.managementFeeStore.dataDetail?.uniqueId
      })
      this.setState((prevState) => ({
        listPeriod: addItemToList(prevState.listPeriod, this.props.managementFeeStore.dataDetail?.feePackage)
      }))
    }
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        ...this.props.managementFeeStore.dataDetail
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

  openModalApprovalOrReject = (status) => {
    if (status === statusApproval.APPROVAL) {
      this.setState({ typeModalAproval: statusApproval.APPROVAL, isShowModalApprocal: true })
    } else {
      this.setState({ typeModalAproval: statusApproval.REJECT, isShowModalApprocal: true })
    }
  }
  onCloseModal = () => {
    this.setState({ isShowModalApprocal: false })
  }
  handleApprovalOrReject = async (message: string, typeModalAproval: string) => {
    const body = {
      id: this.props.managementFeeStore.dataDetail?.id,
      requestTypeId: ticketRequestTypeEnum.MANAGEMENT_FEE,
      description: message
    }
    if (typeModalAproval === statusApproval.APPROVAL) {
      await this.props.managementFeeStore.sendApproval({ ...body, statusId: ticketRequestStatusEnum.Approval })
    } else {
      await this.props.managementFeeStore.sendApproval({ ...body, statusId: ticketRequestStatusEnum.Rejected })
    }

    this.props.navigate(portalLayouts.managementFee.path)
  }

  onSave = async (isSendApproval) => {
    const form = this.formRef.current
    const id = this.props.params?.id ? Number(this.props.params.id) : undefined
    form.validateFields().then(async (values: any) => {
      await this.props.managementFeeStore.createOrUpdate({ ...values, id }, this.state.files)
      if (isSendApproval && this.props.managementFeeStore.dataDetail?.id) {
        const body = {
          id: this.props.managementFeeStore.dataDetail?.id,
          requestTypeId: ticketRequestTypeEnum.MANAGEMENT_FEE,
          statusId: ticketRequestStatusEnum.Watting,
          description: ''
        }

        await this.props.managementFeeStore.sendApproval(body)
      }
      this.props.navigate(portalLayouts.managementFee.path)
    })
  }

  getDevelops = async (keyword?) => {
    const res = await developService.getAll({ keyword, isActive: true })
    const listDevelop = res.items ?? []
    this.setState({ listDevelop })
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
        navigate(portalLayouts.managementFee.path)
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
          {this.state.allowApprovalOrReject &&
            this.props.managementFeeStore.dataDetail?.statusId !== ticketRequestStatusEnum.Draft && (
              <Button
                className="button-approval mr-1"
                onClick={() => this.openModalApprovalOrReject(statusApproval.APPROVAL)}
                loading={isLoading}
                shape="round">
                {L('BTN_APPROVAL')}
              </Button>
            )}
          {this.state.allowApprovalOrReject &&
            this.props.managementFeeStore.dataDetail?.statusId !== ticketRequestStatusEnum.Draft && (
              <Button
                className="button-reject mr-1"
                onClick={() => this.openModalApprovalOrReject(statusApproval.REJECT)}
                loading={isLoading}
                shape="round">
                {L('BTN_REJECT')}
              </Button>
            )}
          {this.props.managementFeeStore.dataDetail?.statusId === ticketRequestStatusEnum.Draft && (
            <Button
              disabled={this.state.uniqueId !== ''}
              type="primary"
              className="mr-1"
              onClick={() => this.onSave(true)}
              loading={isLoading}
              shape="round">
              {L('BTN_SEND_APPOVAL')}
            </Button>
          )}
          {this.props.managementFeeStore.dataDetail?.statusId === ticketRequestStatusEnum.Draft && (
            <Button
              disabled={this.state.visibleAction}
              type="primary"
              onClick={this.onSave}
              className="mr-1"
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
          {this.props.managementFeeStore?.dataDetail?.id && (
            <ReactToPrint
              trigger={() => (
                <Button type="primary" className=" mr-1" shape="round">
                  {L('BTN_PRINT_PDF')}
                </Button>
              )}
              content={() => this.printRef.current}
              documentTitle="payment-request-management-fee"
              pageStyle={this.pageStyle}
              removeAfterPrint
            />
          )}
          <Button onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
        </Col>
      </Row>
    )
  }

  public render() {
    const isCreate = this.props.params?.id ? false : true
    return (
      <WrapPageScroll renderActions={() => this.renderActions(false)}>
        <Card bordered={false} style={{ minHeight: 750 }} ref={this.printRef}>
          <Form
            ref={this.formRef}
            layout={'vertical'}
            onFinish={this.onSave}
            onAbort={this.onCancel}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[16, 4]}>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('RECIPIENT')}</label>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormInput label={L('COMPANY_NAME')} disabled name="companyName" />
              </Col>
              <Col span={24} offset={0}>
                <FormInput name="companyAddress" disabled label={L('CONTACT_ADDRESS')} />
              </Col>
              {!isCreate ? (
                <Col span={6} offset={0}>
                  <FormInput name="contactorName" disabled label={L('CONTACT_NAME')} />
                </Col>
              ) : (
                <Col span={6} offset={0}>
                  <Form.Item
                    label={L('CONTACT_NAME')}
                    {...formVerticalLayout}
                    name="contactorId"
                    rules={rules.companyId}>
                    <Select
                      showSearch
                      allowClear
                      filterOption={filterOptions}
                      className="full-width"
                      onChange={(val) => {
                        const currentItem = this.state.listDevelop.find((item) => item.id === val)
                        this.formRef.current.setFieldValue('contactorPosition', currentItem?.position)
                        this.formRef.current.setFieldValue('contactorPhone', currentItem?.phoneNumber)
                        this.formRef.current.setFieldValue('contactorEmailAddress', currentItem?.emailAddress)
                      }}
                      onSearch={this.getDevelops}>
                      {this.renderOptions(this.state.listDevelop)}
                    </Select>
                  </Form.Item>
                </Col>
              )}
              <Col span={6} offset={0}>
                <FormInput name="contactorPosition" disabled label={L('POSISTION')} />
              </Col>
              <Col span={6} offset={0}>
                <FormInput name="contactorPhone" disabled label={L('PHONE_NUMBER')} />
              </Col>
              <Col span={6} offset={0}>
                <FormInput name="contactorEmailAddress" disabled label={L('EMAIL')} />
              </Col>

              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('PROPONENT')}</label>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item name="dateOfCreation" label={L('RECORD_DATE')}>
                  <DatePicker
                    disabled={!isCreate}
                    format={dateFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item
                  label={L('METER_PERIOD')}
                  {...formVerticalLayout}
                  name="feePackageId"
                  rules={rules.companyId}>
                  <Select
                    showSearch
                    disabled={!isCreate}
                    allowClear
                    filterOption={filterOptions}
                    className="full-width"
                    onChange={(val) => {
                      const currentPeriod = this.state.listPeriod.find((item) => item.id === val)
                      this.formRef.current.setFieldValue('startOfDate', dayjs(currentPeriod?.startDate))
                      this.formRef.current.setFieldValue('endOfDate', dayjs(currentPeriod?.endDate))
                    }}
                    onSearch={this.getLsitPeriod}>
                    {this.renderOptions(this.state.listPeriod)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12} />
              <Col span={6} offset={0}>
                <FormInput name={['creatorUser', 'displayName']} disabled label={L('CONTACT_NAME')} />
              </Col>
              <Col span={6} offset={0}>
                <FormInput name={['creatorUser', 'posistion']} disabled label={L('POSISTION')} />
              </Col>
              <Col span={6} offset={0}>
                <FormInput name={['creatorUser', 'identityNumber']} disabled label={L('PHONE_NUMBER')} />
              </Col>
              <Col span={6} offset={0}>
                <FormInput name={['creatorUser', 'emailAddress']} disabled label={L('EMAIL')} />
              </Col>

              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('INFO_MANAGEMENT_FEE')}</label>
                </Col>
                <Col sm={{ span: 6, offset: 0 }}>
                  <Form.Item name="paymentBeforeDate" label={L('PAYMENT_BEFORE_DATE')}>
                    <DatePicker
                      format={dateFormat}
                      disabled={!isCreate}
                      style={{ width: '100%' }}
                      placeholder={L('SELECT_DATE')}
                    />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24 }}>
                  <Spreadsheet form={this.formRef} data={this.props.managementFeeStore.dataDetail} />
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="hide-on-print">
                  <Form.Item label={L('METER_NOTE')} {...formVerticalLayout} name="description">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2 hide-on-print">
                  <label className="title-detail">{L('TRANS_DOCUMENT')}</label>
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="hide-on-print">
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

          <Form
            ref={this.formHistoryAppropval}
            layout={'vertical'}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[6, 6]}>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('TRANS_APPROVAL')}</label>
                <Form.List name="histories">
                  {(fields) => {
                    return (
                      <Row gutter={[4, 4]}>
                        {fields.map((field, index) => (
                          <Col sm={{ span: 24, offset: 0 }} key={field.key}>
                            <Row gutter={[16, 0]} className="pt-3 d-flex align-items-center">
                              <Col sm={{ span: 24, offset: 0 }} style={{ display: 'none' }}></Col>
                              <Col sm={{ span: 4, offset: 0 }}>
                                <label className="text-level-approval">
                                  {L('LEVER_APPROVAL')} {index + 1}
                                </label>
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }}>
                                <FormInput
                                  label={L('POSITION_APPROVAL')}
                                  name={[field.name, 'position', 'name']}
                                  disabled
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }}>
                                <FormInput
                                  disabled
                                  label={L('USER_APPROVAL')}
                                  name={[field.name, 'approvedUser', 'displayName']}
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }}>
                                <FormInput
                                  disabled
                                  label={L('STATUS_APPROVAL')}
                                  name={[field.name, 'status', 'name']}
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }}>
                                <FormDatePicker
                                  dateTimeFormat={timeDateFormat}
                                  disabled
                                  label={L('DATE_APPROVAL')}
                                  name={[field.name, 'lastModificationTime']}
                                />
                              </Col>

                              <Col sm={{ span: 4, offset: 0 }}>
                                <FormTextArea
                                  disabled
                                  rows={3}
                                  label={L('DESCRIPTION_APPROVAL')}
                                  name={[field.name, 'description']}
                                />
                              </Col>
                            </Row>
                          </Col>
                        ))}
                      </Row>
                    )
                  }}
                </Form.List>
              </Col>
            </Row>
          </Form>
        </Card>
        <ApprovalOrRejectModal
          visible={this.state.isShowModalApprocal}
          typeModalAproval={this.state.typeModalAproval}
          onCancel={this.onCloseModal}
          onOke={(message, typeModalAproval) => this.handleApprovalOrReject(message, typeModalAproval)}
        />
      </WrapPageScroll>
    )
  }
}

export default withRouter(ManagementFeeDetail)
