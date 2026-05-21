import React from 'react'
import { Form } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import Tooltip from 'antd/es/tooltip'
import QuestionCircleOutlined from '@ant-design/icons/lib/icons/QuestionCircleOutlined'
import NumberInputV1 from '@components/Inputs/NumberInputV1'

const { formVerticalLayout } = AppConsts
interface FormNumberProps {
  label?: string
  name: string | string[]
  rule?
  suffix?: any
  min?: number
  max?: number
  precision?: number
  tooltip?: string
  disabled?: boolean
  formItemClass?: string
  placeholder?: string
  onChange?: any
  initialValue?: any
}

const FormNumber: React.FC<FormNumberProps> = ({
  label,
  name,
  rule,
  suffix,
  min,
  max,
  tooltip,
  disabled,
  formItemClass,
  placeholder,
  onChange,
  initialValue
}) => {
  return (
    <Form.Item
      initialValue={initialValue}
      label={
        label ? (
          <>
            {L(label)}
            {tooltip ? (
              <Tooltip title={tooltip}>
                <QuestionCircleOutlined className="mx-1" />
              </Tooltip>
            ) : null}
          </>
        ) : undefined
      }
      name={name}
      rules={rule}
      className={formItemClass}
      {...formVerticalLayout}>
      <NumberInputV1
        suffix={suffix}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
      />
    </Form.Item>
  )
}

export default FormNumber
