import React from 'react'
import { DatePicker, Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts, { dateFormat } from '@lib/appconst'
import { PickerProps } from 'antd/lib/date-picker/generatePicker'
import moment from 'moment-timezone/moment-timezone'
import dayjs from 'dayjs'

const { formVerticalLayout } = AppConsts
interface FormDatePickerProps {
  label?: string
  name: string | string[] | (string | number)[]
  rule?
  disabled?: boolean
  placeholder?: string
  dateTimeFormat?: string
  dateTimeProps?: PickerProps<moment>
  formItemClass?: string
  disabledDate?: any
  showTime?: boolean
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  label,
  name,
  rule,
  disabled,
  placeholder,
  dateTimeFormat = dateFormat,
  dateTimeProps,
  formItemClass,
  disabledDate
}) => {
  return (
    <Form.Item
      label={label ? L(label) : undefined}
      name={name}
      rules={rule}
      className={formItemClass}
      getValueProps={(value) => ({
        value: value ? dayjs(value) : null
      })}
      {...formVerticalLayout}>
      <DatePicker
        disabledDate={disabledDate}
        size="middle"
        className="full-width"
        format={[dateTimeFormat]}
        placeholder={placeholder ? L(placeholder) : ''}
        disabled={disabled}
        {...dateTimeProps}
      />
    </Form.Item>
  )
}

export default FormDatePicker
