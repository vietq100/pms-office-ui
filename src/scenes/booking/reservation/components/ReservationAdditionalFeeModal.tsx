import * as React from 'react'
import Col from 'antd/es/col'
import DatePicker from 'antd/es/date-picker'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Modal from 'antd/es/modal'
import Row from 'antd/es/row'
import AppConsts, { timeFormat } from '@lib/appconst'
import { L, LError } from '@lib/abpUtility'
import { validateMessages } from '@lib/validation'
import ReservationStore from '@stores/booking/reservationStore'
import AppComponentBase from '@components/AppComponentBase'
import AmenityStore from '@stores/booking/amenityStore'
import { RowReservationModel } from '@models/Booking/reservationModel'
import { notifyError, renderDate } from '@lib/helper'
import CurrencyInput from '@components/Inputs/CurrencyInput'
import rules from './validation'

const { formVerticalLayout } = AppConsts
const { RangePicker } = DatePicker
const { TextArea } = Input

export interface IReservationAdditionalFeeFormProps {
  reservation: RowReservationModel
  reservationStore: ReservationStore
  amenityStore: AmenityStore
  visible: boolean
  onCancel: () => void
  onCreate: () => void
}

class ReservationAdditionalFeeModal extends AppComponentBase<IReservationAdditionalFeeFormProps> {
  formRef: any = React.createRef()
  state = {}

  componentWillUpdate(nextProps: Readonly<IReservationAdditionalFeeFormProps>): void {
    if (!this.props.visible && nextProps.visible) {
      if (this.props.reservationStore.editReservationAdditionalFee) {
        setTimeout(() => {
          this.formRef.current?.setFieldsValue({
            ...this.props.reservationStore.editReservationAdditionalFee
          })
        }, 100)
      }
    }
  }

  onSave = () => {
    const form = this.formRef.current
    const { reservation } = this.props
    if (!reservation) {
      notifyError(LError('ERROR'), LError('INVALID_RESERVATION_ADDITIONAL_SERVICE_USAGE_MODEL'))
      return
    }
    form.validateFields().then(async (values: any) => {
      await this.props.reservationStore.createAdditionalFee({
        id: reservation.id,
        ...values
      })
      this.props.onCreate()
    })
  }

  render() {
    const { visible, onCancel, reservation } = this.props
    return (
      <Modal
        open={visible}
        width={'80%'}
        cancelText={L('BTN_CANCEL')}
        okText={L('BTN_SAVE')}
        onCancel={onCancel}
        onOk={this.onSave}
        title={L('FORM_RESERVATION')}>
        <Form ref={this.formRef} validateMessages={validateMessages} layout={'vertical'} size="middle">
          <Row gutter={[16, 0]}>
            <Col sm={{ span: 8, offset: 0 }}>
              <label>{this.L('RESERVATION_RESIDENT')}</label>
              <Input disabled={true} value={reservation?.displayName} />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <label>{this.L('RESERVATION_RESIDENT_PHONE')}</label>
              <Input disabled={true} value={reservation?.phoneNumber} />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <label>{this.L('RESERVATION_RESIDENT_EMAIL')}</label>
              <Input disabled={true} value={reservation?.emailAddress} />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <label>{this.L('RESERVATION_UNIT')}</label>
              <Input disabled={true} value={reservation?.fullUnitCode} />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <label>{this.L('RESERVATION_AMENITY')}</label>
              <Input disabled={true} value={reservation?.amenity?.amenityName} />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <label>{this.L('RESERVATION_STATUS')}</label>
              <Input disabled={true} value={reservation?.status?.name} />
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <label>
                {this.L('RESERVATION_TIME_ON_DATE')} {renderDate(reservation.startDate)}
              </label>
              <RangePicker format={timeFormat} disabled className="full-width" value={reservation.fromToDate} />
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <label>{this.L('RESERVATION_DESCRIPTION')}</label>
              <TextArea autoSize={{ minRows: 2, maxRows: 2 }} disabled value={reservation?.description} />
            </Col>
            <Col sm={{ span: 8, offset: 0 }}>
              <Form.Item
                label={L('ADDITIONAL_SERVICE_USAGE_FEE')}
                {...formVerticalLayout}
                name="totalAdditionalServiceUsageFee"
                rules={rules.totalAdditionalServiceUsageFee}>
                <CurrencyInput></CurrencyInput>
              </Form.Item>
            </Col>
            <Col sm={{ span: 16, offset: 0 }}>
              <Form.Item
                label={L('ADDITIONAL_SERVICE_USAGE_DESCRIPTION')}
                {...formVerticalLayout}
                name="additionalServiceUsageDescription">
                <TextArea autoSize={{ minRows: 1, maxRows: 1 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

export default ReservationAdditionalFeeModal
