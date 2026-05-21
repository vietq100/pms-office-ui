import React from 'react'
import { Form, Radio } from 'antd'
import AppConsts from '@lib/appconst'
import { OptionModel } from '@models/global'
import { L } from '@lib/abpUtility'

const { formVerticalLayout } = AppConsts
interface FormRadioButtonProps {
  label?: any
  name: string | string[]
  rule?
  disabled?: boolean
  options: OptionModel[]
  onChange?: any
}

const FormRadioButton: React.FC<FormRadioButtonProps> = ({ label, name, rule, disabled, options, onChange }) => {
  return (
    <Form.Item name={name} rules={rule} {...formVerticalLayout} label={label}>
      <Radio.Group onChange={onChange} disabled={disabled}>
        {options.map((option, index) => (
          <Radio key={index} value={option.id || option.value}>
            {L(option.label)}
          </Radio>
        ))}
      </Radio.Group>
    </Form.Item>
  )
}

export default FormRadioButton
