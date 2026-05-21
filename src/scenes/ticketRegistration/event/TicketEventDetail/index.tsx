import React from 'react'

import { Col, Form, Row, Card, Modal, Button, DatePicker } from 'antd'
import { L, LNotification } from '../../../../lib/abpUtility'
import { validateMessages } from '../../../../lib/validation'
import AppConsts, { dateTimeFormat, fileTypeGroup, timeDateFormat } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import FileStore from '../../../../stores/common/fileStore'

import withRouter from '@components/Layout/Router/withRouter'
import FileUploadWrapV2 from '@components/FileUploadV2'
import FormInput from '@components/FormItem/FormInput'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import { portalLayouts } from '@components/Layout/Router/router.config'
import SessionStore from '@stores/sessionStore'
import ApprovalOrRejectModal from './ApprovalOrRejectModal'
import dayjs from 'dayjs'
import FormSelect from '@components/FormItem/FormSelect'
import renovationService from '@services/ticketRequest/renovationService'
import rules from './validation'
import TicketEventStore from '@stores/ticketRequestStore/ticketEventStore'
import FormNumber from '@components/FormItem/FormNumber'
import FormTextArea from '@components/FormItem/FormTextArea'

const disabledDate = (current) => {
  return current < dayjs().subtract(1, 'day') ? true : false
}

const { typeAccount, ticketRequestTypeEnum, ticketRequestStatusEnum } = AppConsts

const { confirm } = Modal

const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IProps {
  navigate: any
  params: any
  ticketEventStore: TicketEventStore
  fileStore: FileStore
  sessionStore: SessionStore
}

