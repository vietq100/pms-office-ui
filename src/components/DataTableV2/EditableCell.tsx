import * as React from 'react'
import { InputNumber, Form, Checkbox, Input, DatePicker, TimePicker } from 'antd'

import CurrencyInput from '@components/Inputs/CurrencyInput'
import Select from 'antd/lib/select'

import TextArea from 'antd/lib/input/TextArea'

import { dateFormat, timeDateFormat, timeFormat } from '@lib/appconst'
import PercentInput from '@components/Inputs/PercentInput'
import { filterOptions, inputNumberFormatter } from '@lib/helper'
import { L } from '@lib/abpUtility'
import dayjs from 'dayjs'

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean
  dataIndex: string
  title: any
  inputType:
    | 'number'
    | 'percent'
    | 'checkbox'
    | 'text'
    | 'date'
    | 'datetime'
    | 'datetimeInterval'
    | 'timeInterval'
    | 'currency'
    | 'select'
    | 'textarea'
    | 'multiSelect'
  record: any
  index: number
  children: React.ReactNode
  options: any[]
  required: boolean
  allowPastDates?: boolean
  lastDayOfPeriod?: string
  onSearch?: (value) => void
  onchange?: (value) => void
  onBlur?: (value) => void
  locale?: string
  symbol?: string
  minuteStep?: boolean
  dateDisabled?: any
}

export const buildEditableCell = (
  record,
  inputType,
  dataIndex,
  title,
  isEditing,
  options?,
  required?,
  allowPastDates?,
  lastDayOfPeriod?,
  dateDisabled?,
  onSearch?,
  onchange?,
  onBlur?,
  locale?,
  symbol?
) => ({
  record,
  inputType,
  dataIndex,
  title,
  editing: isEditing(record),
  options,
  required,
  allowPastDates,
  lastDayOfPeriod,
  dateDisabled,
  onSearch,
  onchange,
  onBlur,
  locale,
  symbol
})

export const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  children,
  options,
  required,
  onSearch,
  onchange,
  onBlur,
  locale,
  symbol,
  dateDisabled,
  ...restProps
}) => {
  const disabledDate = (current) => {
    if (!dateDisabled?.startDate || !dateDisabled?.endDate) return false
    return current < dayjs(dateDisabled.startDate).startOf('day') || current > dayjs(dateDisabled.endDate).endOf('day')
  }
  let inputNode
  switch (inputType) {
    case 'multiSelect': {
      inputNode = (
        <Select className="full-width" mode="multiple">
          {(options || []).map((option, index) => (
            <Select.Option key={index} value={option.value || option.id}>
              {option.label || option.name || option.ipName}
            </Select.Option>
          ))}
        </Select>
      )
      break
    }
    case 'number': {
      inputNode = <InputNumber min={0} formatter={(value) => inputNumberFormatter(value)} className="full-width" />
      break
    }
    case 'percent': {
      inputNode = <PercentInput onChange={onBlur} />
      break
    }
    case 'checkbox': {
      inputNode = <Checkbox onChange={onBlur} defaultChecked={record[dataIndex]} />
      break
    }
    case 'currency': {
      inputNode = <CurrencyInput locale={locale} symbol={symbol} />
      break
    }
    case 'date': {
      inputNode = <DatePicker size="middle" className="full-width" format={dateFormat} disabledDate={disabledDate} />
      break
    }
    case 'timeInterval': {
      inputNode = <TimePicker size="middle" className="full-width" minuteStep={15} format={timeFormat} />
      break
    }
    case 'datetime': {
      inputNode = (
        <DatePicker disabledDate={disabledDate} size="middle" className="full-width" showTime format={timeDateFormat} />
      )
      break
    }
    case 'datetimeInterval': {
      inputNode = (
        <DatePicker
          disabledDate={disabledDate}
          size="middle"
          className="full-width"
          showTime
          format={timeDateFormat}
          minuteStep={15}
        />
      )
      break
    }
    case 'textarea': {
      inputNode = <TextArea size="middle" autoSize={{ maxRows: 5 }} />
      break
    }
    case 'select': {
      inputNode = (
        <Select
          size="middle"
          className="full-width"
          showSearch
          showArrow
          allowClear
          filterOption={onSearch ? undefined : filterOptions}
          onSearch={onSearch}
          onChange={() => onchange}>
          {(options || []).map((option, index) => (
            <Select.Option key={index} value={option.value || option.id}>
              {option.label || option.name || option.ipName || option.projectName || option.periodName}
            </Select.Option>
          ))}
        </Select>
      )
      break
    }

    default: {
      inputNode = <Input size="middle" />
    }
  }
  return (
    <td {...restProps}>
      {editing ? (
        inputType === 'checkbox' ? (
          <Form.Item
            messageVariables={{
              label: L(title)
            }}
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required }]}
            // label={title}
            valuePropName="checked">
            <div>{inputNode}</div>
          </Form.Item>
        ) : (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required }]}
            messageVariables={{
              label: L(title)
            }}>
            {inputNode}
          </Form.Item>
        )
      ) : (
        children
      )}
    </td>
  )
}
