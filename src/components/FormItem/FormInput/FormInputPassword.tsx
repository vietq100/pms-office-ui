import React from 'react'
import { Form, Input, InputProps } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { formVerticalLayout } = AppConsts
interface FormInputProps {
  label: string
  name: string | string[]
  rule?
  disabled?: boolean
  className?: string
  inputProps?: InputProps
  size?: 'middle' | 'small' | 'large'
}

const FormInputPassword: React.FC<FormInputProps> = ({ label, name, rule, disabled, className, inputProps, size }) => {
  return (
    <Form.Item label={L(label)} name={name} rules={rule} {...formVerticalLayout}>
      <Input.Password disabled={disabled} className={className} {...inputProps} size={size ?? 'middle'} />
    </Form.Item>
  )
}

export default FormInputPassword
