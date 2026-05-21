import React from 'react'

import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditFilled } from '@ant-design/icons'
import { EditableCell } from '@components/DataTableV2/EditableCell'
import FileUploadWrapV2 from '@components/FileUploadV2'
import FormDatePicker from '@components/FormItem/FormDatePicker'
import FormInput from '@components/FormItem/FormInput'
import FormRadioButton from '@components/FormItem/FormRadioButton'
import FormTextArea from '@components/FormItem/FormTextArea'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import SessionStore from '@stores/sessionStore'
import TicketRequestStore from '@stores/ticketRequestStore/ticketRequestStore'
import { Button, Card, Col, DatePicker, Form, Modal, Row, Table } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
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
import columnAsset from './columnAsset'
import rules from './validation'
import isBetween from 'dayjs/plugin/isBetween'
import type { RangeValue } from 'rc-picker/lib/interface'
dayjs.extend(isBetween)

const { RangePicker } = DatePicker
const allowedTimeRanges = [
  { start: '08:00', end: '11:00' },
  { start: '13:30', end: '16:00' },
  { start: '18:00', end: '23:59' }
]
const { listEnumFormInOut, align, typeAccount, ticketRequestTypeEnum, ticketRequestStatusEnum, formInOutType } =
  AppConsts

const { confirm } = Modal

const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IProps {
  navigate: any
  params: any
  ticketRequestStore: TicketRequestStore
  fileStore: FileStore
  sessionStore: SessionStore
}

@inject(Stores.TicketRequestStore, Stores.FileStore, Stores.SessionStore)
@observer
class TransportDetail extends AppComponentBase<IProps> {
  state = {
    startTime: null as Dayjs | null,
    files: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    idDocument: undefined,
    assets: [] as any,
    isShowModalApprocal: false,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    visibleAction: false,
    isTranspostIn: formInOutType?.In
  }
  formRef: any = React.createRef()
  formAsset: any = React.createRef()
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
      this.setState({
        isTranspostIn:
          window.location.pathname === '/ticket-transport-in-create' ? formInOutType?.In : formInOutType?.Out
      })

      this.props.fileStore.currentFiles = []

      this.props.ticketRequestStore.initData(
        window.location.pathname === '/ticket-transport-in-create' ? formInOutType?.In : formInOutType.Out
      )

