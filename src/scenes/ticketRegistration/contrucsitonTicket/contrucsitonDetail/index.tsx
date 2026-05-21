import React from 'react'

import { Col, Form, Row, Card, Modal, Button, Table, DatePicker } from 'antd'
import { L, LNotification } from '../../../../lib/abpUtility'
import { validateMessages } from '../../../../lib/validation'
import AppConsts, { appStatusColors, dateTimeFormat, fileTypeGroup, timeDateFormat } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import FileStore from '../../../../stores/common/fileStore'
import rules from './validation'
import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import FormInput from '@components/FormItem/FormInput'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled } from '@ant-design/icons'
import { v4 as uuid } from 'uuid'
import { portalLayouts } from '@components/Layout/Router/router.config'
import SessionStore from '@stores/sessionStore'
import ApprovalOrRejectModal from './ApprovalOrRejectModal'
import dayjs from 'dayjs'
import columnStaff from './columnStaff'
import FormSelect from '@components/FormItem/FormSelect'
import ConstructionTicketStore from '@stores/ticketRequestStore/constructionTicketStore'
import FormTextArea from '@components/FormItem/FormTextArea'
import unitService from '@services/project/unitService'
import { filterOptions } from '@lib/helper'

const disabledDate = (current) => {
  return current < dayjs().subtract(1, 'day') ? true : false
}

const { align, typeAccount, ticketRequestTypeEnum, ticketRequestStatusEnum } = AppConsts

const { confirm } = Modal

const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IProps {
  navigate: any
  params: any
  constructionTicketStore: ConstructionTicketStore
  fileStore: FileStore
  sessionStore: SessionStore
}

@inject(Stores.ConstructionTicketStore, Stores.FileStore, Stores.SessionStore)
@observer
class ContructionDetail extends AppComponentBase<IProps> {
  state = {
    files: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    idDocument: undefined,
    staffs: [] as any,
    isShowModalApprocal: false,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    listUnit: [] as any,
    visibleAction: false
  }
  formRef: any = React.createRef()
  formStaff: any = React.createRef()
  formElectricItem: any = React.createRef()
  formHistoryAppropval: any = React.createRef()

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    this.getListUnit()

    await this.getDetail(this.props?.params?.id)
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  getDetail = async (id?) => {
    if (!id) {
      this.props.fileStore.currentFiles = []

      this.props.constructionTicketStore.initData()
      this.formRef.current.setFieldsValue({
        ...this.props.constructionTicketStore.editConstructionRequest
      })
    } else {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.constructionTicketStore.get4Resident(id)

          if (this.props.constructionTicketStore.editConstructionRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.constructionTicketStore.getListRequestHistory({
              id: this.props.constructionTicketStore.editConstructionRequest?.id,
              requestTypeId: ticketRequestTypeEnum.CONTRUCTION_LIST
            })

            this.setState({
              allowApprovalOrReject: this.props.constructionTicketStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.constructionTicketStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
          break
        case typeAccount.Develop:
          await this.props.constructionTicketStore.get4Resident(id)
          break

        default:
          await this.props.constructionTicketStore.get4Staff(id)

          if (this.props.constructionTicketStore.editConstructionRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.constructionTicketStore.getListRequestHistory({
              id: this.props.constructionTicketStore.editConstructionRequest?.id,
              requestTypeId: ticketRequestTypeEnum.CONTRUCTION_LIST
            })

            this.setState({
              allowApprovalOrReject: this.props.constructionTicketStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.constructionTicketStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
      }

      this.formRef.current.setFieldsValue({
        ...this.props.constructionTicketStore.editConstructionRequest
      })

      this.setState({
        idDocument: this.props.constructionTicketStore.editConstructionRequest?.uniqueId,
        staffs: this.props.constructionTicketStore.editConstructionRequest?.staffs
      })
    }
  }

  getListUnit = async () => {
    const listUnit = await unitService.getListUnit()

    this.setState({ listUnit })
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
      if (foundItem) {
        // Merge the found item with the object
        Object.assign(foundItem, values)
      }
    } else {
      values.id = id

      if (foundItem) {
        // Merge the found item with the object
        Object.assign(foundItem, values)
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
    const newStaff = this.state.staffs.filter((item) => item.id !== id)
    this.setState({ staffs: newStaff })
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
        id: this.props.constructionTicketStore.editConstructionRequest?.id,
        requestTypeId: ticketRequestTypeEnum.CONTRUCTION_LIST,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.constructionTicketStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.constructionTicketStore.editConstructionRequest?.id,
        requestTypeId: ticketRequestTypeEnum.CONTRUCTION_LIST,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.constructionTicketStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.ticketRequestConstruction.path)
  }

  onSave = async (isSendApproval) => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.constructionTicketStore.editConstructionRequest?.id) {
        // this.isGranted(appPermissions.company.update) &&

        await this.props.constructionTicketStore.update(
          {
            ...this.props.constructionTicketStore.editConstructionRequest,
            ...values,
            staffs: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      } else {
        // this.isGranted(appPermissions.company.update) &&

        await this.props.constructionTicketStore.create(
          {
            ...values,
            staffs: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id,
              type: typeof item.id
            }))
          },
          this.state.files.map((item) => ({
            ...item,
            id: typeof item.id !== 'number' ? 0 : item.id
          }))
        )
      }

      if (isSendApproval) {
        const body = {
          id: this.props.constructionTicketStore.editConstructionRequest?.id,
          requestTypeId: ticketRequestTypeEnum.CONTRUCTION_LIST,
          statusId: ticketRequestStatusEnum.Watting,
          description: ''
        }

        await this.props.constructionTicketStore.sendApproval(body)
      }

      this.props.navigate(portalLayouts.ticketRequestConstruction.path)
    })
  }

