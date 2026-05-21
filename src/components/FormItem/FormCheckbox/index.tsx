import React, { ReactNode } from 'react'
import { Checkbox, Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'

const { formVerticalLayout } = AppConsts
interface FormCheckboxProps {
  label: string
  name: string | string[]
  rule?
  disabled?: boolean
  onChange?: any
  formItemClass?: string
  extra?: ReactNode
  initialValue?: boolean
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
  label,
  name,
  rule,
  onChange,
  formItemClass,
  extra,
  initialValue,
  disabled
}) => {
  return (
    <Form.Item
      name={name}
      rules={rule}
      valuePropName="checked"
      className={formItemClass}
      extra={extra}
      dependencies={['feeGroups']}
      initialValue={initialValue}
      {...formVerticalLayout}>
      <Checkbox disabled={disabled} onChange={onChange}>
        {L(label)}{' '}
      </Checkbox>
    </Form.Item>
  )
}

export default FormCheckbox
