import React from 'react'
import { L } from '@lib/abpUtility'
import AppConsts, { timeFormat } from '@lib/appconst'
import { PickerProps } from 'antd/lib/date-picker/generatePicker'
import moment from 'moment-timezone/moment-timezone'
import TimePicker from 'antd/es/time-picker'
import Form from 'antd/lib/form'

const { formVerticalLayout } = AppConsts
interface FormTimePickerProps {
  label: string
  name: string | string[]
  rule?
  disabled?: boolean
  placeholder?: string
  dateTimeProps?: PickerProps<moment>
}

const FormTimePicker: React.FC<FormTimePickerProps> = ({ label, name, rule, disabled, placeholder, dateTimeProps }) => {
  return (
    <Form.Item label={L(label)} name={name} rules={rule} {...formVerticalLayout}>
      <TimePicker
        size="middle"
        className="full-width"
        format={timeFormat}
        placeholder={placeholder ? L(placeholder) : ''}
        disabled={disabled}
        {...dateTimeProps}
      />
    </Form.Item>
  )
}

export default FormTimePicker
