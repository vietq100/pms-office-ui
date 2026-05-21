import React from 'react'
import { Checkbox, Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { formVerticalLayout } = AppConsts
interface FormCheckboxProps {
  label: string
  name: string | string[]
  rule?
  disabled?: boolean
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, name, rule }) => {
  return (
    <Form.Item name={name} rules={rule} valuePropName="checked" {...formVerticalLayout}>
      <Checkbox>{L(label)} </Checkbox>
    </Form.Item>
  )
}

export default FormCheckbox
