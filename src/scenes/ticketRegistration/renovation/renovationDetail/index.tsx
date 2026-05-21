import React from 'react'

import { Col, Form, Row, Card, Modal, Button, Table, Radio } from 'antd'
import { L, LNotification } from '../../../../lib/abpUtility'
import { validateMessages } from '../../../../lib/validation'
import AppConsts, { appStatusColors, fileTypeGroup, timeDateFormat } from '../../../../lib/appconst'
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
import RenovationStore from '@stores/ticketRequestStore/renovationStore'
import FormSelect from '@components/FormItem/FormSelect'
import columnItemElectric from './columnItemElectric'
import FormTextArea from '@components/FormItem/FormTextArea'
import unitService from '@services/project/unitService'
import FormNumber from '@components/FormItem/FormNumber'
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
  renovationStore: RenovationStore
  fileStore: FileStore
  sessionStore: SessionStore
}

@inject(Stores.RenovationStore, Stores.FileStore, Stores.SessionStore)
@observer
class RenovationDetail extends AppComponentBase<IProps> {
  state = {
    files: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    uniqueIdItemElectric: '',
    previousDataRowElectric: undefined,
    idDocument: undefined,
    staffs: [] as any,
    electricItems: [] as any,
    isShowModalApprocal: false,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    listUnit: [] as any,
    visibleAction: false,
    visibleActionElectric: false
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

  isEditingElectric = (record: any) => record.id === this.state.uniqueIdItemElectric

  getDetail = async (id?) => {
    if (!id) {
      this.props.fileStore.currentFiles = []

      this.props.renovationStore.initData()
      this.formRef.current.setFieldsValue({
        ...this.props.renovationStore.editRenovationRequest
      })
    } else {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.renovationStore.get4Resident(id)

          if (this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.renovationStore.getListRequestHistory({
              id: this.props.renovationStore.editRenovationRequest?.id,
              requestTypeId: ticketRequestTypeEnum.RENOVATION
            })
            this.setState({
              allowApprovalOrReject: this.props.renovationStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })
            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.renovationStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }

          break
        case typeAccount.Develop:
          await this.props.renovationStore.get4Resident(id)
          break

        default:
          await this.props.renovationStore.get4Staff(id)
          if (this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.renovationStore.getListRequestHistory({
              id: this.props.renovationStore.editRenovationRequest?.id,
              requestTypeId: ticketRequestTypeEnum.RENOVATION
            })
            this.setState({
              allowApprovalOrReject: this.props.renovationStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })
            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.renovationStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
      }

      this.formRef.current.setFieldsValue({
        ...this.props.renovationStore.editRenovationRequest
      })

      this.setState({
        idDocument: this.props.renovationStore.editRenovationRequest?.uniqueId,
        staffs: this.props.renovationStore.editRenovationRequest?.staffs,
        electricItems: this.props.renovationStore.editRenovationRequest?.electricals
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

  handleAddRowElectric = () => {
    this.setState({ visibleActionElectric: true })
    this.formElectricItem.current.resetFields()
    const newRow = { id: uuid() }

    const newData = [...this.state.electricItems]

    newData.unshift(newRow)

    this.setState({ electricItems: newData })
    this.setState({ uniqueIdItemElectric: newRow.id })
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

  saveRowElectric = async (id: any) => {
    const values = await this.formElectricItem.current.validateFields()
    const foundItem = this.state.electricItems.find((item) => item.id === this.state.uniqueIdItemElectric)
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

    this.setState({ visibleActionElectric: false })
    this.setState({ uniqueIdItemElectric: '' })
    this.setState({ previousDataRowElectric: undefined })
  }

  handleCancleRow = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó
    if (this.state.previousDataRow === undefined) {
      const newStaffs = this.state.staffs.filter((item) => item.id !== id)
      this.setState({ staffs: newStaffs })
    }
    this.setState({ visibleAction: false })
    this.setState({ uniqueId: '' })
    this.setState({ previousDataRow: undefined })
  }

  handleCancleRowElectric = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó
    if (this.state.previousDataRowElectric === undefined) {
      const newElectrics = this.state.electricItems.filter((item) => item.id !== id)
      this.setState({ electricItems: newElectrics })
    }
    this.setState({ visibleActionElectric: false })
    this.setState({ uniqueIdItemElectric: '' })
    this.setState({ previousDataRowElectric: undefined })
  }

  handleDeleteRow = (id) => {
    const newStaffs = this.state.staffs.filter((item) => item.id !== id)
    this.setState({ staffs: newStaffs })
  }

  handleDeleteRowElectric = (id) => {
    const newElectric = this.state.electricItems.filter((item) => item.id !== id)
    this.setState({ electricItems: newElectric })
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
        id: this.props.renovationStore.editRenovationRequest?.id,
        requestTypeId: ticketRequestTypeEnum.RENOVATION,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.renovationStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.renovationStore.editRenovationRequest?.id,
        requestTypeId: ticketRequestTypeEnum.RENOVATION,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.renovationStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.ticketRequestRenovation.path)
  }

  onSave = (isSendApproval) => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.renovationStore.editRenovationRequest?.id) {
        // this.isGranted(appPermissions.company.update) &&
        await this.props.renovationStore.update(
          {
            ...this.props.renovationStore.editRenovationRequest,
            ...values,
            staffs: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            })),
            electricals: this.state.electricItems.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      } else {
        // this.isGranted(appPermissions.company.update) &&
        await this.props.renovationStore.create(
          {
            ...values,
            staffs: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            })),
            electricals: this.state.electricItems.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      }

