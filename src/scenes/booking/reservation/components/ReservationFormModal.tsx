import * as React from 'react'
import Col from 'antd/es/col'
import DatePicker from 'antd/es/date-picker'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import AppConsts, { timeFormat } from '@lib/appconst'
import { L } from '@lib/abpUtility'
import rules from './validation'
import { validateMessages } from '@lib/validation'
import ReservationStore from '@stores/booking/reservationStore'
import ProjectStore from '@stores/project/projectStore'
import HomeOutlined from '@ant-design/icons/HomeOutlined'
import PhoneOutlined from '@ant-design/icons/PhoneOutlined'
import UserOutlined from '@ant-design/icons/UserOutlined'
import Avatar from 'antd/lib/avatar'
import AppComponentBase from '@components/AppComponentBase'
import AmenityStore from '@stores/booking/amenityStore'
import BookingSlotSelect from '@components/Select/BookingSlotSelect'
import { BookingSlotModel } from '@models/Booking/reservationModel'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import debounce from 'lodash/debounce'
import Radio from 'antd/lib/radio'

const { RangePicker } = DatePicker
const { formVerticalLayout } = AppConsts
const { TextArea } = Input
const { Option } = Select

export interface IReservationFormProps {
  reservationStore: ReservationStore
  projectStore: ProjectStore
  amenityStore: AmenityStore
  visible: boolean
  onCancel: () => void
  onCreate: () => void
  slots: BookingSlotModel[]
}

class ReservationFormModal extends AppComponentBase<IReservationFormProps> {
  formRef: any = React.createRef()
  state = { unitUserOptions: [] }

  componentDidMount = async () => {
    await this.props.reservationStore.createReservation()
    this.formRef.current?.setFieldsValue({
      ...this.props.reservationStore.editReservation
    })
  }

  componentWillUpdate(nextProps: Readonly<IReservationFormProps>): void {
    if (!this.props.visible && nextProps.visible) {
      if (this.props.reservationStore.editReservation) {
        setTimeout(() => {
          this.formRef.current?.setFieldsValue({
            ...this.props.reservationStore.editReservation
          })
        }, 100)
      }
      if (!this.props.projectStore.unitUserOptions || !this.props.projectStore.unitUserOptions.length) {
        this.findUnitResidents('')
      }
    }
  }

