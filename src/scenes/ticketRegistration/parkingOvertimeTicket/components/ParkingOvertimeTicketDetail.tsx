import React from 'react'

import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled } from '@ant-design/icons'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import FileUploadWrapV2 from '@components/FileUploadV2'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormInput from '@components/FormItem/FormInput'
import FormTextArea from '@components/FormItem/FormTextArea'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import SessionStore from '@stores/sessionStore'
import ParkingOvertimeTicketStore from '@stores/ticketRequestStore/parkingOvertimeTicketStore'
import { Button, Card, Col, Form, Modal, Row, Table } from 'antd'
import dayjs from 'dayjs'
import { inject, observer } from 'mobx-react'
import { v4 as uuid } from 'uuid'
import AppComponentBase from '../../../../components/AppComponentBase'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import { L, LNotification } from '../../../../lib/abpUtility'
import AppConsts, { appStatusColors, fileTypeGroup, timeDateFormat } from '../../../../lib/appconst'
import { validateMessages } from '../../../../lib/validation'
import FileStore from '../../../../stores/common/fileStore'
import Stores from '../../../../stores/storeIdentifier'
import ApprovalOrRejectModal from './ApprovalOrRejectModal'
import columnStaff from './columnStaff'
import rules from './validation'

const { align, typeAccount, ticketRequestTypeEnum, ticketRequestStatusEnum } = AppConsts

const { confirm } = Modal

const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IProps {
  navigate: any
  params: any
  parkingOvertimeTicketStore: ParkingOvertimeTicketStore
  fileStore: FileStore
  sessionStore: SessionStore
  feeTypeStore: FeeTypeStore
}

