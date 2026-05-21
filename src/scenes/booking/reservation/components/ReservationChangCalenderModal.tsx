import { L, LError } from '@lib/abpUtility'
import { Col, Form, Modal, Calendar, Radio, RadioChangeEvent } from 'antd'
import React from 'react'
import { FormInstance } from 'antd/lib/form'
import { validateMessages } from '@lib/validation'
import { OptionModel } from '@models/global'
import ReservationStore from '@stores/booking/reservationStore'
import moment from 'moment'
import { dateTimeFormat, timeFormat } from '@lib/appconst'
interface Props {
  reservationStore: ReservationStore
  amenity: any
  visible: boolean
  onClose: () => void
  onOk: (startDate, endDate) => Promise<any>
}

interface State {
  loading: boolean
  userOptions: OptionModel[]
  paymentChannels: any
  timeSlots: any
  selectedTimeSlot: any
  selectDate: any
  checked: boolean
  disabled: boolean
}

export default class ReservationChangCalenderModal extends React.PureComponent<Props, State> {
  form = React.createRef<FormInstance>()

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      userOptions: [],
      paymentChannels: [],

      timeSlots: [],
      selectDate: { startDate: '', endDate: '' },
      selectedTimeSlot: { fromDate: '', toDate: '' },
      checked: false,
      disabled: false
    }
  }

  handleSelectHandoverDate = async (date) => {
    const res =
      (await this.props.reservationStore.getBookingTimeSlots({
        amenityId: this.props.amenity.amenityId,
        fromDate: date.format('YYYY/MM/DD'),
        toDate: date.format('YYYY/MM/DD')
      })) || []
    this.setState({ timeSlots: res })
  }
  onSave = async () => {
    await this.form.current?.validateFields()

    try {
      if (this.state.selectedTimeSlot.fromDate === '' || this.state.selectedTimeSlot.toDate === '') {
        return this.form.current?.setFields([
          {
            name: 'selectedTimeSlot',
            errors: [LError('PLEASE_SELECT_TIME_SLOT')]
          }
        ])
      } else {
        await this.props.reservationStore.update({
          ...this.props.reservationStore.editReservation,
          startDate: this.state.selectDate.startDate,
          endDate: this.state.selectDate.endDate,
          fromToDate: [this.state.selectedTimeSlot.fromDate, this.state.selectedTimeSlot.toDate]
        })
        this.setState({
          selectDate: {
            startDate: '',
            endDate: ''
          }
        })
        this.setState({
          selectedTimeSlot: {
            fromDate: '',
            toDate: ''
          }
        })
        this.props.onClose()
      }
    } catch {
      this.setState({ loading: false })
    }
  }

  // onChange = (e: RadioChangeEvent) => {
  //   this.setState({ fromDate: e.target.value[0] }),
  //     this.setState({ toDate: e.target.value[1] })
  // }
  render(): React.ReactNode {
    const { visible, onClose } = this.props

    return (
      <Modal
        open={visible}
        destroyOnClose
        title={L('RESERVATION_CALENDER_CHANGE_TIME_BOOKING')}
        cancelText={L('RESERVATION_CALENDER_BTN_CANCEL')}
        onCancel={onClose}
        onOk={this.onSave}
        confirmLoading={this.state.loading}>
        <Form layout="vertical" ref={this.form} validateMessages={validateMessages} size="middle">
          <>
            <Col sm={{ span: 24, offset: 0 }}>
              <label>{L('RESERVATION_CALENDER_CHANGE_BOOKING_DATE')}</label>
              <Calendar fullscreen={false} onSelect={this.handleSelectHandoverDate} />
            </Col>
            <Col sm={{ span: 24, offset: 0 }}>
              <label className="d-block">{L('RESERVATION_CALENDER_SLOT')}</label>
              <div className="my-3">
                <Radio.Group
                  onChange={(e: RadioChangeEvent) => {
                    this.setState({
                      selectDate: {
                        startDate: e.target.value.startTime,
                        endDate: e.target.value.endTime
                      }
                    })
                    this.setState({
                      selectedTimeSlot: {
                        fromDate: e.target.value.startTime,
                        toDate: e.target.value.endTime
                      }
                    })
                  }}>
                  {this.state.timeSlots.map((slot, index) => {
                    // return (
                    //   <span
                    //     className="mt-2 mr-3 p-2 pointer d-inline-block"
                    //     key={index}
                    //     onClick={() => {
                    // this.setState({
                    //   selectDate: {
                    //     startDate: moment(slot.startTime),
                    //     endDate: moment(slot.endTime)
                    //   }
                    // })
                    // this.setState({
                    //   selectedTimeSlot: {
                    //     fromDate: slot.startTime,
                    //     toDate: slot.endTime
                    //   }
                    // })
                    //     }}>
                    //     <CheckBox className="mr-2" />
                    // {moment(slot.startTime).format(dateTimeFormat)} -{' '}
                    // {moment(slot.endTime).format(timeFormat)}
                    //   </span>
                    // )

                    return (
                      <Radio key={index} value={slot}>
                        {' '}
                        {moment(slot.startTime).format(dateTimeFormat)} - {moment(slot.endTime).format(timeFormat)}
                      </Radio>
                    )
                  })}
                </Radio.Group>
              </div>
              <Form.Item name="selectedTimeSlot">
                <input className="d-none" />
              </Form.Item>
            </Col>
          </>
        </Form>
      </Modal>
    )
  }
}
