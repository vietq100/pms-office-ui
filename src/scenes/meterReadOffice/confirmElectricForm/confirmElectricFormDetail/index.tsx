import React from 'react'
import { Col, Form, Row, Card, Button, Modal, Table } from 'antd'
import { validateMessages } from '@lib/validation'
import { inject, observer } from 'mobx-react'
import { isGranted, isGrantedAny, L, LNotification } from '@lib/abpUtility'
import WrapPageScroll from '@components/WrapPageScroll'
import FileStore from '@stores/common/fileStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import Stores from '@stores/storeIdentifier'
import AppComponentBase from '@components/AppComponentBase'
import ElectricFormStore from '@stores/meterReading/electricFormStore'
import AppConsts, { appPermissions, appStatusColors, fileTypeGroup, timeDateFormat } from '@lib/appconst'
import FileUploadWrapV2 from '@components/FileUploadV2'
import FormInput from '@components/FormItem/FormInput'
import SessionStore from '@stores/sessionStore'
import columnsElectricReding from './columnElectricReading'
import FormTextArea from '@components/FormItem/FormTextArea'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import dayjs from 'dayjs'
import ApprovalOrRejectModal from './ApprovalOrRejectModal'
import { formatNumber, notifyInfo } from '@lib/helper'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import { CheckCircleFilled, CloseCircleFilled, EditFilled } from '@ant-design/icons'
import ReactToPrint from 'react-to-print'

const { typeAccount, ticketRequestStatusEnum, ticketRequestTypeEnum, align } = AppConsts
const confirm = Modal.confirm
const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IDeliveryFormProps {
  navigate: any
  params: any
  fileStore: FileStore
  electricFormStore: ElectricFormStore
  sessionStore: SessionStore
}

@inject(Stores.ElectricFormStore, Stores.FileStore, Stores.SessionStore)
@observer
class ConfirmElectricFormDetail extends AppComponentBase<IDeliveryFormProps> {
  formRef: any = React.createRef()
  formHistoryAppropval: any = React.createRef()
  formItemElectricReading: any = React.createRef()
  printRef = React.createRef<HTMLDivElement>()

  pageStyle = `
    @page {
      size: A4 portrait;
      margin: 2mm !important;
    }
    body {
      font-size: 12px;
      padding: 0 !important;
      margin: 0 !important;
    }
    .print-container {
      padding: 3px !important;
    }
  `

