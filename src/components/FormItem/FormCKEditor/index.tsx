import React from 'react'
import { Form } from 'antd'
import { L } from '@lib/abpUtility'
//import AppConsts from '@lib/appconst'
import CKEditorInput from '@components/Inputs/CKEditorInput'

//const { formVerticalLayout } = AppConsts
interface FormTextAreaProps {
  label: string
  name: string
  rule?
  rows?: number
}

const FormCKEditor: React.FC<FormTextAreaProps> = ({ label, name, rule }) => {
  return (
    <Form.Item
      label={L(label)}
      name={name}
      rules={rule}
      // {...formVerticalLayout}
    >
      <CKEditorInput />
    </Form.Item>
  )
}

export default FormCKEditor
