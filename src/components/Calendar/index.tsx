import { renderTime } from '@lib/helper'
import Button from 'antd/es/button'
import { navigate } from 'react-big-calendar/lib/utils/constants'
import { L } from '@lib/abpUtility'
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  ExclamationCircleFilled,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons/lib'
import moment from 'moment-timezone/moment-timezone'

export const calendarViewNames = {
  month: 'month',
  day: 'day',
  week: 'week'
}

const handleEventClick = (e, onEventClick) => {
  if (!e.isAvailable) {
    return
  }

  onEventClick(e)
}

export const CustomEvent = (props) => {
  const { event, onEventClick } = props || {}
  const itemClass = `text-center ant-tag booking-slot ${
    event.isAvailable ? 'available' : event.isMaintenance ? 'maintenance-slot' : 'unavailable'
  }`
  return (
    <div className={itemClass} onClick={() => handleEventClick(event, onEventClick)}>
      {event.isMaintenance ? (
        <span className="text-danger">
          <ExclamationCircleFilled /> {L('MAINTENANCE')}
        </span>
      ) : (
        <>
          {renderTime(event.start)} - {renderTime(event.end)}
        </>
      )}
    </div>
  )
}

export const MonthEvent = ({ event: e, onEventClick }) => {
  const itemClass = `text-center ant-tag booking-slot ${e.isAvailable ? 'available' : 'unavailable'}`
  return (
    <div className={itemClass} onClick={() => handleEventClick(e, onEventClick)}>
      {renderTime(e.start)} - {renderTime(e.end)}
    </div>
  )
}

export const DayEvent = ({ event: e, onEventClick }) => {
  const itemClass = `text-center ant-tag booking-slot ${e.isAvailable ? 'available' : 'unavailable'}`
  return (
    <div className={itemClass} onClick={() => handleEventClick(e, onEventClick)}>
      {renderTime(e.start)} - {renderTime(e.end)}
    </div>
  )
}

export const AgendaEvent = ({ event: e, onEventClick }) => {
  const itemClass = `text-center ant-tag booking-slot ${e.isAvailable ? 'available' : 'unavailable'}`
  return (
    <div className={itemClass} onClick={() => handleEventClick(e, onEventClick)}>
      {renderTime(e.start)} - {renderTime(e.end)}
    </div>
  )
}

export const DateCell = ({ value, children }) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const clazzName = `${children.props?.className} ${value < now ? 'date-in-past' : ''}`
  return <div className={clazzName}>{children}</div>
}

export const ToolbarCalendar = (props) => {
  const {
    date,
    onNavigate,
    label,
    views,
    localizer: { messages },
    onView
  } = props

  const previousYear = moment(date).subtract(1, 'years').toDate()
  const nextYear = moment(date).add(1, 'years').toDate()

  return (
    <div className="d-flex px-3 mb-2 mt-2">
      <div style={{ flex: 1, display: 'flex' }} className="mr-3"></div>
      <h5 className="mb-0 mx-3 ml-auto" style={{ display: 'flex', alignItems: 'center' }}>
        {label}
      </h5>
      <div className="text-right" style={{ flex: 1 }}>
        <>
          <Button onClick={() => onNavigate(navigate.TODAY)} size="small" type="text">
            {L('TODAY')}
          </Button>
          <Button onClick={() => onNavigate(navigate.PREVIOUS, previousYear)} size="small" type="text">
            <DoubleLeftOutlined />
          </Button>
          <Button onClick={() => onNavigate(navigate.PREVIOUS)} size="small" type="text">
            <LeftOutlined />
          </Button>
          <Button onClick={() => onNavigate(navigate.NEXT)} size="small" type="text">
            <RightOutlined />
          </Button>
          <Button onClick={() => onNavigate(navigate.NEXT, nextYear)} size="small" type="text">
            <DoubleRightOutlined />
          </Button>
        </>
        {views.length > 1 && (
          <>
            {views.map((name) => (
              <Button key={name} onClick={() => onView(name)} size="small" type="text">
                {messages[name]}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