      this.formRef.current.setFieldsValue({
        ...this.props.ticketRequestStore.editTicketRequest
      })
    } else {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.ticketRequestStore.get4Resident(id)

          if (this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.ticketRequestStore.getListRequestHistory({
              id: this.props.ticketRequestStore.editTicketRequest?.id,
              requestTypeId: ticketRequestTypeEnum.IN_OUT
            })

            this.setState({
              allowApprovalOrReject: this.props.ticketRequestStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.ticketRequestStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }

          break
        case typeAccount.Develop:
          break

        default:
          await this.props.ticketRequestStore.get4Staff(id)

          if (this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.ticketRequestStore.getListRequestHistory({
              id: this.props.ticketRequestStore.editTicketRequest?.id,
              requestTypeId: ticketRequestTypeEnum.IN_OUT
            })

            this.setState({
              allowApprovalOrReject: this.props.ticketRequestStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.ticketRequestStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
      }

      this.formRef.current.setFieldsValue({
        ...this.props.ticketRequestStore.editTicketRequest,
        timeRange: [
          this.props.ticketRequestStore.editTicketRequest?.startDate ?? null,
          this.props.ticketRequestStore.editTicketRequest?.endDate ?? null
        ]
      })

      this.setState({
        isTranspostIn: this.props.ticketRequestStore.editTicketRequest?.typeId,
        idDocument: this.props.ticketRequestStore.editTicketRequest?.uniqueId,
        assets: this.props.ticketRequestStore.editTicketRequest?.assets
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
    this.formAsset.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.state.assets]

    newData.unshift(newRow)

    this.setState({ assets: newData })
    this.setState({ uniqueId: newRow.id })
  }

  saveRow = async (id: any) => {
    const values = await this.formAsset.current.validateFields()
    const foundItem = this.state.assets.find((item) => item.id === this.state.uniqueId)
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
      const newAssets = this.state.assets.filter((item) => item.id !== id)
      this.setState({ assets: newAssets })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleDeleteRow = (id) => {
    const newAssets = this.state.assets.filter((item) => item.id !== id)
    this.setState({ assets: newAssets })
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

  buildDisabledTimes = (ranges: { start: string; end: string }[], minTime?: Dayjs) => {
    const allHours = Array.from({ length: 24 }, (_, i) => i)
    const allowedHours = new Set<number>()
    const allowedMinutesByHour: Record<number, Set<number>> = {}

    ranges.forEach((r) => {
      const [sh, sm] = r.start.split(':').map(Number)
      const [eh, em] = r.end.split(':').map(Number)
      for (let h = sh; h <= eh; h++) {
        allowedHours.add(h)
        const minM = h === sh ? sm : 0
        const maxM = h === eh ? em : 59
        allowedMinutesByHour[h] = new Set(Array.from({ length: maxM - minM + 1 }, (_, i) => minM + i))
      }
    })

    return {
      disabledHours: () => allHours.filter((h) => !allowedHours.has(h)),
      disabledMinutes: (hour: number) => {
        let mins = allowedMinutesByHour[hour] ? [...allowedMinutesByHour[hour]] : []
        if (minTime && hour === minTime.hour()) {
          mins = mins.filter((m) => m >= minTime.minute())
        }
        return Array.from({ length: 60 }, (_, i) => i).filter((m) => !mins.includes(m))
      }
    }
  }

  getDisabledTime = (_: Dayjs | null, type: 'start' | 'end') => {
    if (type === 'start') {
      return this.buildDisabledTimes(allowedTimeRanges)
    }

    if (type === 'end' && this.state.startTime) {
      const startTime = this.state.startTime // bây giờ TS hiểu là Dayjs
      const slot = allowedTimeRanges.find((r) => {
        const slotStart = dayjs(startTime)
          .hour(+r.start.split(':')[0])
          .minute(+r.start.split(':')[1])
        const slotEnd = dayjs(startTime)
          .hour(+r.end.split(':')[0])
          .minute(+r.end.split(':')[1])
        return startTime.isBetween(slotStart, slotEnd, 'minute', '[]')
      })
      if (slot) {
        return this.buildDisabledTimes([slot], startTime)
      }
    }

    return {}
  }

  disabledDate = (current: Dayjs) => {
    if (!this.state.startTime) return false
    return !current.isSame(this.state.startTime, 'day')
  }

  handleCalendarChange = (values: RangeValue<Dayjs>) => {
    this.setState({ startTime: values?.[0] || null })
  }

  handleApprovalOrReject = async (message: string, typeModalAproval: string) => {
    if (typeModalAproval === statusApproval.APPROVAL) {
      const body = {
        id: this.props.ticketRequestStore.editTicketRequest?.id,
        requestTypeId: ticketRequestTypeEnum.IN_OUT,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.ticketRequestStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.ticketRequestStore.editTicketRequest?.id,
        requestTypeId: ticketRequestTypeEnum.IN_OUT,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.ticketRequestStore.sendApproval(body)
    }

    this.state.isTranspostIn === formInOutType?.In
      ? this.props.navigate(portalLayouts.ticketRequestTransportIn.path)
      : this.props.navigate(portalLayouts.ticketRequestTransportOut.path)
  }

  onSave = async (isSendApproval) => {
    const form = this.formRef.current

    await form.validateFields().then(async (values: any) => {
      if (this.props.ticketRequestStore.editTicketRequest?.id) {
        // this.isGranted(appPermissions.company.update) &&
        await this.props.ticketRequestStore.update(
          {
            ...this.props.ticketRequestStore.editTicketRequest,
            ...values,
            assets: this.state.assets.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      } else {
        // this.isGranted(appPermissions.company.update) &&
        const body = {
          ...values,
          assets: this.state.assets.map((item) => ({
            ...item,
            id: typeof item.id !== 'number' ? 0 : item.id
          })),
          startDate: values.timeRange ? values.timeRange[0] : null,
          endDate: values.timeRange ? values.timeRange[1] : null
        }
        delete body?.timeRange
        await this.props.ticketRequestStore.create(body, this.state.files)
      }

      if (isSendApproval) {
        const body = {
          id: this.props.ticketRequestStore.editTicketRequest?.id,
          requestTypeId: ticketRequestTypeEnum.IN_OUT,
          statusId: ticketRequestStatusEnum.Watting,
          description: ''
        }

        await this.props.ticketRequestStore.sendApproval(body)
      }
    })

    this.state.isTranspostIn === formInOutType?.In
      ? this.props.navigate(portalLayouts.ticketRequestTransportIn.path)
      : this.props.navigate(portalLayouts.ticketRequestTransportOut.path)
  }

  onCancel = () => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        this.state.isTranspostIn === formInOutType?.In
          ? this.props.navigate(portalLayouts.ticketRequestTransportIn.path)
          : this.props.navigate(portalLayouts.ticketRequestTransportOut.path)
      }
    })
    return
  }

  renderActions = (isLoading?) => {
    return (
      <Row>
        <Col sm={{ span: 24, offset: 0 }}>
          {this.state.allowApprovalOrReject &&
            this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft && (
              <Button
                className="button-approval mr-1"
                onClick={() => this.openModalApprovalOrReject(statusApproval.APPROVAL)}
                loading={isLoading}
                shape="round">
                {L('BTN_APPROVAL')}
              </Button>
            )}
          {this.state.allowApprovalOrReject &&
            this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft && (
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
              this.props.ticketRequestStore.editTicketRequest?.statusId === ticketRequestStatusEnum.Draft && (
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
              this.props.ticketRequestStore.editTicketRequest?.statusId === ticketRequestStatusEnum.Draft && (
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
      ticketRequestStore: { isLoading },
      sessionStore: { userAccountType }
    } = this.props

    const columns = columnAsset(
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
                  this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formAsset.current.setFieldsValue({
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
                  this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft
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
            <Row gutter={[6, 6]}>
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

              {/* Time Component */}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('TRANS_TYPE_AND_TIME')}</label>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormRadioButton
                  disabled
                  name="typeId"
                  label={L('TRANSPORT_TYPE')}
                  rule={rules.type}
                  options={listEnumFormInOut.map((item) => ({ value: item.value, label: L(item.label) }))}
                />
              </Col>

              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item
                  name="timeRange"
                  label={`${L('START_DATE')} - ${L('END_DATE')}`}
                  rules={[
                    {
                      required: true
                    },
                    {
                      validator: (_, value) => {
                        if (!value || !value[0] || !value[1]) {
                          return Promise.reject(new Error(L('PLEASE_SELECT_BOTH_START_AND_END')))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}>
                  <RangePicker
                    showTime
                    inputReadOnly
                    onOpenChange={(open) => {
                      if (open && !this.state.startTime) {
                        this.formRef.current?.setFieldsValue({
                          timeRange: [
                            dayjs()
                              .hour(Number(allowedTimeRanges[0].start.split(':')[0]))
                              .minute(Number(allowedTimeRanges[0].start.split(':')[1])),
                            null
                          ]
                        })
                      }
                    }}
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={this.disabledDate}
                    disabledTime={this.getDisabledTime}
                    onCalendarChange={this.handleCalendarChange}
                  />
                </Form.Item>
              </Col>
              {/* <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item name="startDate" label={this.L('START_DATE')} rules={rules.type}>
                  <DatePicker
                    showTime
                    disabledTime={this.getDisabledTime}
                    name="startDate"
                    format={dateTimeFormat}
                    onChange={() => this.formRef.current.setFieldValue('endDate', null)}
                    className="w-100"
                    disabled={
                      this.isStaff ||
                      this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft
                    }
                  />
                </Form.Item>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <Form.Item name="endDate" label={this.L('END_DATE')} rules={rules.type}>
                  <DatePicker
                    showTime
                    disabledDate={(current) => {
                      const startDate = this.formRef.current.getFieldValue('startDate')
                      return startDate && current.startOf('day').isBefore(startDate.startOf('day'))
                    }}
                    disabledTime={this.getDisabledTime}
                    name="endDate"
                    format={dateTimeFormat}
                    className="w-100"
                    disabled={
                      this.isStaff ||
                      this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft
                    }
                  />
                </Form.Item>
              </Col> */}

              {/* Asset Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('TRANS_INFO_ASSET')}</label>
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <Form ref={this.formAsset} layout={'vertical'} size="middle" validateMessages={validateMessages}>
                    <Table
                      pagination={false}
                      size="small"
                      components={{
                        body: {
                          cell: EditableCell
                        }
                      }}
                      bordered
                      dataSource={this.state.assets}
                      columns={columns}
                      rowKey={(record) => record.uniqueId}
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
                      this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft ||
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
                    this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft
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
                {this.props.ticketRequestStore.editTicketRequest?.statusId !== ticketRequestStatusEnum.Draft && (
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

export default withRouter(TransportDetail)
