import React from 'react'

import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import Card from 'antd/es/card'
import Tabs from 'antd/es/tabs'
import Modal from 'antd/es/modal'
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import DatePicker from 'antd/es/date-picker'
import { isGrantedAny, L, LNotification } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
import rules from './validation'
import AppConsts, { appPermissions, timeFormat, moduleIds, dateFormat } from '../../../../lib/appconst'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import ReservationStore from '../../../../stores/booking/reservationStore'
import WrapPageScroll from '../../../../components/WrapPageScroll'
import AppComponentBase from '../../../../components/AppComponentBase'
import ProjectStore from '../../../../stores/project/projectStore'
import WorkflowStore from '../../../../stores/workflow/workflowStore'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { UnitUserModel } from '@models/User/IUserModel'
import FileStore from '../../../../stores/common/fileStore'
import AuditLog from '../../../../components/AuditLog'
import AuditLogStore from '../../../../stores/common/auditLogStore'
import CommentStore from '../../../../stores/common/commentStore'
import SessionStore from '../../../../stores/sessionStore'
import CommentList from '../../../../components/CommentList'
import Avatar from 'antd/es/avatar'
import TextArea from 'antd/es/input/TextArea'
import { ReservationFees } from './ReservationFees'
import withRouter from '@components/Layout/Router/withRouter'
import FeeRefundModal from '@scenes/feeStatement/fee-refund/FeeRefundModal'
import FeeStore from '@stores/fee/feeStore'
import { IFeeRefundModel } from '@models/fee'
import Badge from 'antd/lib/badge'
import { PrinterOutlined } from '@ant-design/icons'
import ReservationChangCalenderModal from './ReservationChangCalenderModal'
import VoucherStore from '@stores/fee/voucherStore'
import dayjs from 'dayjs'
import NoRole from '@components/ComponentNoRole'
import ReservationPagePrint from './ReservationPagePrint'
import TimeChangeIcon from '@assets/icons/timechange.png'
import CashAdvanceStore from '@stores/finance/cashAdvanceStore'

const { formVerticalLayout } = AppConsts
const { confirm } = Modal
const { RangePicker } = DatePicker
const { Option } = Select
const { TabPane } = Tabs
const tabKeys = {
  tabInfo: 'RESERVATION_TAB_INFO',
  tabReservationFee: 'RESERVATION_TAB_FEES',
  tabComment: 'RESERVATION_TAB_COMMENTS',
  tabAuditLog: 'RESERVATION_TAB_AUDIT_LOG'
}
export interface IReservationFormProps {
  params: any
  navigate: any
  reservationStore: ReservationStore
  workflowStore: WorkflowStore
  projectStore: ProjectStore
  fileStore: FileStore
  auditLogStore: AuditLogStore
  commentStore: CommentStore
  sessionStore: SessionStore
  feeStore: FeeStore
  voucherStore: VoucherStore
  cashAdvanceStore: CashAdvanceStore
}

@inject(
  Stores.CashAdvanceStore,
  Stores.ReservationStore,
  Stores.WorkflowStore,
  Stores.UserStore,
  Stores.ProjectStore,
  Stores.UnitStore,
  Stores.FileStore,
  Stores.AuditLogStore,
  Stores.CommentStore,
  Stores.SessionStore,
  Stores.FeeStore,
  Stores.VoucherStore
)
@observer
class ReservationDetail extends AppComponentBase<IReservationFormProps> {
  state = {
    isDirty: false,
    tabActiveKey: tabKeys.tabInfo,
    files: [] as any,
    amenities: [] as any,
    selectedRecord: [] as any,
    isShowFullDetail: false,
    refundModalVisible: false,
    showChangCalender: false,
    showPrint: false
  }
  formRef: any = React.createRef()

  async componentDidMount() {
    this.isGranted(appPermissions.reservation.detail) &&
      (await Promise.all([
        this.getDetail(this.props.params?.id),
        this.props.reservationStore.getReservationStatus(),
        this.props.reservationStore.getReservationPaymentStatus()
      ]))
    this.isGranted(appPermissions.reservation.detail) && this.initDefault()
  }

