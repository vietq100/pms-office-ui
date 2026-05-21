import React from 'react'

import { Col, Form, Row, Card, Modal, Button, Table } from 'antd'
import { L, LError, LNotification } from '../../../../lib/abpUtility'
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
import { CheckCircleFilled, CloseCircleFilled, CopyOutlined, DeleteOutlined, EditFilled } from '@ant-design/icons'
import { v4 as uuid } from 'uuid'
import { portalLayouts } from '@components/Layout/Router/router.config'
import SessionStore from '@stores/sessionStore'
import ApprovalOrRejectModal from './ApprovalOrRejectModal'
import dayjs from 'dayjs'
import columnStaff from './columnStaff'
import renovationService from '@services/ticketRequest/renovationService'
import columnItemElectric from './columnItemElectric'
import OvertimeTicketStore from '@stores/ticketRequestStore/overtimeTicketStore'
import FormSwitch from '@components/FormItem/FormSwitch'
import overtimeTicketService from '@services/ticketRequest/overtimeTicketService'
import FormSelect from '@components/FormItem/FormSelect'
import { addItemToList, formatNumber, notifyError } from '@lib/helper'
import FormTextArea from '@components/FormItem/FormTextArea'
import FeeTypeStore from '@stores/fee/feeTypeStore'
import packageFeeService from '@services/fee/packageFeeService'
import columnItemComputer from './columnItemComputer'
import feeTypeService from '@services/fee/feeTypeService'

const { align, typeAccount, ticketRequestTypeEnum, ticketRequestStatusEnum, generateType } = AppConsts

const { confirm } = Modal

const statusApproval = {
  APPROVAL: 'APPROVAL',
  REJECT: 'REJECT'
}

export interface IProps {
  navigate: any
  params: any
  overtimeTicketStore: OvertimeTicketStore
  fileStore: FileStore
  sessionStore: SessionStore
  feeTypeStore: FeeTypeStore
}

@inject(Stores.OvertimeTicketStore, Stores.FileStore, Stores.SessionStore, Stores.FeeTypeStore)
@observer
class OvertimeTicketDetail extends AppComponentBase<IProps> {
  state = {
    files: [] as any,
    uniqueId: '',
    previousDataRow: undefined,
    uniqueAirConditioner: '',
    uniqueComputer: '',
    previousDataRowirConditioner: undefined,
    previousDataRowComputer: undefined,
    idDocument: undefined,
    staffs: [] as any,
    airConditioners: [] as any,
    computers: [] as any,
    isShowModalApprocal: false,
    typeModalAproval: statusApproval.APPROVAL,
    allowApprovalOrReject: false,
    listZone: [] as any,
    listStaffFilter: [] as any,
    visibleAction: false,
    visibleActionAirConditioner: false,
    visibleActionComputer: false,
    totalPrice: 0,
    isShowTableElectric: false,
    isShowTableComputer: false,
    packages: [] as any,
    feePackageCurrent: {} as any,
    lastDayOfPeriod: null
  }
  formRef: any = React.createRef()
  formStaff: any = React.createRef()
  formElectricItem: any = React.createRef()
  formComputerItem: any = React.createRef()
  formHistoryAppropval: any = React.createRef()

  isStaff =
    this.props.sessionStore.userAccountType === typeAccount.Develop ||
    this.props.sessionStore.userAccountType === typeAccount.Resident
      ? false
      : true

  async componentDidMount() {
    await this.handleCurrentFeePackage()
    this.getListZone()
    this.getlistStaff('')
    await this.handlePackageSearch('')
    await this.getDetail(this.props?.params?.id)
    await this.props.feeTypeStore.getFeeConfigByFeeType(generateType.OvertimeElectricity)

    // Update listPeriod after it's fully loaded
    this.setState((prevState) => ({
      packages: addItemToList(prevState.packages, prevState.feePackageCurrent)
    }))
  }

  componentDidUpdate(prevProps: IProps, prevState: Readonly<typeof this.state>) {
    if (prevState.feePackageCurrent !== this.state.feePackageCurrent) {
      this.updateLastDayOfPeriod()
    }
  }