@inject(Stores.ParkingOvertimeTicketStore, Stores.FileStore, Stores.SessionStore, Stores.FeeTypeStore)
@observer
class ParkingOvertimeTicketDetail extends AppComponentBase<IProps> {
  state = {
    files: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    idDocument: undefined,
    staffs: [] as any,
    isShowModalApprocal: false,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    visibleAction: false,
    listFloor: [] as any
  }
  formRef: any = React.createRef()
  formStaff: any = React.createRef()
  formHistoryAppropval: any = React.createRef()

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    await this.getDetail(this.props?.params?.id)
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  getDetail = async (id?) => {
    if (!id) {
      this.props.fileStore.currentFiles = []

      this.props.parkingOvertimeTicketStore.initData()
      this.formRef.current.setFieldsValue({
        ...this.props.parkingOvertimeTicketStore.detailData
      })
    } else {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.parkingOvertimeTicketStore.get4Resident(id)

          if (this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.parkingOvertimeTicketStore.getListRequestHistory({
              id: this.props.parkingOvertimeTicketStore.detailData?.id,
              requestTypeId: ticketRequestTypeEnum.OVERTIME_PARKING
            })

            this.setState({
              allowApprovalOrReject: this.props.parkingOvertimeTicketStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.parkingOvertimeTicketStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
          break
        case typeAccount.Develop:
          await this.props.parkingOvertimeTicketStore.get4Resident(id)
          break

        default:
          await this.props.parkingOvertimeTicketStore.get4Staff(id)

          if (this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.parkingOvertimeTicketStore.getListRequestHistory({
              id: this.props.parkingOvertimeTicketStore.detailData?.id,
              requestTypeId: ticketRequestTypeEnum.OVERTIME_PARKING
            })

            this.setState({
              allowApprovalOrReject: this.props.parkingOvertimeTicketStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })
          }
          this.formHistoryAppropval.current.setFieldsValue({
            histories: [...this.props.parkingOvertimeTicketStore.listRequestHistory].map((item) => ({
              ...item,
              lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
            }))
          })
      }

      this.formRef.current.setFieldsValue({
        ...this.props.parkingOvertimeTicketStore.detailData
      })

      this.setState({
        idDocument: this.props.parkingOvertimeTicketStore.detailData?.uniqueId,
        staffs: this.props.parkingOvertimeTicketStore.detailData?.datas
      })
    }
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

  handleAddRow = () => {
    this.setState({ visibleAction: true })
    this.formStaff.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.state.staffs]

    newData.unshift(newRow)

    this.setState({ staffs: newData })
    this.setState({ uniqueId: newRow.id })
  }

  saveRow = async (id: any) => {
    const values = await this.formStaff.current.validateFields()
    const foundItem = this.state.staffs.find((item) => item.id === this.state.uniqueId)

    if (id === undefined) {
      const data = {
        ...values,
        fromDate: values?.fromDate ? dayjs(values?.fromDate).toJSON() : null,
        toDate: values?.toDate ? dayjs(values?.toDate).toJSON() : null
      }
      // Merge the found item with the object
      Object.assign(foundItem, data)
    } else {
      values.id = id
      const data = {
        ...values,
        fromDate: values?.fromDate ? dayjs(values?.fromDate).toJSON() : null,
        toDate: values?.toDate ? dayjs(values?.toDate).toJSON() : null
      }
      if (foundItem) {
        // Merge the found item with the object
        Object.assign(foundItem, data)
      }
    }

    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleCancleRow = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó

    if (this.state.previousDataRow === undefined) {
      const newStaff = this.state.staffs.filter((item) => item.id !== id)

      this.setState({ staffs: newStaff })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleDeleteRow = (id) => {
    const newStaffs = this.state.staffs.filter((item) => item.id !== id)
    this.setState({ staffs: newStaffs })
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
    if (typeModalAproval === statusApproval.APPROVAL) {
      const body = {
        id: this.props.parkingOvertimeTicketStore.detailData?.id,
        requestTypeId: ticketRequestTypeEnum.OVERTIME_PARKING,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.parkingOvertimeTicketStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.parkingOvertimeTicketStore.detailData?.id,
        requestTypeId: ticketRequestTypeEnum.OVERTIME_PARKING,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.parkingOvertimeTicketStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.ticketParkingOvertime.path)
  }

  onSave = async (isSendApproval) => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      let res
      if (this.props.parkingOvertimeTicketStore.detailData?.id) {
        // this.isGranted(appPermissions.company.update) &&
        res = await this.props.parkingOvertimeTicketStore.update(
          {
            ...this.props.parkingOvertimeTicketStore.detailData,
            ...values,
            datas: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      } else {
        // this.isGranted(appPermissions.company.update) &&
        res = await this.props.parkingOvertimeTicketStore.create(
          {
            ...values,
            datas: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      }
      if (isSendApproval) {
        const body = {
          id: res.id,
          requestTypeId: ticketRequestTypeEnum.OVERTIME_PARKING,
          statusId: ticketRequestStatusEnum.Watting,
          description: ''
        }

        await this.props.parkingOvertimeTicketStore.sendApproval(body)
      }
      this.props.navigate(portalLayouts.ticketParkingOvertime.path)
    })
  }

  onCancel = () => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        this.props.navigate(portalLayouts.ticketParkingOvertime.path)
      }
    })
    return
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

          {
            // isGrantedAny(appPermissions.company.create, appPermissions.company.update)
            !this.isStaff &&
              this.props.parkingOvertimeTicketStore.detailData?.statusId === ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={this.state.uniqueId !== '' || this.state.staffs.length < 1}
                  type="primary"
                  className="mr-1"
                  onClick={() => this.onSave(true)}
                  loading={isLoading}
                  shape="round">
                  {L('BTN_SEND_APPOVAL')}
                </Button>
              )
          }

          {
            // isGrantedAny(appPermissions.company.create, appPermissions.company.update)
            !this.isStaff &&
              this.props.parkingOvertimeTicketStore.detailData?.statusId === ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={this.state.uniqueId !== '' || this.state.staffs.length < 1}
                  type="primary"
                  className="mr-1"
                  onClick={() => this.onSave(false)}
                  loading={isLoading}
                  shape="round">
                  {L('BTN_SAVE')}
                </Button>
              )
          }

          <Button onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
        </Col>
      </Row>
    )
  }

  render() {
    const {
      parkingOvertimeTicketStore: { isLoading },
      sessionStore: { userAccountType }
    } = this.props

    const columns = columnStaff(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: '10%',
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
                disabled={
                  this.isStaff ||
                  this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formStaff.current.setFieldsValue({
                    ...row,
                    startTime: row?.startTime ? dayjs(row?.startTime) : null,
                    endTime: row?.endTime ? dayjs(row?.endTime) : null
                  })
                  this.setState({ uniqueId: row?.id, visibleAction: true, previousDataRow: { ...row } })
                }}
              />
              {/* )} */}

              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => this.handleDeleteRow(row.id)}
              />
              {/* )} */}
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
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[8, 6]}>
              {/* company Component */}
              {userAccountType !== typeAccount.Resident && userAccountType !== typeAccount.Develop && (
                <>
                  <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }}>
                    <label className="title-detail">{L('COMPANY_INFO')}</label>
                  </Col>
                  <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'companyName']} label={L('TRANSPORT_COMPANY_NAME')} disabled />
                  </Col>
                  {/* <Col sm={{ span: 8, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'companyCode']} label={L('TRANSPORT_TAX_CODE')} disabled />
                  </Col>
                  <Col sm={{ span: 8, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'representative']} label={L('TRANSPORT_REPRESENTATIVE')} disabled />
                  </Col>

                  <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'primaryAddress']} label={L('TRANSPORT_ADDRESS_CONTACT')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'contactName']} label={L('TRANSPORT_USER_CONTACT')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'position']} label={L('TRANSPORT_POSITION')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'contactPhone']} label={L('TRANSPORT_PHONE')} disabled />
                  </Col>
                  <Col sm={{ span: 6, offset: 0 }} xs={{ span: 24 }}>
                    <FormInput name={['company', 'contactEmail']} label={L('TRANSPORT_EMAIL')} disabled />
                  </Col> */}
                </>
              )}
              {/* Staff list Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2">
                  <label className="title-detail">{L('OVERTIME_PARKING_INFO_STAFFS')}</label>
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <Form ref={this.formStaff} layout={'vertical'} size="middle" validateMessages={validateMessages}>
                    <Table
                      pagination={false}
                      size="small"
                      components={{
                        body: {
                          cell: EditableCell
                        }
                      }}
                      bordered
                      dataSource={this.state.staffs}
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
                  <Button
                    type="primary"
                    className="w-100"
                    onClick={this.handleAddRow}
                    disabled={
                      this.isStaff ||
                      this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft ||
                      this.state.visibleAction
                    }>
                    {L('ADD_NEW_ROW')}
                  </Button>
                </Col>
              </>
              <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2">
                <label className="title-detail">{L('TRANS_DOCUMENT')}</label>
              </Col>
              <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }}>
                <FileUploadWrapV2
                  multiple
                  parentId={this.state.idDocument}
                  fileStore={this.props.fileStore}
                  onRemoveFile={this.onRemoveFile}
                  beforeUploadFile={this.beforeUploadFile}
                  acceptedFileTypes={fileTypeGroup.documentAndImage}
                  totalSize={50}
                  maxSize={25}
                  disabled={
                    this.isStaff ||
                    this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
            </Row>
          </Form>
          <Form
            ref={this.formHistoryAppropval}
            layout={'vertical'}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[6, 6]}>
              <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2">
                {this.props.parkingOvertimeTicketStore.detailData?.statusId !== ticketRequestStatusEnum.Draft && (
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
                              <Col sm={{ span: 4, offset: 0 }} xs={{ span: 24 }}>
                                <label className="text-level-approval">
                                  {L('LEVER_APPROVAL')} {index + 1}
                                </label>
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }} xs={{ span: 24 }}>
                                <FormInput
                                  label={L('POSITION_APPROVAL')}
                                  name={[field.name, 'position', 'name']}
                                  disabled
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }} xs={{ span: 24 }}>
                                <FormInput
                                  disabled
                                  rule={rules.address}
                                  label={L('USER_APPROVAL')}
                                  name={[field.name, 'approvedUser', 'displayName']}
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }} xs={{ span: 24 }}>
                                <FormInput
                                  rule={rules.address}
                                  disabled
                                  label={L('STATUS_APPROVAL')}
                                  name={[field.name, 'status', 'name']}
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }} xs={{ span: 24 }}>
                                <FormDatePicker
                                  dateTimeFormat={timeDateFormat}
                                  disabled
                                  label={L('DATE_APPROVAL')}
                                  name={[field.name, 'lastModificationTime']}
                                />
                              </Col>

                              <Col sm={{ span: 4, offset: 0 }} xs={{ span: 24 }}>
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

export default withRouter(ParkingOvertimeTicketDetail)
