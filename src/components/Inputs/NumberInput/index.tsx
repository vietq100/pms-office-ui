import React, { useEffect, useRef, useState } from 'react'
import Col from 'antd/lib/grid/col'
import Row from 'antd/lib/grid/row'
import { InputNumber } from 'antd'
import isEqual from 'lodash/isEqual'
import { inputNumberFormatter, inputNumberParse } from '@lib/helper'
import debounce from 'lodash/debounce'

interface NumberInputProps {
  value?: number
  onChange?: (value) => void
  onBlur?: (value) => void
  suffix?: React.ReactNode
  max?: number
  min?: number
  locale?: string
  disabled?: boolean
  placeholder?: string
  size?: any
}

const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  onBlur,
  suffix,
  disabled,
  min,
  max,
  placeholder,
  size
}) => {
  const previousValue = usePrevious(value)
  const [currencyValue, setNumberValue] = useState(value)

  useEffect(() => {
    if (!isEqual(previousValue, value)) {
      setNumberValue(value)
    }
  }, [value])

  const triggerChange = () => {
    if (onChange) {
      onChange(currencyValue)
    }
  }

  const onTextChange = debounce((e) => {
    setNumberValue(e)
    triggerChange()
  }, 100)

  const handleBlur = () => {
    triggerChange()
    if (onBlur) {
      onBlur(currencyValue)
    }
  }

  return (
    <Row>
      <Col flex="auto">
        <InputNumber
          className="full-width"
          value={currencyValue}
          onChange={onTextChange}
          formatter={(value) => inputNumberFormatter(value)}
          parser={(value) => inputNumberParse(value)}
          onBlur={handleBlur}
          disabled={disabled}
          min={min}
          max={max}
          placeholder={placeholder || ''}
          size={size ?? 'middle'}
        />
      </Col>
      {suffix && <Col style={{ alignSelf: 'center' }}>{suffix}</Col>}
    </Row>
  )
}

export default NumberInput
