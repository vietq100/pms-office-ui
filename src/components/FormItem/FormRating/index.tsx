import React from 'react'
import { Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import Rate from 'antd/lib/rate'

const { formVerticalLayout } = AppConsts
interface FormRatingProps {
  label: string
  name: string | string[]
  rule?
  disabled?: boolean
}

const FormRating: React.FC<FormRatingProps> = ({ label, name, rule, disabled }) => {
  return (
    <Form.Item label={L(label)} name={name} rules={rule} {...formVerticalLayout}>
      <Rate disabled={disabled} />
    </Form.Item>
  )
}

export default FormRating
