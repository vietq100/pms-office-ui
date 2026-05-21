import React from 'react'
import { Form, Input } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { formVerticalLayout } = AppConsts
interface FormTextAreaProps {
  label?: string
  name: string | string[] | (string | number)[]
  rule?
  rows?: number
  disabled?: boolean
  formItemClass?: string
  placeholder?: string
  maxLength?: number
  minLength?: number
}

const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  name,
  rule,
  rows,
  disabled,
  formItemClass,
  placeholder,
  maxLength,
  minLength
}) => {
  return (
    <Form.Item
      label={label ? L(label) : undefined}
      name={name}
      rules={rule}
      className={formItemClass}
      {...formVerticalLayout}>
      <Input.TextArea
        size="middle"
        rows={rows || 3}
        autoSize={{ minRows: 1, maxRows: rows ?? 3 }}
        disabled={disabled}
        placeholder={placeholder}
        minLength={minLength ? minLength : 0}
        maxLength={maxLength ? maxLength : 500}
      />
    </Form.Item>
  )
}

export default FormTextArea
