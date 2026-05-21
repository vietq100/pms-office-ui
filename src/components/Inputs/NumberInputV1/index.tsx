import React, { useEffect, useState } from 'react'
import { Input } from 'antd'
import { usePrevious } from '../../Hooks/usePrevious'
import isEqual from 'lodash/isEqual'
import { L } from '@lib/abpUtility'
import {
  getCursortPositionAfterFormatNumber,
  inputNumberFormatter,
  inputNumberParse,
  numberExponentToLarge
} from '@lib/helper'

interface NumberInputV1Props {
  value?: number | string
  onChange?: (value) => void
  onBlur?: (value) => void
  suffix?: React.ReactNode
  max?: number
  min?: number
  locale?: string
  disabled?: boolean
  placeholder?: string
  small?: boolean
  step?: number | string
}

const NumberInputV1: React.FC<NumberInputV1Props> = ({ value, onChange, disabled, placeholder, max }) => {
  const previousValue = usePrevious(value)
  const [currencyValue, setNumberValue] = useState(value)
  const [commaCount, setCommaCount] = useState(0)

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      setNumberValue(inputNumberFormatter(numberExponentToLarge(value)))
    }
  }, [previousValue, value])

  const onTextChange = (e) => {
    const num = Number(inputNumberParse(e.currentTarget.value))

    if (isNaN(num)) return

    const formatted = inputNumberFormatter(num)

    setNumberValue(formatted)
    getCursortPositionAfterFormatNumber(e, formatted, commaCount, setCommaCount)
    updateOnChange(e.currentTarget.value)
  }

  const triggerChange = (e) => {
    if (onChange) {
      onChange(inputNumberParse(e.currentTarget.value))
    }
  }

  const updateOnChange = (val) => {
    if (onChange) {
      onChange(Number(inputNumberParse(val)))
    }
  }

  return (
    <Input
      maxLength={max}
      value={currencyValue}
      disabled={disabled}
      placeholder={placeholder ? L(placeholder) : undefined}
      onBlur={triggerChange}
      onChange={onTextChange}
    />
  )
}

export default NumberInputV1
