import React, { useEffect, useRef, useState } from 'react'
import { Tag } from 'antd'
import isEqual from 'lodash/isEqual'
import { BookingSlotModel } from '@models/Booking/reservationModel'
import { formatCurrency, renderTime } from '@lib/helper'
import moment from 'moment-timezone/moment-timezone'

const { CheckableTag } = Tag

interface BookingSlotProps {
  value?: any
  onChange?: (value: any[]) => void
  slots: BookingSlotModel[]
  numberOfExtendSlot?: number
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const BookingSlotSelect: React.FC<BookingSlotProps> = ({ value = [], onChange, slots, numberOfExtendSlot = 3 }) => {
  const previousValue = usePrevious(value)
  const [currentValue, setCurrentValue] = useState(value)
  const [numberOfSelected, setNumberOfSelected] = useState(value.length ? 1 : 0)

  useEffect(() => {
    if (previousValue && !isEqual(previousValue, value)) {
      setCurrentValue(value)
      const { start, end } = value
      const selectedSlot = slots.filter((item) =>
        moment(item.start).isBetween(moment(start), moment(end), undefined, '[)')
      )
      setNumberOfSelected(selectedSlot.length)
    }
  }, [value])

  const updateSelectedSlot = (slot, checked) => {
    if (!slot || !slot.isAvailable || (checked && numberOfSelected >= numberOfExtendSlot)) {
      return
    }
    let { start, end } = currentValue

    if (checked) {
      if (!start && !end) {
        start = slot.start
        end = slot.end
      } else if (start === slot.end) {
        start = slot.start
      } else if (end === slot.start) {
        end = slot.end
      } else {
        return
      }
    } else {
      if (numberOfSelected === 1) {
        start = undefined
        end = undefined
      } else if (numberOfSelected > 1) {
        if (start === slot.start) {
          start = slot.end
        } else {
          end = slot.start
        }
      }
    }
    const selectedSlot = slots.filter((item) =>
      moment(item.start).isBetween(moment(start), moment(end), undefined, '[)')
    )
    setNumberOfSelected(selectedSlot.length)
    // Prepare & update selected booking slot
    const selectedStartSlot = selectedSlot.length ? selectedSlot[0] : undefined
    const selectedEndSlot = selectedSlot.length ? selectedSlot[selectedSlot.length - 1] : undefined

    triggerChange({
      start,
      end,
      startTimeZone: selectedStartSlot?.startTimeZone,
      endTimeZone: selectedEndSlot?.endTimeZone
    })
  }

  const triggerChange = (updateValue) => {
    setCurrentValue(updateValue)
    if (onChange) {
      onChange(updateValue)
    }
  }

  return (
    <div className="booking-slot-select">
      {slots.map((slot, index) => {
        const { start, end } = currentValue
        const isChecked =
          start && end ? moment(slot.start).isBetween(moment(start), moment(end), undefined, '[)') : false
        const isNotAllow = slot.isAvailable && numberOfExtendSlot && numberOfSelected >= numberOfExtendSlot
        const slotClassName = `booking-slot ${
          !slot.isAvailable ? 'unavailable' : isChecked ? 'selected' : isNotAllow ? 'not-allow' : 'available'
        }`

        return (
          <CheckableTag
            className={slotClassName}
            key={index}
            checked={isChecked}
            onChange={(checked) => updateSelectedSlot(slot, checked)}>
            <span>
              {renderTime(slot.start)} - {renderTime(slot.end)}
            </span>
            {slot.price != undefined && slot.price > 0 && (
              <div className="small">
                <b>{formatCurrency(slot.price || 0)}</b>
              </div>
            )}
          </CheckableTag>
        )
      })}
    </div>
  )
}

export default BookingSlotSelect
