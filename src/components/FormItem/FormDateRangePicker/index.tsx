import React from 'react'
import { DatePicker, Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts, { dateFormat, rangePickerPlaceholder } from '@lib/appconst' //
import { RangePickerProps } from 'antd/lib/date-picker/generatePicker'
import moment from 'moment-timezone/moment-timezone'

const { formVerticalLayout } = AppConsts
interface FormDatePickerProps {
  label: string
  name: string | string[]
  rule?
  disabled?: [boolean, boolean]
  placeholder?: [string, string] | undefined
  dateTimeFormat?: string
  dateTimeProps?: RangePickerProps<moment>
}

const FormDateRangePicker: React.FC<FormDatePickerProps> = ({
  label,
  name,
  rule,
  disabled,
  dateTimeFormat = dateFormat,
  dateTimeProps
}) => {
  return (
    <Form.Item label={L(label)} name={name} rules={rule} {...formVerticalLayout}>
      <DatePicker.RangePicker
        className="full-width"
        format={dateTimeFormat}
        disabled={disabled}
        {...dateTimeProps}
        size="middle"
        placeholder={rangePickerPlaceholder}
      />
    </Form.Item>
  )
}

export default FormDateRangePicker