  findUnitResidents = debounce(async (keyword, changeProject?) => {
    if (changeProject) {
      this.formRef.current.setFieldsValue({
        unitUserId: undefined,
        userId: undefined,
        unit: undefined,
        fullUnitCode: '',
        workflow: { assignedId: undefined }
      })
    }
    await this.props.projectStore.filterUnitUserOptions({ keyword })
    this.setState({ unitUserOptions: this.props.projectStore.unitUserOptions })
  }, 200)

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
      fullUnitCode: resident?.fullUnitCode,
      displayName: resident?.displayName,
      emailAddress: resident?.emailAddress,
      phoneNumber: resident?.phoneNumber
    })
  }

  onSave = () => {
    const form = this.formRef.current
    form.validateFields().then(async (values: any) => {
      if (this.props.reservationStore.editReservation?.id) {
        await this.props.reservationStore.update({
          ...this.props.reservationStore.editReservation,
          ...values,
          isMonthlyPackage: values.isMonthlyPackage === 'true'
        })
      } else {
        await this.props.reservationStore.create({
          ...values,
          isMonthlyPackage: values.isMonthlyPackage === 'true'
        })
      }
      await this.props.reservationStore.createReservation()
      this.formRef.current?.setFieldsValue({
        ...this.props.reservationStore.editReservation
      })
      form.resetFields()
      this.props.onCreate()
    })
  }

  render() {
    const {
      visible,
      onCancel,
      reservationStore: { editReservation, listStatus, listPaymentStatus, amenityForReservation },
      projectStore: { unitUserOptions },
      amenityStore: { amenities }
    } = this.props
    const displayStatus = listStatus.map((item) => ({
      value: item.statusCode,
      label: item.name
    }))
    const displayPaymentStatus = listPaymentStatus.map((item) => ({
      value: item.paymentStatusCode,
      label: item.name
    }))

    return (
      <Modal
        open={visible}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={() => {
          this.formRef.current.resetFields()
          onCancel()
        }}
        onOk={this.onSave}
        title={L('FORM_RESERVATION')}
        width="75%"
        confirmLoading={this.props.reservationStore.isLoading}>
        <Form ref={this.formRef} validateMessages={validateMessages} layout={'vertical'} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item
                label={L('RESERVATION_RESIDENT')}
                {...formVerticalLayout}
                name="unitUserId"
                rules={rules.unitUserId}>
                <Select
                  showSearch
                  allowClear
                  filterOption={false}
                  className="full-width"
                  onSearch={this.findUnitResidents}
                  onChange={this.updateUnitResident}>
                  {(unitUserOptions || []).map((option, index) => {
                    return (
                      <Option key={index} value={option.optionValue}>
                        {option.displayName}
                        <div className="text-muted small" style={{ display: 'flex' }}>
                          <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                            <HomeOutlined className="mr-1" />
                            {option.fullUnitCode}
                          </span>

                          <span className="mr-2 text-truncate" style={{ flex: 1 }}>
                            {option.emailAddress && option.emailAddress.length && (
                              <>
                                <UserOutlined className="mr-1" />
                                {option.userName}
                              </>
                            )}
                          </span>
                          <span className={'text-truncate'} style={{ flex: 1 }}>
                            {option.phoneNumber && option.phoneNumber.length && (
                              <>
                                <PhoneOutlined className="mr-1" />
                                {option.phoneNumber}
                              </>
                            )}
                          </span>
                        </div>
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>
              <Form.Item name="userId" rules={rules.userId} className="d-none">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('RESERVATION_UNIT')} {...formVerticalLayout} name="fullUnitCode" rules={rules.unitId}>
                <Input disabled={true} />
              </Form.Item>
              <Form.Item name="unitId" rules={rules.unitId} className="d-none">
                <Input />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('RESERVATION_RESIDENT_DISPLAY_NAME')} {...formVerticalLayout} name="displayName">
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('RESERVATION_RESIDENT_PHONE')} {...formVerticalLayout} name="phoneNumber">
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('RESERVATION_RESIDENT_EMAIL')} {...formVerticalLayout} name="emailAddress">
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('RESERVATION_AMENITY')} {...formVerticalLayout} name="amenityId">
                <Select style={{ width: '100%' }} showArrow disabled>
                  {(amenities || []).map((option: any, index) => {
                    return (
                      <Option key={index} value={option.id}>
                        {option.iconPath && <Avatar src={option.iconPath} size={20} />} {option.amenityName}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col sm={{ span: 12, offset: 0 }}>
              <Form.Item label={L('RESERVATION_STATUS')} {...formVerticalLayout} name="status" rules={rules.statusId}>
                <Select className="full-width" disabled>
                  {this.renderOptions(displayStatus)}
                </Select>
              </Form.Item>
            </Col>
            {amenityForReservation?.isUseDeposited && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('AMENITY_DEPOSIT_AMOUNT')} {...formVerticalLayout} name="depositAmount">
                  <CurrencyInput disabled={true}></CurrencyInput>
                </Form.Item>
              </Col>
            )}
            {amenityForReservation?.isMonthlyPackage && (
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('AMENITY_MONTHLY_PACKAGE')} name="isMonthlyPackage" initialValue={'true'}>
                  <Radio.Group>
                    <Radio value="true">{L('IS_MONTHLY_PACKAGE')}</Radio>
                    <Radio value="false">{L('ISNT_MONTHLY_PACKAGE')}</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            )}
            {editReservation.amenity?.isUseDeposited && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item
                  label={L('RESERVATION_PAYMENT_STATUS')}
                  {...formVerticalLayout}
                  name="paymentStatus"
                  rules={rules.paymentStatusId}>
                  <Select className="full-width">{this.renderOptions(displayPaymentStatus)}</Select>
                </Form.Item>
              </Col>
            )}
            {editReservation.id && (
              <Col sm={{ span: 12, offset: 0 }}>
                <Form.Item label={L('RESERVATION_TIME')} {...formVerticalLayout} name="fromToDate">
                  <RangePicker format={timeFormat} disabled className="full-width" />
                </Form.Item>
              </Col>
            )}
            {!editReservation.id && (
              <Col sm={{ span: 24, offset: 0 }}>
                <Form.Item label={L('RESERVATION_TIME')} {...formVerticalLayout} name="bookingSlot">
                  <BookingSlotSelect slots={this.props.slots || []} />
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
      </Modal>
    )
  }
}

export default ReservationFormModal