  onCancel = () => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        this.props.navigate(portalLayouts.ticketRequestConstruction.path)
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
              this.props.constructionTicketStore.editConstructionRequest?.statusId ===
                ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={this.state.uniqueId !== ''}
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
              this.props.constructionTicketStore.editConstructionRequest?.statusId ===
                ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={this.state.uniqueId !== ''}
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
      constructionTicketStore: { isLoading },
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
                  this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                    ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formStaff.current.setFieldsValue({
                    ...row
                  })
                  this.setState({ uniqueId: row?.id, visibleAction: true, previousDataRow: { ...row } })
                }}
              />
              {/* )} */}

              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                    ticketRequestStatusEnum.Draft ||
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
            onAbort={this.onCancel}
            onValuesChange={() => this.setState({ isDirty: true })}
            validateMessages={validateMessages}
            size="middle">
            <Row gutter={[8, 6]}>
              {/* company Component */}
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

              {/* Supervisor info Component */}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('CONSTRUCTION_ZONE_INFO')}</label>
              </Col>

              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <FormSelect
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
                  }
                  rule={rules.type}
                  name="unitIds"
                  label={L('RENOVATION_UNIT')}
                  options={this.state.listUnit?.map((item) => ({
                    id: item?.id,
                    label: item?.fullUnitCode
                  }))}
                  selectProps={{
                    mode: 'multiple',
                    filterOption: filterOptions
                  }}
                />
              </Col>

              {/* Time construction */}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('TIME_CONTRUCTION')}</label>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="startDate" label={this.L('TIME_START_DATE')} rules={rules.type}>
                  <DatePicker
                    showTime
                    disabled={
                      this.isStaff ||
                      this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                        ticketRequestStatusEnum.Draft
                    }
                    format={dateTimeFormat}
                    disabledDate={disabledDate}
                    onChange={() => this.formRef.current.setFieldValue('endDate', null)}
                    name="startDate"
                    className="w-100"
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="endDate" label={this.L('TIME_END_DATE')} rules={rules.type}>
                  <DatePicker
                    showTime
                    disabled={
                      this.isStaff ||
                      this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                        ticketRequestStatusEnum.Draft
                    }
                    format={dateTimeFormat}
                    disabledDate={(current) => {
                      const startDate = this.formRef.current.getFieldValue('startDate')
                      return startDate && current.startOf('day').isBefore(startDate.startOf('day'))
                    }}
                    name="endDate"
                    className="w-100"
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormInput
                  rule={rules.representative}
                  label={L('CONSTRUCTION_ITEM_IMPLEMENT')}
                  name="items"
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
                  }
                />
              </Col>

              {/* Contractor Info*/}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('CONTRACTOR_COMPANY_INFO')}</label>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormInput
                  rule={rules.representative}
                  label={L('CONTRACTOR_COMPANY_NAME')}
                  name="contractorName"
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
                  }
                />
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
                  }
                  rule={rules.representative}
                  label={L('CONTRACTOR_COMPANY_SUPERVISOR')}
                  name="contractorSupervisor"
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  rule={rules.emailAddress}
                  label={L('CONTRACTOR_COMPANY_EMAIL')}
                  name="contractorEmail"
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
                  }
                />
              </Col>

              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  rule={rules.phoneNumber}
                  label={L('CONTRACTOR_COMPANY_PHONE')}
                  name="contractorPhone"
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
                  }
                />
              </Col>

              {/* staff list Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('CONSTRUCTION_INFO_STAFF')}</label>
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
                      this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                        ticketRequestStatusEnum.Draft ||
                      this.state.visibleAction
                    }>
                    {L('ADD_NEW_ROW')}
                  </Button>
                </Col>
              </>

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
                  disabled={
                    this.isStaff ||
                    this.props.constructionTicketStore.editConstructionRequest?.statusId !==
                      ticketRequestStatusEnum.Draft
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
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                {this.props.constructionTicketStore.editConstructionRequest?.statusId !==
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
                                  rule={rules.address}
                                  label={L('USER_APPROVAL')}
                                  name={[field.name, 'approvedUser', 'displayName']}
                                />
                              </Col>
                              <Col sm={{ span: 4, offset: 0 }}>
                                <FormInput
                                  rule={rules.address}
                                  disabled
                                  label={L('STATUS_APPROVAL')}
                                  name={[field.name, 'status', 'name']}
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

export default withRouter(ContructionDetail)
