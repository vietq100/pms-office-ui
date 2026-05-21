import React from 'react'
import { Form, Switch } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { formVerticalLayout } = AppConsts
interface FormInputProps {
  label: string
  name: string | string[]
  rule?
  defaultChecked?: boolean
  onChange?: (value) => void
  disabled?: boolean
}

const FormSwitch: React.FC<FormInputProps> = ({ label, name, rule, defaultChecked, onChange, disabled = false }) => {
  return (
    <Form.Item label={L(label)} name={name} rules={rule} valuePropName="checked" {...formVerticalLayout}>
      <Switch disabled={disabled} onChange={onChange} defaultChecked={defaultChecked} />
    </Form.Item>
  )
}

export default FormSwitch
