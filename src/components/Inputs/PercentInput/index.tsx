import React, { useEffect, useRef, useState } from 'react'
import { InputNumber } from 'antd'
import isEqual from 'lodash/isEqual'
import { inputPercentFormatter, inputPercentParse } from '../../../lib/helper'

interface PercentInputProps {
  value?: number
  onChange?: (value) => void
  max?: number
  min?: number
  symbol?: string
  locale?: string
  disabled?: boolean
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const PercentInput: React.FC<PercentInputProps> = ({ value, onChange, disabled }) => {
  const previousValue = usePrevious(value)
  const [currencyValue, setCurrencyValue] = useState(value)

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      setCurrencyValue(value)
    }
  }, [value])

  const triggerChange = () => {
    if (onChange) {
      const updateValue = currencyValue
        ? currencyValue > 100
          ? 100
          : currencyValue < 0
          ? 0
          : currencyValue
        : currencyValue
      onChange(updateValue)
    }
  }

  const onTextChange = (e) => {
    setCurrencyValue(e)
  }

  return (
    <InputNumber
      size="middle"
      className="full-width"
      value={currencyValue}
      disabled={disabled}
      onChange={onTextChange}
      formatter={(value) => inputPercentFormatter(value)}
      parser={(value) => inputPercentParse(value)}
      onBlur={triggerChange}
      min={0}
      max={100}
    />
  )
}

export default PercentInput
