import React from 'react'
import { Col, Form, Row, Card, Button, Modal, Table, Tabs, Input } from 'antd'
import { validateMessages } from '@lib/validation'
import { inject, observer } from 'mobx-react'
import { L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import AppConsts, { timeDateFormat } from '@lib/appconst'
import FormInput from '@components/FormItem/FormInput'
import SessionStore from '@stores/sessionStore'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import dayjs from 'dayjs'
import ApprovalOrRejectModal from './ApprovalOrRejectModal'
import { formatInteger, formatNumber } from '@lib/helper'
import VehicleRegistrationFormStore from '@stores/parking/VehicleRegistrationFormStore'
import column from './column'
import getColumn from './columnVehicle'
import ReactToPrint from 'react-to-print'

const { typeAccount, ticketRequestStatusEnum, ticketRequestTypeEnum, pageSize } = AppConsts
const confirm = Modal.confirm
const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

const tabKeys = {
  tabInfo: 'TAB_INFO',
  tabDetailVehicel: 'TAB_DETAI_VEHICLE'
}
export interface IDeliveryFormProps {
  navigate: any
  params: any
  vehicleRegistrationFormStore: VehicleRegistrationFormStore
  sessionStore: SessionStore
}

@inject(Stores.VehicleRegistrationFormStore, Stores.SessionStore)
@observer
class ConfirmElectricFormDetail extends AppComponentBase<IDeliveryFormProps> {
  formRef: any = React.createRef()
  formHistoryAppropval: any = React.createRef()
  printRef = React.createRef<HTMLDivElement>()
  printListDetailVehicelRef = React.createRef<HTMLDivElement>()

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
`

  state = {
    tabActiveKey: tabKeys.tabInfo,
    listQualityVehicle: [] as any,
    idDocument: '',
    files: [] as any,
    totalAmount: 0,
    totalVehicle: 0,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    isShowModalApprocal: false,
    listVehicleDetail: [] as any,
    filters: {},
    hiddenWhenPrint: false
  }

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    await Promise.all([this.getDetail(this.props.params?.id)])
  }

  getDetail = async (id?) => {
    if (id) {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.vehicleRegistrationFormStore.GetByResident(id)

          this.sumTotalAmount(this.props.vehicleRegistrationFormStore.confirmDetail?.vehicleRegistrationFee)
          this.sumTotalVehicle(this.props.vehicleRegistrationFormStore.confirmDetail?.vehicleRegistrationFee)
          if (this.props.vehicleRegistrationFormStore.confirmDetail?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.vehicleRegistrationFormStore.getListRequestHistory({
              id: this.props.vehicleRegistrationFormStore.confirmDetail?.id,
              requestTypeId: ticketRequestTypeEnum.VEHICLE_REGISTRATION
            })

            this.setState({
              allowApprovalOrReject: this.props.vehicleRegistrationFormStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.vehicleRegistrationFormStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
          break
        case typeAccount.Develop:
          break
        default:
          await this.props.vehicleRegistrationFormStore.get(id)
          this.sumTotalAmount(this.props.vehicleRegistrationFormStore.confirmDetail?.vehicleRegistrationFee)
          this.sumTotalVehicle(this.props.vehicleRegistrationFormStore.confirmDetail?.vehicleRegistrationFee)
          if (this.props.vehicleRegistrationFormStore.confirmDetail?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.vehicleRegistrationFormStore.getListRequestHistory({
              id: this.props.vehicleRegistrationFormStore?.confirmDetail?.id,
              requestTypeId: ticketRequestTypeEnum.VEHICLE_REGISTRATION
            })

            this.setState({
              allowApprovalOrReject: this.props.vehicleRegistrationFormStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.vehicleRegistrationFormStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
      }

      this.formRef.current.setFieldsValue({ ...this.props.vehicleRegistrationFormStore.confirmDetail })

      this.setState({
        idDocument: this.props.vehicleRegistrationFormStore.confirmDetail?.uniqueId,
        listQualityVehicle: this.props.vehicleRegistrationFormStore.confirmDetail?.vehicleRegistrationFee
      })
    }
  }
  changeTab = (tabKey) => {
    if (tabKey === tabKeys.tabDetailVehicel) {
      this.getListVehicleDetail(this.props.params?.id)
      console.log(this.props.vehicleRegistrationFormStore.listVehicleDetail.items)
    }
    this.setState({ tabActiveKey: tabKey })
  }

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value }, skipCount: 0 }, async () => {
      await this.getListVehicleDetail(this.props.params?.id)
    })
  }

  getListVehicleDetail = async (formId: number) => {
    await this.props.vehicleRegistrationFormStore.getVehicleRegistrationById({
      formId,
      skipCount: 0,
      maxResultCount: pageSize.pageSize_30,
      ...this.state.filters
    })
  }

  sumTotalAmount = (arrayReading) => {
    const totalAmountSum = arrayReading.reduce((sum, item) => sum + item.vatTotalPrice, 0)

    this.setState({ totalAmount: totalAmountSum ?? 0 })
  }

  sumTotalVehicle = (arrayReading) => {
    const totalAmountVehicle = arrayReading.reduce((sum, item) => sum + item.totalVehicle, 0)

    this.setState({ totalVehicle: totalAmountVehicle ?? 0 })
  }

  onCloseModal = () => {
    this.setState({ isShowModalApprocal: false })
  }
  onCancel = () => {
    const { navigate } = this.props

    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        navigate(portalLayouts.confirmQualityVehicle.path)
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

  openModalApprovalOrReject = (status) => {
    if (status === statusApproval.APPROVAL) {
      this.setState({ typeModalAproval: statusApproval.APPROVAL, isShowModalApprocal: true })
    } else {
      this.setState({ typeModalAproval: statusApproval.REJECT, isShowModalApprocal: true })
    }
  }

  updateStatus = async () => {
    const body = {
      id: this.props.vehicleRegistrationFormStore.confirmDetail?.id,
      requestTypeId: ticketRequestTypeEnum.VEHICLE_REGISTRATION,
      statusId: ticketRequestStatusEnum.Watting,
      description: ''
    }

    await this.props.vehicleRegistrationFormStore.sendApproval(body)
    await this.getDetail(this.props.params?.id)
  }
  handleApprovalOrReject = async (message: string, typeModalAproval: string) => {
    if (typeModalAproval === statusApproval.APPROVAL) {
      const body = {
        id: this.props.vehicleRegistrationFormStore.confirmDetail?.id,
        requestTypeId: ticketRequestTypeEnum.VEHICLE_REGISTRATION,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.vehicleRegistrationFormStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.vehicleRegistrationFormStore.confirmDetail?.id,
        requestTypeId: ticketRequestTypeEnum.VEHICLE_REGISTRATION,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.vehicleRegistrationFormStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.confirmQualityVehicle.path)
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          {this.state.allowApprovalOrReject && (
            <Button
              className="button-approval mr-1"
              onClick={() => this.openModalApprovalOrReject(statusApproval.APPROVAL)}
              loading={isLoading}
              shape="round">
              {L('BTN_APPROVAL')}
            </Button>
          )}
          {this.state.allowApprovalOrReject && (
            <Button
              className="button-reject mr-1"
              onClick={() => this.openModalApprovalOrReject(statusApproval.REJECT)}
              loading={isLoading}
              shape="round">
              {L('BTN_REJECT')}
            </Button>
          )}
          {/* Gửi duyệt khi đang ở nháp-> dành cho BQL */}
          {this.props.vehicleRegistrationFormStore?.confirmDetail?.statusId === ticketRequestStatusEnum.Draft &&
            this.isStaff && (
              <Button
                type="primary"
                className=" mr-1"
                onClick={() => this.updateStatus()}
                loading={isLoading}
                shape="round">
                {L('BTN_SEND')}
              </Button>
            )}

          {this.state.tabActiveKey === tabKeys.tabInfo && (
            <ReactToPrint
              trigger={() => (
                <Button type="primary" className=" mr-1" shape="round">
                  {L('BTN_PRINT_PDF')}
                </Button>
              )}
              content={() => this.printRef.current}
              documentTitle="confirm-quality-vehicle-10083"
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
    const {
      vehicleRegistrationFormStore: { isLoading },
      sessionStore: { userAccountType }
    } = this.props

    const columns = column()

    const columnsVehicle = getColumn(true)
    const columnsVehicleShowFull = getColumn(false)

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Tabs activeKey={this.state.tabActiveKey} onTabClick={this.changeTab} type="card">
          <Tabs.TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
            <Card bordered={false} style={{ minHeight: 750 }} ref={this.printRef}>
              <Form
                ref={this.formRef}
                layout={'vertical'}
                onAbort={this.onCancel}
                validateMessages={validateMessages}
                size="middle">
                <Row gutter={[16, 0]}>
                  {userAccountType !== typeAccount.Resident && userAccountType !== typeAccount.Develop && (
                    <>
                      <Col sm={{ span: 24, offset: 0 }}>
                        <label className="title-detail">{L('COMPANY_INFO')}</label>
                      </Col>
                      <Col sm={{ span: 24, offset: 0 }}>
                        <FormInput name={['company', 'companyName']} label={L('TRANSPORT_COMPANY_NAME')} disabled />
                      </Col>
                      {/* <Col sm={{ span: 8, offset: 0 }}>
                        <FormInput name={['company', 'companyCode']} label={L('TRANSPORT_TAX_CODE')} disabled />
                      </Col>
                      <Col sm={{ span: 8, offset: 0 }}>
                        <FormInput
                          name={['company', 'representative']}
                          label={L('TRANSPORT_REPRESENTATIVE')}
                          disabled
                        />
                      </Col>
                      <Col sm={{ span: 24, offset: 0 }}>
                        <FormInput
                          name={['company', 'primaryAddress']}
                          label={L('TRANSPORT_ADDRESS_CONTACT')}
                          disabled
                        />
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <FormInput name={['company', 'contactName']} label={L('TRANSPORT_USER_CONTACT')} disabled />
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <FormInput name={['company', 'position']} label={L('TRANSPORT_POSITION')} disabled />
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <FormInput name={['company', 'contactPhone']} label={L('TRANSPORT_PHONE')} disabled />
                      </Col>
                      <Col sm={{ span: 6, offset: 0 }}>
                        <FormInput name={['company', 'contactEmail']} label={L('TRANSPORT_EMAIL')} disabled />
                      </Col> */}
                    </>
                  )}

                  <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                    <label className="title-detail">{L('CONFIRM_MANAGEMENT_OFFICE')}</label>
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} className="mt-2">
                    <FormInput
                      name={['creatorUser', 'displayName']}
                      label={L('CONFIRM_MENTER_MO_RESPRESENTATIVE')}
                      disabled
                    />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} className="mt-2">
                    <FormInput name={['creatorUser', 'displayName']} label={L('CONFIRM_MENTER_POSITION')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} className="mt-2">
                    <FormInput name={['creatorUser', 'phoneNumber']} label={L('CONFIRM_MENTER_PHONE')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} className="mt-2">
                    <FormInput name={['creatorUser', 'emailAddress']} label={L('CONFIRM_MENTER_EMAIL')} disabled />
                  </Col>

                  <>
                    <Col sm={{ span: 24, offset: 0 }} className="mt-2 d-flex justify-content-between">
                      <label className="title-detail">{L('QUALITY_VIHLCLE_MANAGEMENT')}</label>
                      <div className="d-flex">
                        <div className="d-flex pr-2">
                          <label>{L('VEHICLE_TOTAL_AMOUNT')}:</label>
                          <label className="text-danger pl-2">{formatNumber(this.state.totalVehicle)}</label>
                        </div>
                        <div className="d-flex">
                          <label>{L('METER_TOTAL_AMOUNT')}:</label>
                          <label className="text-danger pl-2">
                            <strong>{formatInteger(this.state.totalAmount)}</strong>
                          </label>
                        </div>
                      </div>
                    </Col>
                    <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                      <Table
                        pagination={false}
                        size="small"
                        bordered
                        dataSource={this.state.listQualityVehicle}
                        columns={columns}
                        rowKey={(record) => record?.id}
                        scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
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
                    {this.props.vehicleRegistrationFormStore.confirmDetail?.statusId !==
                      ticketRequestStatusEnum.Draft && <label className="title-detail">{L('TRANS_APPROVAL')}</label>}
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
                                      disabled
                                      label={L('POSITION_APPROVAL')}
                                      name={[field.name, 'position', 'name']}
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
                                      style={{ fontWeight: '600' }}
                                    />
                                  </Col>
                                  <Col sm={{ span: 4, offset: 0 }}>
                                    <FormDatePicker
                                      disabled
                                      dateTimeFormat={timeDateFormat}
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
          </Tabs.TabPane>
          <Tabs.TabPane tab={L(tabKeys.tabDetailVehicel)} key={tabKeys.tabDetailVehicel}>
            <Row gutter={[4, 4]}>
              <Col md={{ span: 6 }} sm={{ span: 24 }}>
                <Input.Search
                  maxLength={200}
                  onSearch={(value) => this.handleSearch('keyword', value)}
                  placeholder={`${this.L('KEYWORD_FILTER_CONFIRM_VEHICLE')}`}
                />
              </Col>
              <Col md={{ span: 18 }} sm={{ span: 24 }} className="d-flex justify-content-end">
                <ReactToPrint
                  trigger={() => (
                    <Button type="primary" className=" mr-1" shape="round">
                      {L('BTN_PRINT_PDF')}
                    </Button>
                  )}
                  content={() => this.printListDetailVehicelRef.current}
                  documentTitle="confirm-quality-vehicle-10083"
                  pageStyle={this.pageStyle}
                  removeAfterPrint
                  onBeforeGetContent={() => {
                    return new Promise<void>((resolve) => {
                      this.setState({ hiddenWhenPrint: true }, () => resolve())
                    })
                  }}
                  onAfterPrint={() => this.setState({ hiddenWhenPrint: false })}
                />
              </Col>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2" ref={this.printListDetailVehicelRef}>
                <Table
                  pagination={false}
                  size="small"
                  bordered
                  dataSource={this.props.vehicleRegistrationFormStore.listVehicleDetail.items}
                  columns={this.state.hiddenWhenPrint ? columnsVehicleShowFull : columnsVehicle}
                  rowKey={(record) => record?.id}
                  scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                />
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>

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

export default withRouter(ConfirmElectricFormDetail)
