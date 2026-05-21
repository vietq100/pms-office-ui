import React from 'react'
import { Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import CurrencyInput from '@components/Inputs/CurrencyInput'

const { formVerticalLayout } = AppConsts
interface FormInputProps {
  label: string
  name: string | string[]
  min?: number
  max?: number
  disabled?: boolean
  rule?
  maxLength?: number
  hidden?: boolean
}

const FormCurrency: React.FC<FormInputProps> = ({ label, name, rule, disabled, min, max, maxLength, hidden }) => {
  return (
    <Form.Item hidden={hidden} label={L(label)} name={name} rules={rule} {...formVerticalLayout}>
      <CurrencyInput disabled={disabled} min={min} max={max} maxLength={maxLength} />
    </Form.Item>
  )
}

export default FormCurrency