  initDefault = async () => {
    const { editReservation } = this.props.reservationStore
    if (editReservation?.id) {
      this.props.projectStore.unitUserOptions = [
        UnitUserModel.init(
          editReservation.displayName,
          editReservation.userId,
          editReservation.unitId,
          editReservation.fullUnitCode
        )
      ]
      this.setState({ amenities: [editReservation.amenity] })
    }
  }
  handleCloseCanlendaModal = () => {
    this.getDetail(this.props.params?.id), this.setState({ showChangCalender: false })
  }
  handleOpenCaModal = () => {
    this.setState({ showChangCalender: true })
  }
  handleChangeCalender = async () => {
    this.handleCloseCanlendaModal()
  }
  getDetail = async (id?) => {
    if (!id) {
      await this.props.reservationStore.createReservation()
    } else {
      await this.props.reservationStore.get(id, false)
    }
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        ...this.props.reservationStore.editReservation
      })
    }
  }

  onShowPrint = () => {
    this.setState({ showPrint: !this.state.showPrint })
  }

  findProjects = async (keyword) => {
    await this.props.projectStore.filterOptions({ keyword })
  }

  findUnitResidents = async (keyword, changeProject?) => {
    const projectId = this.formRef.current.getFieldValue('projectId')
    if (!projectId || changeProject) {
      this.formRef.current.setFieldsValue({
        unitUserId: undefined,
        userId: undefined,
        unit: undefined,
        fullUnitCode: '',
        workflow: { assignedId: undefined }
      })
    }
    await this.props.projectStore.filterUnitUserOptions({ keyword, projectId })
  }

  updateUnitResident = async (value) => {
    const { unitUserOptions } = this.props.projectStore
    const form = this.formRef.current

    if (!unitUserOptions || !unitUserOptions.length) {
      return
    }
    const resident = unitUserOptions.find((item) => item.optionValue === value)
    form.setFieldsValue({
      unitId: resident?.unitId,
      userId: resident?.userId,
      fullUnitCode: resident?.fullUnitCode
    })
  }

  onSave = () => {
    const form = this.formRef.current

    form.validateFields().then(async (values: any) => {
      if (this.props.reservationStore.editReservation?.id) {
        await this.props.reservationStore.update({
          ...this.props.reservationStore.editReservation,
          ...values
        })
      } else {
        await this.props.reservationStore.create(values)
      }
    })
  }

  handelNabigate = () => {
    const { navigate } = this.props
    navigate(portalLayouts.feeVoucher.path)
  }

  onCancel = () => {
    const { navigate } = this.props
    if (this.state.isDirty) {
      confirm({
        title: LNotification('ARE_YOU_SURE'),
        okText: L('BTN_YES'),
        cancelText: L('BTN_NO'),
        onOk: () => {
          navigate(portalLayouts.reservationManagement.path)
        }
      })
      return
    }
    navigate(portalLayouts.reservationManagement.path)
  }

  changeTab = (tabKey) => {
    this.setState({ tabActiveKey: tabKey })
    if (tabKey === tabKeys.tabComment) {
      const params = {
        conversationUniqueId: this.props.reservationStore.editReservation?.uniqueId,
        moduleId: moduleIds.reservation,
        maxResultCount: 10,
        skipCount: 0,
        isIncludeFile: true,
        isPrivate: false
      }
      this.props.commentStore.getAll(params)
    }
  }

  renderReservationId = () => {
    if (!this.props.reservationStore.editReservation?.id) {
      return ''
    }
    return (
      <Row gutter={[8, 8]}>
        <Col style={{ display: 'flex', alignItems: 'center' }}>
          <b>
            {this.L('RESERVATION_ID')}: {this.props.reservationStore.editReservation.id}
          </b>
        </Col>
        <Col>
          <Button type="primary" onClick={this.onShowPrint} icon={<PrinterOutlined />} />
        </Col>
      </Row>
    )
  }
  handleShowFullButton = async () => {
    const isShowPhoneEmail = true
    const id = this.props.params?.id
    if (id) {
      await this.props.reservationStore.get(id, isShowPhoneEmail)
      this.formRef.current.setFieldsValue({
        ...this.props.reservationStore.editReservation
      })
      this.setState({ isShowFullDetail: true })
    }
  }

  renderActions = (isLoading?) => {
    const { tabActiveKey } = this.state
    return (
      <Row>
        <Col flex="0">
          {tabActiveKey === tabKeys.tabInfo && isGrantedAny(appPermissions.reservation.fullDetail) && (
            <Button
              className="ml-1"
              type="primary"
              // ghost
              onClick={() => this.handleShowFullButton()}
              loading={isLoading}
              disabled={this.state.isShowFullDetail ? true : false}
              shape="round">
              {L('BTN_VIEW_FULL')}
            </Button>
          )}
        </Col>
        <Col sm={{ span: 24, offset: 0 }} flex="1">
          <Button className="mr-1" onClick={this.onCancel} shape="round">
            {L('BTN_CANCEL')}
          </Button>
          {tabActiveKey === tabKeys.tabInfo &&
            isGrantedAny(appPermissions.reservation.create, appPermissions.reservation.update) && (
              <Button
                type="primary"
                disabled={this.props.params?.id && !this.isGranted(appPermissions.reservation.update)}
                onClick={this.onSave}
                loading={isLoading}
                shape="round">
                {L('BTN_SAVE')}
              </Button>
            )}
        </Col>
      </Row>
    )
  }
  handleCloseRefundModal = () => this.setState({ refundModalVisible: false })

  handleRefundFee = async (data: IFeeRefundModel) => {
    await this.props.feeStore?.refundDepositFee(data)

    confirm({
      title: LNotification('DO_YOU_WANT_TO_GO_VOUCHER_DETAIL {0}', this.props.feeStore.voucherDetail.id),

      content: LNotification('FEE_REFUND_DESCRIPTION_NOTIFICATION'),
      okText: L('BTN_YES'),
      cancelText: L('BTN_NO'),

      onOk: async () => {
        await this.props.feeStore?.getDetailVoucher(this.props.feeStore.voucherDetail.id)
        const dataVoucherDetailFull = this.props.feeStore.voucherDetailFull

        this.props.voucherStore.voucherDetail = dataVoucherDetailFull

        this.props.navigate(portalLayouts.feeVoucherDetailV1.path)
      }
    })
    this.handleCloseRefundModal()
  }

  handleOpenRefundModal = (feeDetail) => {
    this.props.feeStore?.setRefundDepositModel(feeDetail)
    this.setState({ refundModalVisible: true })
  }
  render() {
    const {
      reservationStore: { editReservation, isLoading, listStatus, listPaymentStatus }
    } = this.props
    const { amenities } = this.state
    const displayStatus = (listStatus || []).map((item) => ({
      value: item.statusCode,
      label: item.name
    }))
    const displayPaymentStatus = (listPaymentStatus || []).map((item) => ({
      value: item.paymentStatusCode,
      label: item.name
    }))

    const bookingDate = dayjs(editReservation.startDate).format(dateFormat)

    return this.isGranted(appPermissions.reservation.detail) ? (
      <WrapPageScroll renderActions={() => this.renderActions(isLoading)}>
        <Tabs
          type="card"
          activeKey={this.state.tabActiveKey}
          onTabClick={this.changeTab}
          tabBarExtraContent={this.renderReservationId()}>
          <TabPane tab={L(tabKeys.tabInfo)} key={tabKeys.tabInfo}>
            <Badge.Ribbon text={L('IS_MONTHLY_PACKAGE')} className={editReservation.isMonthlyPackage ? '' : 'd-none'}>
              <Card className="pt-3" bordered={false} id="Reservation-detail" style={{ minHeight: 350 }}>
                <Form
                  ref={this.formRef}
                  layout={'vertical'}
                  onFinish={this.onSave}
                  onAbort={this.onCancel}
                  onValuesChange={() => this.setState({ isDirty: true })}
                  validateMessages={validateMessages}
                  size="middle">
                  <Row gutter={[16, 0]}>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item
                        label={L('RESERVATION_RESIDENT_DISPLAY_NAME')}
                        {...formVerticalLayout}
                        name="displayName">
                        <Input disabled={true} />
                      </Form.Item>
                      <Form.Item name="userId" rules={rules.userId} className="d-none">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item label={L('RESERVATION_RESIDENT_PHONE')} {...formVerticalLayout} name="phoneNumber">
                        <Input disabled={true} />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item label={L('RESERVATION_RESIDENT_EMAIL')} {...formVerticalLayout} name="emailAddress">
                        <Input disabled={true} />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item
                        label={L('RESERVATION_UNIT')}
                        {...formVerticalLayout}
                        name="fullUnitCode"
                        rules={rules.unitId}>
                        <Input disabled={true} />
                      </Form.Item>
                      <Form.Item name="unitId" rules={rules.unitId} className="d-none">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item label={L('RESERVATION_AMENITY')} {...formVerticalLayout} name="amenityId">
                        <Select style={{ width: '100%' }} showArrow disabled>
                          {(amenities || []).map((option, index) => {
                            return (
                              <Option key={index} value={option.id}>
                                {option.iconPath && <Avatar src={option.iconPath} size={20} />} {option.amenityName}
                              </Option>
                            )
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col sm={{ span: 5, offset: 0 }}>
                      <Form.Item
                        label={L('RESERVATION_TIME_ON_DATE_{0}', bookingDate)}
                        {...formVerticalLayout}
                        name="fromToDate">
                        <RangePicker format={timeFormat} disabled className="full-width" />
                      </Form.Item>
                    </Col>
                    {(this.props.reservationStore.editReservation.statusId === 1 ||
                      this.props.reservationStore.editReservation.statusId === 2) && (
                      <Col span={3}>
                        <Form.Item label={L('RESERVATION_DETAIL_LABLE_CHANGE_TIME')} {...formVerticalLayout}>
                          <Button
                            type="primary"
                            shape="round"
                            size={'middle'}
                            icon={<img style={{ height: 25, width: 25, marginRight: 5 }} src={TimeChangeIcon} />}
                            onClick={this.handleOpenCaModal}></Button>
                        </Form.Item>
                      </Col>
                    )}
                    <Col sm={{ span: 8, offset: 0 }}>
                      <Form.Item
                        label={L('RESERVATION_STATUS')}
                        {...formVerticalLayout}
                        name="status"
                        rules={rules.statusId}>
                        <Select className="full-width">{this.renderOptions(displayStatus)}</Select>
                      </Form.Item>
                    </Col>
                    {editReservation.amenity?.isUseDeposited && (
                      <Col sm={{ span: 8, offset: 0 }}>
                        <Form.Item
                          label={L('RESERVATION_PAYMENT_STATUS')}
                          {...formVerticalLayout}
                          name="paymentStatus"
                          rules={rules.paymentStatusId}>
                          <Select className="full-width" disabled>
                            {this.renderOptions(displayPaymentStatus)}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    <Col sm={{ span: 24, offset: 0 }}>
                      <Form.Item label={L('RESERVATION_DESCRIPTION')} {...formVerticalLayout} name="description">
                        <TextArea autoSize={{ minRows: 2, maxRows: 2 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Badge.Ribbon>
            {editReservation?.feeDetails && editReservation?.feeDetails.length > 0 && (
              <>
                <h3 className="mt-3">{L(tabKeys.tabReservationFee)}</h3>
                <Card bordered={false}>
                  <ReservationFees
                    reservationFees={editReservation?.feeDetails}
                    onRefund={this.handleOpenRefundModal}
                  />
                </Card>
                <FeeRefundModal
                  cashAdvanceStore={this.props.cashAdvanceStore}
                  navigate={this.props.navigate}
                  feeStore={this.props.feeStore}
                  onOk={this.handleRefundFee}
                  visible={this.state.refundModalVisible}
                  onClose={this.handleCloseRefundModal}
                />
              </>
            )}

            <ReservationChangCalenderModal
              reservationStore={this.props.reservationStore}
              amenity={this.props.reservationStore.editReservation}
              visible={this.state.showChangCalender}
              onClose={this.handleCloseCanlendaModal}
              onOk={this.handleChangeCalender}
            />
            <ReservationPagePrint
              detailBooking={this.props.reservationStore.editReservation}
              visible={this.state.showPrint}
              onClose={this.onShowPrint}
            />
          </TabPane>
          <TabPane
            tab={L(tabKeys.tabComment)}
            key={tabKeys.tabComment}
            disabled={!this.props.reservationStore.editReservation?.uniqueId}>
            <CommentList
              moduleId={moduleIds.reservation}
              parentId={this.props.reservationStore.editReservation?.uniqueId}
              commentStore={this.props.commentStore}
              sessionStore={this.props.sessionStore}
              isPrivate={false}
            />
          </TabPane>
          <TabPane
            tab={L(tabKeys.tabAuditLog)}
            key={tabKeys.tabAuditLog}
            disabled={!this.props.reservationStore.editReservation?.id}>
            <AuditLog
              moduleId={moduleIds.reservation}
              parentId={this.props.reservationStore.editReservation?.id}
              auditLogStore={this.props.auditLogStore}
            />
          </TabPane>
        </Tabs>
      </WrapPageScroll>
    ) : (
      <NoRole />
    )
  }
}

export default withRouter(ReservationDetail)