  updateLastDayOfPeriod = () => {
    const day = dayjs(this.state.feePackageCurrent?.endDate).date(
      abp.setting.values['App.TenantManagement.LastDayOfPeriod']
    )
    this.setState({ lastDayOfPeriod: day.toISOString() })
  }

  isEditing = (record: any) => record.id === this.state.uniqueId

  isEditingElectric = (record: any) => record.id === this.state.uniqueAirConditioner
  isEditingComputer = (record: any) => record.id === this.state.uniqueComputer

  handlePackageSearch = async (value) => {
    const packages = await packageFeeService.getList({
      keyword: value
    })
    this.setState({ packages })
  }

  handleCurrentFeePackage = async () => {
    const feePackageCurrent = await feeTypeService.getCurrent()

    this.setState({ feePackageCurrent })
  }

  getDetail = async (id?) => {
    if (!id) {
      this.props.fileStore.currentFiles = []

      this.props.overtimeTicketStore.initData()
      this.formRef.current.setFieldsValue({
        ...this.props.overtimeTicketStore.editOvertimeRequest,
        feePackageId: this.state.feePackageCurrent?.id ?? undefined
      })
    } else {
      switch (this.props.sessionStore.userAccountType) {
        case typeAccount.Resident:
          await this.props.overtimeTicketStore.get4Resident(id)

          if (this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.overtimeTicketStore.getListRequestHistory({
              id: this.props.overtimeTicketStore.editOvertimeRequest?.id,
              requestTypeId: ticketRequestTypeEnum.OVERTIME
            })

            this.setState({
              allowApprovalOrReject: this.props.overtimeTicketStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })

            this.formHistoryAppropval.current.setFieldsValue({
              histories: [...this.props.overtimeTicketStore.listRequestHistory].map((item) => ({
                ...item,
                lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
              }))
            })
          }
          break
        case typeAccount.Develop:
          await this.props.overtimeTicketStore.get4Resident(id)
          break

        default:
          await this.props.overtimeTicketStore.get4Staff(id)

          if (this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft) {
            await this.props.overtimeTicketStore.getListRequestHistory({
              id: this.props.overtimeTicketStore.editOvertimeRequest?.id,
              requestTypeId: ticketRequestTypeEnum.OVERTIME
            })

            this.setState({
              allowApprovalOrReject: this.props.overtimeTicketStore.listRequestHistory.some(
                (item) => item?.canSendRequest === true
              )
            })
          }
          this.formHistoryAppropval.current.setFieldsValue({
            histories: [...this.props.overtimeTicketStore.listRequestHistory].map((item) => ({
              ...item,
              lastModificationTime: item.lastModificationTime ? dayjs(item.lastModificationTime) : null
            }))
          })
      }

      this.formRef.current.setFieldsValue({
        ...this.props.overtimeTicketStore.editOvertimeRequest
      })

      this.setState((prevState) => ({
        packages: addItemToList(prevState.packages, this.props.overtimeTicketStore.editOvertimeRequest?.feePackage)
      }))

      if (this.props.overtimeTicketStore.editOvertimeRequest?.isUseAirConditioner) {
        this.setState({ isShowTableElectric: true })
      } else {
        this.setState({ isShowTableElectric: false })
      }
      if (this.props.overtimeTicketStore.editOvertimeRequest?.isUseComputer) {
        this.setState({ isShowTableComputer: true })
      } else {
        this.setState({ isShowTableComputer: false })
      }

      this.setState({
        idDocument: this.props.overtimeTicketStore.editOvertimeRequest?.uniqueId,
        staffs: this.props.overtimeTicketStore.editOvertimeRequest?.staffs,
        airConditioners: this.props.overtimeTicketStore.editOvertimeRequest?.airConditioners,
        computers: this.props.overtimeTicketStore.editOvertimeRequest?.computers
      })

      const totalAmount = this.props.overtimeTicketStore.editOvertimeRequest?.airConditioners.reduce(
        (accumulator, current) => {
          return accumulator + (current.totalPrice || 0) // Add totalAmount if it exists, otherwise add 0
        },
        0
      )

      this.setState({ totalPrice: totalAmount })
    }
  }

