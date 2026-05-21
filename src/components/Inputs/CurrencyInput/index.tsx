import React, { useEffect, useRef, useState } from 'react'
import { InputNumber } from 'antd'
import isEqual from 'lodash/isEqual'
import { inputCurrencyFormatter, inputCurrencyParse } from '../../../lib/helper'

interface CurrencyInputInputProps {
  value?: number
  onChange?: (value) => void
  max?: number
  min?: number
  symbol?: string
  locale?: string
  disabled?: boolean
  maxLength?: number
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const CurrencyInput: React.FC<CurrencyInputInputProps> = ({
  value,
  onChange,
  symbol = 'đ',
  disabled = false,
  maxLength,
  max
}) => {
  const previousValue = usePrevious(value)
  const [currencyValue, setCurrencyValue] = useState(value)

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      setCurrencyValue(value)
    }
  }, [value])

  const triggerChange = () => {
    if (onChange) {
      onChange(currencyValue)
    }
  }

  const onTextChange = (e) => {
    setCurrencyValue(e)
  }

  return (
    <InputNumber
      min={0}
      step={1}
      className="full-width"
      value={currencyValue}
      onChange={onTextChange}
      formatter={(value) => inputCurrencyFormatter(value, symbol)}
      parser={(value) => inputCurrencyParse(value, symbol)}
      onBlur={triggerChange}
      disabled={disabled}
      max={max}
      maxLength={maxLength}
      size="middle"
    />
  )
}

export default CurrencyInput
