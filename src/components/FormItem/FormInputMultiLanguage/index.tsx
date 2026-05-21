import React from 'react'
import { Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import MultiLanguageInput from '@components/Inputs/MultiLanguageInput'

const { formVerticalLayout } = AppConsts
interface FormInputMultiLanguageProps {
  label: string
  name: string | string[]
  rule?
  disabled?: boolean
}

const FormInputMultiLanguage: React.FC<FormInputMultiLanguageProps> = ({ label, name, rule }) => {
  return (
    <Form.Item label={L(label)} name={name} rules={rule} {...formVerticalLayout}>
      <MultiLanguageInput />
    </Form.Item>
  )
}

export default FormInputMultiLanguage
