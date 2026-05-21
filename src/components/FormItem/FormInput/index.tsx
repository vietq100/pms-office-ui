import React from 'react'
import { Form, Input } from 'antd'
import AppConsts from '@lib/appconst'
import { L } from '@lib/abpUtility'

const { formVerticalLayout } = AppConsts
interface FormInputProps {
  isFormVerticalLayout?: boolean
  label?: string
  name: string | string[] | (string | number)[]
  rule?
  disabled?: boolean
  onChange?: any
  formItemClass?: string
  placeholder?: string
  hidden?: boolean
  style?: any
}

const FormInput: React.FC<FormInputProps> = ({
  isFormVerticalLayout = true,
  label,
  name,
  rule,
  disabled,
  onChange,
  formItemClass,
  placeholder,
  hidden,
  style
}) => {
  return (
    <Form.Item
      label={label ? L(label) : null}
      name={name}
      rules={rule}
      className={formItemClass}
      hidden={hidden}
      {...(isFormVerticalLayout && { ...formVerticalLayout })}>
      <Input
        disabled={disabled}
        onChange={onChange}
        size="middle"
        placeholder={placeholder ? L(placeholder) : undefined}
        style={style}
      />
    </Form.Item>
  )
}

export default FormInput