@inject(Stores.TicketEventStore, Stores.FileStore, Stores.SessionStore)
@observer
class TicketEventDetail extends AppComponentBase<IProps> {
  state = {
    files: [] as any,
    idDocument: undefined,
    isShowModalApprocal: false,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    listZone: [] as any
  }
  formRef: any = React.createRef()
  formHistoryAppropval: any = React.createRef()

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    this.getListZone()
    await this.getDetail(this.props?.params?.id)
  }

  getDetail = async (id?) => {
    if (!id) {
      this.props.fileStore.currentFiles = []
      this.props.ticketEventStore.initData()
      this.formRef.current.setFieldsValue({
        ...this.props.ticketEventStore.editEventRequest
      })
    } else {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.ticketEventStore.get4Resident(id)
          if (this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.ticketEventStore.getListRequestHistory({
              id: this.props.ticketEventStore.editEventRequest?.id,
              requestTypeId: ticketRequestTypeEnum.EVENT_PLANNING
            })

            this.setState({
              allowApprovalOrReject: this.props.ticketEventStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })
            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.ticketEventStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
          break
        case typeAccount.Develop:
          await this.props.ticketEventStore.get4Resident(id)

          break

        default:
          await this.props.ticketEventStore.get4Staff(id)

          if (this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.ticketEventStore.getListRequestHistory({
              id: this.props.ticketEventStore.editEventRequest?.id,
              requestTypeId: ticketRequestTypeEnum.EVENT_PLANNING
            })

            this.setState({
              allowApprovalOrReject: this.props.ticketEventStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.ticketEventStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
      }
      this.formRef.current.setFieldsValue({
        ...this.props.ticketEventStore.editEventRequest
      })
    }

    this.setState({
      idDocument: this.props.ticketEventStore.editEventRequest?.uniqueId
    })
  }

  getListZone = async () => {
    const listZone = await renovationService.getListZone({ params: { isEvent: true } })

    this.setState({ listZone })
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

  onCloseModal = () => {
    this.setState({ isShowModalApprocal: false })
  }

  handleSendApproval = async () => {
    let id = this.props.ticketEventStore.editEventRequest?.id
    if (!id) {
      await this.onSave(false)
      id = this.props.ticketEventStore.editEventRequest?.id
      if (!id) return
    }
    const body = {
      id: id,
      requestTypeId: ticketRequestTypeEnum.EVENT_PLANNING,
      statusId: ticketRequestStatusEnum.Watting,
      description: ''
    }
    await this.props.ticketEventStore.sendApproval(body)
    this.props.navigate(portalLayouts.ticketRequestEvent.path)
  }

  handleApprovalOrReject = async (message: string, typeModalAproval: string) => {
    if (typeModalAproval === statusApproval.APPROVAL) {
      const body = {
        id: this.props.ticketEventStore.editEventRequest?.id,
        requestTypeId: ticketRequestTypeEnum.EVENT_PLANNING,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.ticketEventStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.ticketEventStore.editEventRequest?.id,
        requestTypeId: ticketRequestTypeEnum.EVENT_PLANNING,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.ticketEventStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.ticketRequestEvent.path)
  }

  onSave = async (isGotoList: boolean) => {
    const form = this.formRef.current
    return form.validateFields().then(async (values: any) => {
      if (this.props.ticketEventStore.editEventRequest?.id) {
        await this.props.ticketEventStore.update(
          {
            ...this.props.ticketEventStore.editEventRequest,
            ...values
          },
          this.state.files
        )
      } else {
        await this.props.ticketEventStore.create({ ...values }, this.state.files)
      }
      if (isGotoList) {
        this.props.navigate(portalLayouts.ticketRequestEvent.path)
      }
      return true
    })
  }

  onCancel = () => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        this.props.navigate(portalLayouts.ticketRequestEvent.path)
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
            // eslint-disable-next-line max-len
            !this.isStaff && this.props.ticketEventStore.editEventRequest?.statusId === ticketRequestStatusEnum.Draft && (
              <Button
                type="primary"
                className="mr-1"
                onClick={this.handleSendApproval}
                loading={isLoading}
                shape="round">
                {L('BTN_SEND_APPOVAL')}
              </Button>
            )
          }

          {
            // isGrantedAny(appPermissions.company.create, appPermissions.company.update)
            // eslint-disable-next-line max-len
            !this.isStaff && this.props.ticketEventStore.editEventRequest?.statusId === ticketRequestStatusEnum.Draft && (
              <Button
                type="primary"
                className="mr-1"
                onClick={() => this.onSave(true)}
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
      ticketEventStore: { isLoading },
      sessionStore: { userAccountType }
    } = this.props

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
                <label className="title-detail">{L('TICKET_EVENT_INFO')}</label>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="startDate" label={this.L('EVENT_START_DATE')} rules={rules.type}>
                  <DatePicker
                    disabledDate={disabledDate}
                    disabled={
                      this.isStaff ||
                      this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
                    }
                    onChange={() => this.formRef.current.setFieldValue('endDate', null)}
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="endDate" label={this.L('EVENT_END_DATE')} rules={rules.type}>
                  <DatePicker
                    disabled={
                      this.isStaff ||
                      this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
                    }
                    disabledDate={(current) => {
                      const startDate = this.formRef.current.getFieldValue('startDate')
                      return startDate && current.startOf('day').isBefore(startDate.startOf('day'))
                    }}
                    format={dateTimeFormat}
                    style={{ width: '100%' }}
                    placeholder={L('SELECT_DATE')}
                    showTime
                  />
                </Form.Item>
                {/* <FormDatePicker
                  dateTimeFormat={dateTimeFormat}
                  dateTimeProps={{ showTime: true }}
                  disabled={
                    this.isStaff ||
                    this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  disabledDate={(current) =>
                    this.formRef.current?.getFieldValue('startDate')
                      ? current < this.formRef.current?.getFieldValue('startDate')
                        ? true
                        : false
                      : disabledDate
                  }
                  name="endDate"
                  label={L('EVENT_END_DATE')}
                  rule={rules.type}
                /> */}
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber
                  disabled={
                    this.isStaff ||
                    this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  name="numberOfParticipate"
                  label={L('NUMBER_OF_PARTICIPATE')}
                  rule={rules.type}
                />
              </Col>

              <Col sm={{ span: 16, offset: 0 }}>
                <FormInput
                  disabled={
                    this.isStaff ||
                    this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  name="eventName"
                  label={L('TICKET_EVENT_NAME')}
                  rule={rules.companyName}
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormSelect
                  rule={rules.type}
                  disabled={
                    this.isStaff ||
                    this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  name="zoneIds"
                  label={L('RENOVATION_ZONE')}
                  options={this.state.listZone?.map((item) => ({
                    id: item?.id,
                    label: item?.zoneName
                  }))}
                  selectProps={{
                    mode: 'multiple'
                  }}
                />
              </Col>

              <Col sm={{ span: 24, offset: 0 }}>
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
                    this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft
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
                {this.props.ticketEventStore.editEventRequest?.statusId !== ticketRequestStatusEnum.Draft && (
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
                                  label={L('POSITION_APPROVAL')}
                                  name={[field.name, 'position', 'name']}
                                  disabled
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

export default withRouter(TicketEventDetail)