  state = {
    itemElectricReading: [] as any,
    idDocument: '',
    uniqueId: '',
    files: [] as any,
    totalAmount: 0,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    isShowModalApprocal: false,
    visibleAction: false,
    previousDataRow: undefined,
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

  isEditing = (record: any) => record.id === this.state.uniqueId

  getDetail = async (id?) => {
    if (id) {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.electricFormStore.getConfirmElectricForm4Tenant(id)
          this.sumTotalAmount(this.props.electricFormStore.confirmMeterDetail?.electricDetails)
          if (this.props.electricFormStore.confirmMeterDetail?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.electricFormStore.getListRequestHistory({
              id: this.props.electricFormStore.confirmMeterDetail?.id,
              requestTypeId: ticketRequestTypeEnum.ELECTRIC
            })

            this.setState({
              allowApprovalOrReject: this.props.electricFormStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.electricFormStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
          break
        case typeAccount.Develop:
          break
        default:
          await this.props.electricFormStore.getConfirmElectricForm(id)
          this.sumTotalAmount(this.props.electricFormStore.confirmMeterDetail?.electricDetails)
          if (this.props.electricFormStore.confirmMeterDetail?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.electricFormStore.getListRequestHistory({
              id: this.props.electricFormStore.confirmMeterDetail?.id,
              requestTypeId: ticketRequestTypeEnum.ELECTRIC
            })

            this.setState({
              allowApprovalOrReject: this.props.electricFormStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.electricFormStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
      }

      this.formRef.current.setFieldsValue({ ...this.props.electricFormStore.confirmMeterDetail })
      this.setState({
        idDocument: this.props.electricFormStore.confirmMeterDetail?.uniqueId,
        itemElectricReading: this.props.electricFormStore.confirmMeterDetail?.electricDetails
      })
    }
  }

  sumTotalAmount = (arrayEletricReading) => {
    const totalAmountSum = arrayEletricReading.reduce((sum, item) => sum + item.totalAmount, 0)

    this.setState({ totalAmount: totalAmountSum ?? 0 })
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
        navigate(portalLayouts.confirmMeterElectricOffice.path)
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

  handleApprovalOrReject = async (message: string, typeModalAproval: string) => {
    if (typeModalAproval === statusApproval.APPROVAL) {
      const body = {
        id: this.props.electricFormStore.confirmMeterDetail?.id,
        requestTypeId: ticketRequestTypeEnum.ELECTRIC,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.electricFormStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.electricFormStore.confirmMeterDetail?.id,
        requestTypeId: ticketRequestTypeEnum.ELECTRIC,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.electricFormStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.confirmMeterElectricOffice.path)
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
    if (this.checkValidListElectric(this.state.itemElectricReading)) {
      const body = {
        id: Number(this.props.params?.id),
        electricDetails: this.state.itemElectricReading.map((item) => ({
          ...item,
          id: typeof item.id !== 'number' ? 0 : item.id
        }))
      }

      this.props.electricFormStore.updateElectricForm(body)

      this.props.navigate(portalLayouts.confirmMeterElectricOffice.path)
    }
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
          {isGranted(appPermissions.ElectricForm.update) && (
            <Button
              disabled={this.state.visibleAction}
              type="primary"
              className="mr-1"
              onClick={this.onSave}
              loading={isLoading}
              shape="round">
              {L('BTN_SAVE')}
            </Button>
          )}
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
            onBeforeGetContent={() => {
              return new Promise<void>((resolve) => {
                this.setState({ hiddenWhenPrint: true }, () => resolve())
              })
            }}
            onAfterPrint={() => this.setState({ hiddenWhenPrint: false })}
          />
          <Button onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
        </Col>
      </Row>
    )
  }

  saveRow = async (id: any) => {
    const values = await this.formItemElectricReading.current.validateFields()
    const foundIndex = this.state.itemElectricReading.findIndex((item) => item.id === this.state.uniqueId)

    if (foundIndex !== -1) {
      // Compute totalAmount using updated values
      const quantity = this.state.itemElectricReading[foundIndex]?.quantity || 0
      const amount = Number(values?.amount || 0)
      const totalAmount = amount * quantity

      const updatedItem = {
        ...this.state.itemElectricReading[foundIndex],
        ...values,
        totalAmount,
        id: id ?? this.state.itemElectricReading[foundIndex].id
      }

      const newItemElectricReading = [...this.state.itemElectricReading]
      newItemElectricReading[foundIndex] = updatedItem

      // Update state and recalculate total
      this.setState(
        {
          itemElectricReading: newItemElectricReading,
          visibleAction: false,
          uniqueId: '',
          previousDataRow: undefined
        },
        () => {
          this.sumTotalAmount(newItemElectricReading)
        }
      )

      this.formItemElectricReading.current?.resetFields()
    }
  }

  handleCancelRow = async (id) => {
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

  public render() {
    const {
      electricFormStore: { isLoading },
      sessionStore: { userAccountType }
    } = this.props

    const columns = columnsElectricReding(
      this.isEditing,
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: 150,
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
                onClick={() => this.handleCancelRow(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {isGrantedAny(appPermissions.ElectricForm.update) && (
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
              )}
            </div>
          )
        }
      },
      true
    )

    const columnsPrint = columnsElectricReding(this.isEditing)

    return (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
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
                    <FormInput name={['company', 'representative']} label={L('TRANSPORT_REPRESENTATIVE')} disabled />
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }}>
                    <FormInput name={['company', 'primaryAddress']} label={L('TRANSPORT_ADDRESS_CONTACT')} disabled />
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
                  <label className="title-detail">{L('METER_ELECTRIC_READING')}</label>
                  <div className="d-flex">
                    <label>{L('METER_TOTAL_AMOUNT')}: </label>
                    <label className="text-danger pl-2">
                      <strong>{formatNumber(this.state.totalAmount)}</strong>
                    </label>
                  </div>
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
                      bordered
                      dataSource={this.state.itemElectricReading}
                      columns={this.state.hiddenWhenPrint ? columnsPrint : columns}
                      components={{
                        body: {
                          cell: EditableCell
                        }
                      }}
                      rowKey={(record) => record?.id}
                      scroll={{ x: 1000, scrollToFirstRowOnChange: true }}
                    />
                  </Form>
                </Col>

                {!this.state.hiddenWhenPrint && (
                  <>
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
                        disabled
                      />
                    </Col>
                  </>
                )}
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
                {this.props.electricFormStore.confirmMeterDetail?.statusId !== ticketRequestStatusEnum.Draft && (
                  <label className="title-detail">{L('TRANS_APPROVAL')}</label>
                )}
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
