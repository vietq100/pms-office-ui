import * as React from 'react'

import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { AppComponentListBase } from '@components/AppComponentBase'
import { L } from '@lib/abpUtility'
import { inject, observer } from 'mobx-react'
import Stores from '../../../../stores/storeIdentifier'
import { portalLayouts } from '@components/Layout/Router/router.config'
import ReservationStore from '../../../../stores/booking/reservationStore'
import AmenityStore from '../../../../stores/booking/amenityStore'
import moment from 'moment-timezone/moment-timezone'

import ReservationFormModal from './ReservationFormModal'
import ProjectStore from '@stores/project/projectStore'
import Avatar from 'antd/lib/avatar'
import debounce from 'lodash/debounce'
import { CustomEvent, DateCell, ToolbarCalendar, calendarViewNames } from '@components/Calendar'
import { notifyInfo } from '@lib/helper'
import { Spin } from 'antd'
import './ReservationCalendar.less'
import { appPermissions } from '@lib/appconst'
import NoRole from '@components/ComponentNoRole'

const localizer = momentLocalizer(moment)
const { Option } = Select

export interface ICalendarProps {
  navigate: any
  amenityStore: AmenityStore
  reservationStore: ReservationStore
  projectStore: ProjectStore
}

export interface ICalendarState {
  visible: boolean
  pageSize: number
  pageNumber: number
  filters: any
  editingEvent: any
  selectedProjectId?: number
  viewName?: string
}

@inject(Stores.ReservationStore)
@inject(Stores.AmenityStore)
@inject(Stores.ProjectStore)
@observer
class ReservationCalendar extends AppComponentListBase<ICalendarProps, ICalendarState> {
  formRef: any = React.createRef()

  state = {
    visible: false,
    pageSize: 10,
    pageNumber: 1,
    editingEvent: {},
    events: [],
    dates: [],
    filters: {
      fromDate: undefined,
      toDate: undefined,
      amenityId: undefined
    },
    selectedProjectId: undefined,
    viewName: 'month'
  }

  async componentDidMount() {
    this.isGranted(appPermissions.reservation.create) &&
      (await Promise.all([
        this.props.projectStore.filterOptions({}),
        this.props.reservationStore.getReservationStatus(),
        this.props.reservationStore.getReservationPaymentStatus(),
        this.getProjectAmenity('')
      ]))
  }

  getTimeSlot = async () => {
    await this.props.reservationStore.getBookingTimeSlots({
      ...this.state.filters
    })
  }

  refreshActivities = async () => {
    await this.getTimeSlot()
    this.hideOrShowReservationModal()
  }

  handleSearch = (name, value) => {
    const { filters } = this.state
    this.setState({ filters: { ...filters, [name]: value } }, async () => {
      await this.getTimeSlot()
    })
  }

  gotoDetail = (id) => {
    const { navigate } = this.props
    id ? navigate(portalLayouts.residentDetail.path.replace(':id', id)) : navigate(portalLayouts.residentCreate.path)
  }

  handleDateRangeChange = (range) => {
    let start, end
    if (range instanceof Array) {
      start = range[0]
      end = range[range.length - 1]
    } else {
      start = range.start
      end = range.end
    }

    if (!start || !end || !this.state.filters.amenityId) {
      return
    }

    // Check if month view selected -> reset time slot
    const numberDate = moment(end).diff(moment(start), 'days') + 1
    if (numberDate > 7) {
      this.setState(
        {
          filters: {
            ...this.state.filters,
            fromDate: undefined,
            toDate: undefined
          }
        },
        () => {
          this.props.reservationStore.timeSlots = []
        }
      )

      return
    }

    if (moment(start).isBefore(moment.now())) {
      start = moment.now()
    }

    // if there are not month view selected -> then get time slots by from, to date
    this.setState(
      {
        filters: {
          ...this.state.filters,
          fromDate: moment(start).startOf('day'),
          toDate: moment(end).endOf('day')
        }
      },
      this.getTimeSlot
    )
  }

  handleSelectDate = (slot) => {
    const { start } = slot
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (!this.state.filters.amenityId) {
      notifyInfo(L('INFORMATION'), L('PLEASE_SELECT_AMENITY_FOR_RESERVATION'))
      return
    }
    if (!start || start < now) {
      return
    }

    this.setState(
      {
        filters: {
          ...this.state.filters,
          fromDate: moment(start).startOf('day'),
          toDate: moment(start).endOf('day')
        }
      },
      this.getTimeSlot
    )
  }

  showReservationFormModal = async (bookingSlot) => {
    const {
      filters: { amenityId }
    } = this.state
    if (!bookingSlot || !amenityId) {
      return
    }

    const amenity = (this.props.amenityStore.amenities || []).find((item) => item.id === amenityId)
    this.props.reservationStore.createReservation(amenityId, bookingSlot, !amenity?.isNeedApprove)
    this.setState({ visible: !this.state.visible })
  }

  hideOrShowReservationModal = () => {
    this.setState({ visible: !this.state.visible })
  }

  getProjectAmenity = debounce(async (keyword) => {
    await this.props.amenityStore.getLists({ keyword, isActive: true })
  }, 100)

  handleSelectAmenity = (amenityId) => {
    this.setState({ filters: { ...this.state.filters, amenityId } }, this.getTimeSlot)
    const amenity = (this.props.amenityStore.amenities || []).find((item) => item.id === amenityId)
    this.props.reservationStore.setSelectedAmenityForReservation(amenity)
  }

  components = {
    toolbar: (props) => <ToolbarCalendar {...props} />,
    event: (props) => <CustomEvent {...props} onEventClick={this.showReservationFormModal} />,
    dateCellWrapper: DateCell
  }
  public render() {
    const {
      amenityStore: { amenities },
      reservationStore: { isLoading }
    } = this.props
    return this.isGranted(appPermissions.reservation.create) ? (
      <>
        <Card bordered={false} className="mb-3">
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Select
                className="full-width"
                showArrow
                showSearch
                filterOption={false}
                onChange={this.handleSelectAmenity}
                onSearch={this.getProjectAmenity}
                placeholder={L('PLEASE_SELECT_AMENITY_FOR_RESERVATION')}>
                {(amenities || []).map((option: any, index) => {
                  return (
                    <Option key={index} value={option.id}>
                      {option.iconPath && <Avatar src={option.iconPath} size={20} />} {option.amenityName}
                    </Option>
                  )
                })}
              </Select>
            </Col>
          </Row>
        </Card>
        <div
          id="reservation-calendar"
          className="ant-card"
          style={{ background: 'white', height: 'calc(100% - 120px)' }}>
          <Spin spinning={isLoading}>
            <Calendar
              className="flex-grow-1 card"
              localizer={localizer}
              events={this.props.reservationStore.timeSlots || []}
              startAccessor="start"
              endAccessor="end"
              themeSystem="bootstrap4"
              components={this.components}
              onRangeChange={this.handleDateRangeChange}
              views={[calendarViewNames.month, calendarViewNames.week, calendarViewNames.day]}
              selectable
              onShowMore={this.getTimeSlot}
              // popup
              onSelectSlot={this.handleSelectDate}
            />
            <ReservationFormModal
              visible={this.state.visible}
              reservationStore={this.props.reservationStore}
              amenityStore={this.props.amenityStore}
              projectStore={this.props.projectStore}
              onCancel={this.hideOrShowReservationModal}
              onCreate={this.refreshActivities}
              slots={this.props.reservationStore.timeSlots || []}
            />
          </Spin>
        </div>
      </>
    ) : (
      <NoRole />
    )
  }
}

export default ReservationCalendar