  getListZone = async () => {
    const listZone = await renovationService.getListZoneByUser()

    this.setState({ listZone })
  }

  getlistStaff = async (keyword: string) => {
    const filter = {
      skipCount: 0,
      maxResultCount: 20,
      keyword
    }
    const listStaffFilter = await overtimeTicketService.getListStaff4Filter(filter)

    this.setState({ listStaffFilter })
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
    this.setState({ visibleActionAirConditioner: true })
    this.formElectricItem.current.resetFields()

    const newRow = {
      id: uuid(),
      pricePerHour: this.props.feeTypeStore.feeTypeConfig?.feeOvertimeElectricityConfigurations[0]?.amount
    }

    const newData = [...this.state.airConditioners]

    newData.unshift(newRow)

    this.setState({ airConditioners: newData })
    this.setState({ uniqueAirConditioner: newRow.id })
  }

  handleAddRowComputer = () => {
    this.setState({ visibleActionComputer: true })
    this.formComputerItem.current.resetFields()

    const newRow = {
      id: uuid()
    }

    const newData = [...this.state.computers]

    newData.unshift(newRow)

    this.setState({ computers: newData })
    this.setState({ uniqueComputer: newRow.id })
  }

  saveRow = async (id: any) => {
    const values = await this.formStaff.current.validateFields()
    const foundItem = this.state.staffs.find((item) => item.id === this.state.uniqueId)

    if (id === undefined) {
      const data = {
        ...values,
        startTime: values?.startTime ? dayjs(values?.startTime).toJSON() : null,
        endTime: values?.endTime ? dayjs(values?.endTime).toJSON() : null
      }
      // Merge the found item with the object
      Object.assign(foundItem, data)
    } else {
      values.id = id
      const data = {
        ...values,
        startTime: values?.startTime ? dayjs(values?.startTime).toJSON() : null,
        endTime: values?.endTime ? dayjs(values?.endTime).toJSON() : null
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

  copyRow = (row) => {
    const newRow = {
      ...row,
      id: uuid()
    }

    const newData = [newRow, ...this.state.staffs]

    this.setState(
      {
        staffs: newData,
        uniqueId: newRow.id,
        visibleAction: true,
        previousDataRow: undefined
      },
      () => {
        this.formStaff.current.setFieldsValue({
          ...newRow,
          startTime: newRow?.startTime ? dayjs(newRow.startTime) : null,
          endTime: newRow?.endTime ? dayjs(newRow.endTime) : null
        })
      }
    )
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

  handleCancleRowAirCordi = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó
    if (this.state.previousDataRowirConditioner === undefined) {
      const newAirConditioners = this.state.airConditioners.filter((item) => item.id !== id)
      this.setState({ airConditioners: newAirConditioners })
    }

    this.setState({ visibleActionAirConditioner: false })
    this.setState({ uniqueAirConditioner: '' })
    this.setState({ previousDataRowirConditioner: undefined })
  }

  handleCancleRowComputer = async (id) => {
    // check nếu k có data record trước khi edit đó thì xoá row luôn=> do khi tạo
    // mới thì chắc chắn không có data dòng trước đó

    if (this.state.previousDataRowComputer === undefined) {
      const newItem = this.state.computers.filter((item) => item.id !== id)
      this.setState({ computers: newItem })
    }

    this.setState({ visibleActionComputer: false })
    this.setState({ uniqueComputer: '' })
    this.setState({ previousDataRowComputer: undefined })
  }

  handleDeleteRow = (id) => {
    const newStaffs = this.state.staffs.filter((item) => item.id !== id)
    this.setState({ staffs: newStaffs })
  }

  handleDeleteRowAirConditioner = (id) => {
    const newAirConditioners = this.state.airConditioners.filter((item) => item.id !== id)
    this.setState({ airConditioners: newAirConditioners })

    const totalAmount = newAirConditioners.reduce((accumulator, current) => {
      return accumulator + (current.totalPrice || 0) // Add totalAmount if it exists, otherwise add 0
    }, 0)

    this.setState({ totalPrice: totalAmount })
  }

  handleDeleteRowComputer = (id) => {
    const newItem = this.state.computers.filter((item) => item.id !== id)
    this.setState({ computers: newItem })
  }

  saveRowElectric = async (id: any) => {
    const values = await this.formElectricItem.current.validateFields()

    const sizeZone = this.state.listZone.find((item) => item?.id == values?.zoneId)?.size ?? 0
    const foundItem = this.state.airConditioners.find((item) => item.id === this.state.uniqueAirConditioner)

    let hoursPerDay = 0
    let actualDay = 0
    let totalHours = 0
    let totalDay = 0

    // Validate and calculate hours per day
    if (values?.startTime && values?.endTime) {
      if (dayjs(values?.startTime).startOf('minute').isAfter(dayjs(values?.endTime).startOf('minute'))) {
        notifyError(LError('ERROR'), LError('PLEASE_SELECT_START_TIME_BEFORE_END_TIME'))
        return
      }
      const fixedStart = dayjs(values.startTime).set('year', 2000).set('month', 0).set('date', 1)
      const fixedEnd = dayjs(values.endTime).set('year', 2000).set('month', 0).set('date', 1)

      const ms = fixedEnd.diff(fixedStart)

      if (ms < 0) {
        notifyError(LError('ERROR'), LError('PLEASE_SELECT_START_TIME_BEFORE_END_TIME'))
        return
      }

      hoursPerDay = Number((ms / (1000 * 60 * 60)).toFixed(2))
    }

    // Validate and calculate actual days
    if (values?.startDate && values?.endDate) {
      if (dayjs(values?.startDate).startOf('minute').isAfter(dayjs(values?.endDate).startOf('minute'))) {
        notifyError(LError('ERROR'), LError('PLEASE_SELECT_START_DATE_BEFORE_END_DATE'))
        return
      }

      const diffDays = dayjs(values?.endDate).diff(dayjs(values?.startDate), 'day') + 1 // Inclusive
      actualDay = Math.max(diffDays - Number(values?.totalDayNotUse || 0), 0)
      totalDay = dayjs(values?.endDate).diff(dayjs(values?.startDate), 'day') + 1
    }

    // Total hours = hours per day * actual days
    totalHours = Number((hoursPerDay * actualDay).toFixed(2))

    const data = {
      ...values,
      size: sizeZone,
      totalDay: totalDay,
      actTotalDay: actualDay,
      totalHours: totalHours,
      totalPrice:
        sizeZone * this.props.feeTypeStore.feeTypeConfig?.feeOvertimeElectricityConfigurations[0]?.amount * totalHours
    }

    if (id === undefined) {
      if (foundItem) Object.assign(foundItem, data)
    } else {
      data.id = id
      if (foundItem) Object.assign(foundItem, data)
    }

    const totalAmount = this.state.airConditioners.reduce((accumulator, current) => {
      return accumulator + (current.totalPrice || 0) // Add totalAmount if it exists, otherwise add 0
    }, 0)

    this.setState({
      visibleActionAirConditioner: false,
      uniqueAirConditioner: '',
      previousDataRowirConditioner: undefined,
      totalPrice: totalAmount
    })
  }

  copyRowElectric = async (row) => {
    const newRow = {
      ...row,
      id: uuid(),
      pricePerHour: this.props.feeTypeStore.feeTypeConfig?.feeOvertimeElectricityConfigurations[0]?.amount
    }

    const newData = [newRow, ...this.state.airConditioners]

    this.setState(
      {
        airConditioners: newData,
        uniqueAirConditioner: newRow.id,
        visibleActionAirConditioner: true,
        previousDataRowirConditioner: undefined
      },
      () => {
        this.formElectricItem.current.setFieldsValue({
          ...newRow,
          startTime: newRow?.startTime ? dayjs(newRow.startTime) : null,
          endTime: newRow?.endTime ? dayjs(newRow.endTime) : null
        })
      }
    )
  }

  copyRowComputer = async (row) => {
    const newRow = {
      ...row,
      id: uuid()
    }

    const newData = [newRow, ...this.state.computers]

    this.setState(
      {
        computers: newData,
        uniqueComputer: newRow.id,
        visibleActionComputer: true,
        previousDataRowComputer: undefined
      },
      () => {
        this.formComputerItem.current.setFieldsValue({
          ...newRow,
          startTime: newRow?.startTime ? dayjs(newRow.startTime) : null,
          endTime: newRow?.endTime ? dayjs(newRow.endTime) : null
        })
      }
    )
  }

  saveRowComputer = async (id: any) => {
    const values = await this.formComputerItem.current.validateFields()

    const foundItem = this.state.computers.find((item) => item.id === this.state.uniqueComputer)
    if (id === undefined) {
      if (foundItem) {
        // Merge the found item with the object
        const data = {
          ...values,
          startTime: values?.startTime ? dayjs(values?.startTime).toJSON() : null,
          endTime: values?.endTime ? dayjs(values?.endTime).toJSON() : null
        }

        Object.assign(foundItem, data)
      }
    } else {
      values.id = id
      const data = {
        ...values,
        startTime: values?.startTime ? dayjs(values?.startTime).toJSON() : null,
        endTime: values?.endTime ? dayjs(values?.endTime).toJSON() : null
      }

      if (foundItem) {
        // Merge the found item with the object
        Object.assign(foundItem, data)
      }
    }

    this.setState({ visibleActionComputer: false })
    this.setState({ uniqueComputer: '' })

    this.setState({ previousDataRowComputer: undefined })
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

  handleShowTableElectric = (isShow: boolean) => {
    this.setState({ isShowTableElectric: isShow })
  }

  handleShowTableComputer = (isShow: boolean) => {
    this.setState({ isShowTableComputer: isShow })
  }

  handleApprovalOrReject = async (message: string, typeModalAproval: string) => {
    if (typeModalAproval === statusApproval.APPROVAL) {
      const body = {
        id: this.props.overtimeTicketStore.editOvertimeRequest?.id,
        requestTypeId: ticketRequestTypeEnum.OVERTIME,
        statusId: ticketRequestStatusEnum.Approval,
        description: message
      }
      await this.props.overtimeTicketStore.sendApproval(body)
    } else {
      const body = {
        id: this.props.overtimeTicketStore.editOvertimeRequest?.id,
        requestTypeId: ticketRequestTypeEnum.OVERTIME,
        statusId: ticketRequestStatusEnum.Rejected,
        description: message
      }
      await this.props.overtimeTicketStore.sendApproval(body)
    }
    this.props.navigate(portalLayouts.ticketRequestOvertime.path)
  }

  onSave = async (isSendApproval) => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.overtimeTicketStore.editOvertimeRequest?.id) {
        // this.isGranted(appPermissions.company.update) &&
        await this.props.overtimeTicketStore.update(
          {
            ...this.props.overtimeTicketStore.editOvertimeRequest,
            ...values,
            staffs: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            })),
            airConditioners: this.state.airConditioners.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            })),
            computers: this.state.computers.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      } else {
        // this.isGranted(appPermissions.company.update) &&
        await this.props.overtimeTicketStore.create(
          {
            ...values,
            staffs: this.state.staffs.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            })),
            airConditioners: this.state.airConditioners.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            })),
            computers: this.state.computers.map((item) => ({
              ...item,
              id: typeof item.id !== 'number' ? 0 : item.id
            }))
          },
          this.state.files
        )
      }
      if (isSendApproval) {
        const body = {
          id: this.props.overtimeTicketStore.editOvertimeRequest?.id,
          requestTypeId: ticketRequestTypeEnum.OVERTIME,
          statusId: ticketRequestStatusEnum.Watting,
          description: ''
        }

        await this.props.overtimeTicketStore.sendApproval(body)
      }
      this.props.navigate(portalLayouts.ticketRequestOvertime.path)
    })
  }

  onCancel = () => {
    confirm({
      title: LNotification('ARE_YOU_SURE'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),
      onOk: () => {
        this.props.navigate(portalLayouts.ticketRequestOvertime.path)
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
              this.props.overtimeTicketStore.editOvertimeRequest?.statusId === ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={
                    this.state.uniqueId !== '' || this.state.uniqueAirConditioner !== '' || this.state.staffs.length < 1
                  }
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
              this.props.overtimeTicketStore.editOvertimeRequest?.statusId === ticketRequestStatusEnum.Draft && (
                <Button
                  disabled={
                    this.state.uniqueId !== '' || this.state.uniqueAirConditioner !== '' || this.state.staffs.length < 1
                  }
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
      overtimeTicketStore: { isLoading },
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
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
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
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<CopyOutlined />}
                onClick={() => this.copyRow(row)}
              />
              {/* )} */}

              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
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
          return this.state.uniqueAirConditioner === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRowElectric(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancleRowAirCordi(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleActionAirConditioner && this.state.uniqueAirConditioner !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formElectricItem.current.setFieldsValue({
                    ...row
                  })
                  this.setState({ uniqueAirConditioner: row.id })
                  this.setState({
                    uniqueAirConditioner: row?.id,
                    visibleActionAirConditioner: true,
                    previousDataRowirConditioner: { ...row }
                  })
                }}
              />
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleActionAirConditioner && this.state.uniqueAirConditioner !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<CopyOutlined />}
                onClick={() => this.copyRowElectric(row)}
              />
              {/* )} */}

              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => this.handleDeleteRowAirConditioner(row.id)}
              />
              {/* )} */}
            </div>
          )
        }
      },
      this.isEditingElectric,
      this.state.listZone.map((item) => ({ id: item?.id, name: item?.zoneName })),
      this.state.lastDayOfPeriod
    )

    const columsItemComputer = columnItemComputer(
      {
        title: L('FILE_DOCUMENT_ACTION'),
        dataIndex: 'action',
        key: 'action',
        fixed: align.right,
        align: align.center,
        width: '10%',
        render: (action, row) => {
          return this.state.uniqueComputer === row.id ? (
            <div className="d-flex justify-content-center w-100 ">
              <Button
                type="text"
                icon={<CheckCircleFilled style={{ color: appStatusColors.success }} />}
                onClick={() => this.saveRowComputer(row.id)}
              />
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: appStatusColors.error }} />}
                onClick={() => this.handleCancleRowComputer(row.id)}
              />
            </div>
          ) : (
            <div className="d-flex justify-content-center w-100 ">
              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleActionComputer && this.state.uniqueComputer !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<EditFilled />}
                onClick={() => {
                  this.formComputerItem.current.setFieldsValue({
                    ...row,
                    startTime: row?.startTime ? dayjs(row?.startTime) : null,
                    endTime: row?.endTime ? dayjs(row?.endTime) : null
                  })
                  this.setState({ uniqueComputer: row.id })
                  this.setState({
                    uniqueComputer: row?.id,
                    visibleActionComputer: true,
                    previousDataRpreviousDataRowComputerowirConditioner: { ...row }
                  })
                }}
              />
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleActionComputer && this.state.uniqueComputer !== row.id)
                }
                size="small"
                shape="circle"
                className=" mr-1"
                icon={<CopyOutlined />}
                onClick={() => this.copyRowComputer(row)}
              />
              {/* )} */}

              {/* {isGrantedAny(appPermissions.contractor.update) && ( */}
              <Button
                disabled={
                  this.isStaff ||
                  this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                  (this.state.visibleAction && this.state.uniqueId !== row.id)
                }
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() => this.handleDeleteRowComputer(row.id)}
              />
              {/* )} */}
            </div>
          )
        }
      },
      this.isEditingComputer
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

              <Col sm={{ span: 8, offset: 0 }} xs={{ span: 24 }} className="mt-2">
                <FormSelect
                  disabled={
                    this.isStaff ||
                    this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                    this.state.visibleAction
                  }
                  rule={rules.type}
                  name="feePackageId"
                  label={L('FEE_PACKAGE')}
                  selectProps={{
                    showSearch: true,
                    onSearch: (value) => this.handlePackageSearch(value),
                    onChange: (value) => {
                      const feePackage = this.state.packages?.find((item) => item?.id === value)
                      this.setState({ feePackageCurrent: feePackage })
                    }
                  }}
                  options={this.state.packages?.map((item) => ({
                    id: item?.id,
                    value: item?.id,
                    label: item?.name
                  }))}
                />
              </Col>
              {/* Staff list Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2">
                  <label className="title-detail">{L('OVERTIME_INFO_STAFFS')}</label>
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
                      this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft ||
                      this.state.visibleAction
                    }>
                    {L('ADD_NEW_ROW')}
                  </Button>
                </Col>
              </>

              {/* Air Conditioner Item Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2 d-flex align-items-center">
                  <label className="title-detail mr-1"> {L('AIR_CONDITIONER_ITEM_INFO')}</label>
                  <FormSwitch
                    name="isUseAirConditioner"
                    label={''}
                    onChange={this.handleShowTableElectric}
                    disabled={
                      this.isStaff ||
                      this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft
                    }
                  />
                </Col>
                {this.state.isShowTableElectric && (
                  <>
                    <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2 d-flex justify-content-end ">
                      <Row className="d-flex justify-content-end">
                        <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }}>
                          <label> {L('TOTAL_AMOUNT')}</label>
                        </Col>
                        <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }}>
                          <span style={{ fontWeight: 600, fontSize: 16, color: '#AC1916' }}>
                            VNĐ {formatNumber(this.state.totalPrice)}
                          </span>
                        </Col>
                      </Row>
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
                          dataSource={this.state.airConditioners}
                          columns={columsItemElectric}
                          rowKey={(record) => record.id}
                          scroll={{ x: 'max-content', scrollToFirstRowOnChange: true }}
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
                          this.props.overtimeTicketStore.editOvertimeRequest?.statusId !==
                            ticketRequestStatusEnum.Draft ||
                          this.state.visibleActionAirConditioner
                        }>
                        {L('ADD_NEW_ROW')}
                      </Button>
                    </Col>
                  </>
                )}
              </>

              {/* Computer Used Item Info */}
              <>
                <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2 d-flex align-items-center">
                  <label className="title-detail mr-1"> {L('COMPUTER_USED_ITEM_INFO')}</label>
                  <FormSwitch
                    name="isUseComputer"
                    label={''}
                    onChange={this.handleShowTableComputer}
                    disabled={
                      this.isStaff ||
                      this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft
                    }
                  />
                </Col>
                {this.state.isShowTableComputer && (
                  <>
                    <Col sm={{ span: 24, offset: 0 }} className="mt-2">
                      <Form
                        ref={this.formComputerItem}
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
                          dataSource={this.state.computers}
                          columns={columsItemComputer}
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
                        onClick={this.handleAddRowComputer}
                        disabled={
                          this.isStaff ||
                          this.props.overtimeTicketStore.editOvertimeRequest?.statusId !==
                            ticketRequestStatusEnum.Draft ||
                          this.state.visibleActionComputer
                        }>
                        {L('ADD_NEW_ROW')}
                      </Button>
                    </Col>
                  </>
                )}
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
                    this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft
                  }
                />
              </Col>

              <Col sm={{ span: 24, offset: 0 }} xs={{ span: 24 }} className="mt-2">
                <label className="title-detail">{L('OVERTIME_STAFF_ACTION')}</label>
              </Col>
              <Col sm={{ span: 8, offset: 0 }} xs={{ span: 24 }}>
                <FormSelect label={L('OVERTIME_TECHNICIAN')} name="technicianId" options={this.state.listStaffFilter} />
              </Col>
              <Col sm={{ span: 8, offset: 0 }} xs={{ span: 24 }}>
                <FormInput label={L('OVERTIME_SECURITY_GUARD_NAME')} name="securityGuardName" />
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
                {this.props.overtimeTicketStore.editOvertimeRequest?.statusId !== ticketRequestStatusEnum.Draft && (
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

export default withRouter(OvertimeTicketDetail)