      if (isSendApproval) {
        const body = {
          id: this.props.renovationStore.editRenovationRequest?.id,
          requestTypeId: ticketRequestTypeEnum.RENOVATION,
          statusId: ticketRequestStatusEnum.Watting,
          description: ''
        }

        await this.props.renovationStore.sendApproval(body)
      }

      this.props.navigate(portalLayouts.ticketRequestRenovation.path)
    })
  }

  onCancel = () => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        this.props.navigate(portalLayouts.ticketRequestRenovation.path)
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
              this.props.renovationStore.editRenovationRequest?.statusId === ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={this.state.uniqueId !== '' || this.state.uniqueIdItemElectric !== ''}
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
              this.props.renovationStore.editRenovationRequest?.statusId === ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={this.state.uniqueId !== '' || this.state.uniqueIdItemElectric !== ''}
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
      renovationStore: { isLoading },
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
                  this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft ||
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
                  this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft ||
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

    const columsItemElectric = columnItemElectric(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: '10%',
        render: (action, row) => {
          return this.state.uniqueIdItemElectric === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRowElectric(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancleRowElectric(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleActionElectric && this.state.uniqueIdItemElectric !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formElectricItem.current.setFieldsValue({
                    ...row
                  })
                  this.setState({
                    uniqueIdItemElectric: row?.id,
                    visibleActionElectric: true,
                    previousDataRowElectric: { ...row }
                  })
                }}
              />
              {/* )} */}

              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleActionElectric && this.state.uniqueIdItemElectric !== row.id)
                }
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => this.handleDeleteRowElectric(row.id)}
              />
              {/* )} */}
            </div>
          )
        }
      },
      this.isEditingElectric
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
                <label className="title-detail">{L('RENOVATION_SUPERVISOR_INFO')}</label>
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <FormInput
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  name="supervisorName"
                  label={L('SUPERVISOR_NAME')}
                  rule={rules.representative}
                />
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <FormInput
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  name="supervisorEmail"
                  label={L('SUPERVISOR_EMAIL')}
                  rule={rules.emailAddress}
                />
              </Col>
              <Col sm={{ span: 6, offset: 0 }}>
                <FormInput
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  name="supervisorPhone"
                  label={L('SUPERVISOR_PHONE')}
                  rule={rules.phoneNumber}
                />
              </Col>
              {/* Zone  */}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('RENOVATION_ZONE_INFO')}</label>
              </Col>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <FormSelect
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
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

              {/* Time contruction */}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('TIME_CONTRUCTION')}</label>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormDatePicker
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  disabledDate={disabledDate}
                  label={L('TIME_START_DATE')}
                  name="startDate"
                  rule={rules.type}
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormDatePicker
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                  disabledDate={(current) =>
                    this.formRef.current?.getFieldValue('startDate')
                      ? current < this.formRef.current?.getFieldValue('startDate')
                        ? true
                        : false
                      : disabledDate
                  }
                  label={L('TIME_END_DATE')}
                  name="endDate"
                  rule={rules.type}
                />
              </Col>

              {/* Design Company Name*/}
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('DESIGN_COMPANY_NAME')}</label>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormInput
                  rule={rules.representative}
                  label={L('COMPANY_NAME')}
                  name="designCompanyName"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormInput
                  label={L('DESIGN_COMPANY_ADDRESS')}
                  name="designCompanyAddress"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  label={L('DESIGN_COMPANY_SUPERVISOR')}
                  name="designCompanySupervisor"
                  rule={rules.representative}
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  label={L('DESIGN_COMPANY_EMAIL')}
                  name="designCompanyEmail"
                  rule={rules.emailAddress}
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  name="designCompanyPhone"
                  label={L('DESIGN_COMPANY_PHONE')}
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
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
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormInput
                  // rule={rules.representative}
                  label={L('CONTRACTOR_COMPANY_ADDRESS')}
                  name="contractorAddress"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  rule={rules.representative}
                  label={L('CONTRACTOR_COMPANY_SUPERVISOR')}
                  name="contractorSupervisor"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormInput
                  rule={rules.emailAddress}
                  label={L('CONTRACTOR_COMPANY_EMAIL')}
                  name="contractorEmail"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
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
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>

              {/* Asset Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('RENOVATION_STAFF_INFO')}</label>
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
                      this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                      this.state.visibleAction
                    }>
                    {L('ADD_NEW_ROW')}
                  </Button>
                </Col>
              </>

              {/* Electric Item Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <label className="title-detail">{L('ELECTRIC_ITEM_INFO')}</label>
                </Col>
                <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                  <Form
                    ref={this.formElectricItem}
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
                      dataSource={this.state.electricItems}
                      columns={columsItemElectric}
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
                    onClick={this.handleAddRowElectric}
                    disabled={
                      this.isStaff ||
                      this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                      this.state.visibleActionElectric
                    }>
                    {L('ADD_NEW_ROW')}
                  </Button>
                </Col>
              </>
              <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                <label className="title-detail">{L('RENOVATION_MORE_INFO')}</label>
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <FormNumber
                  min={0}
                  label={L('CONTRACTOR_USE_ELECTRIC')}
                  name="electricityConsumption"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 8, offset: 0 }}>
                <Form.Item name="electricityConnectionPoint" label={L('ELECTRIC_POINT')}>
                  <Radio.Group>
                    {[
                      { value: true, label: L('YES') },
                      { value: false, label: L('NO') }
                    ].map((option, index) => (
                      <Radio
                        key={index}
                        value={option.value}
                        disabled={
                          this.isStaff ||
                          this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                        }>
                        {L(option.label)}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormTextArea
                  rows={3}
                  label={L('RENOVATION_DOORWAY')}
                  name="doorway"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormTextArea
                  rows={3}
                  label={L('RENOVATION_PARTITION')}
                  name="partition"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>
              <Col sm={{ span: 24, offset: 0 }}>
                <FormTextArea
                  rows={3}
                  label={L('RENOVATION_NOTE_MORE')}
                  name="note"
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
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
                  disabled={
                    this.isStaff ||
                    this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft
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
                {this.props.renovationStore.editRenovationRequest?.statusId !== ticketRequestStatusEnum.Draft && (
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

export default withRouter(RenovationDetail)
