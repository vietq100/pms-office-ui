import React from 'react'
import { Form, Select } from 'antd'
import { L } from '@lib/abpUtility'
import AppConsts from '@lib/appconst'
import { SelectProps, SelectValue } from 'antd/lib/select'
import { filterOptions, renderOptions } from '@lib/helper'
import { OptionModel } from '@models/global'

const { formVerticalLayout } = AppConsts
interface FormSelectProps {
  isFormVerticalLayout?: boolean
  label?: string
  name: string | (string | number)[]
  rule?
  options: OptionModel[]
  selectProps?: SelectProps<SelectValue>
  disabled?: boolean
  onChange?: (value: any, options: any | Array<any>) => void
  optionModal?: (item: any, index: any) => void
  formItemClass?: string
  placeholder?: string
  hidden?: boolean
  initialValue?: any
}

const FormSelect: React.FC<FormSelectProps> = ({
  isFormVerticalLayout = true,
  label,
  name,
  rule,
  options,
  selectProps,
  disabled,
  onChange,
  optionModal,
  formItemClass,
  placeholder,
  hidden,
  initialValue
}) => {
  return (
    <Form.Item
      label={label ? L(label) : undefined}
      name={name}
      hidden={hidden}
      rules={rule}
      initialValue={initialValue}
      className={formItemClass}
      {...(isFormVerticalLayout && { ...formVerticalLayout })}>
      <Select
        showSearch
        showArrow
        allowClear
        filterOption={filterOptions}
        className="full-width"
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        size="middle"
        {...selectProps}>
        {optionModal ? (options || []).map((item, index) => optionModal(item, index)) : renderOptions(options)}
      </Select>
    </Form.Item>
  )
}

export default FormSelect
