import React from 'react'
import { L } from '@lib/abpUtility'

interface FormSelectProps {
  label: string
  value: string | number
  selectedValue?: string
  icon?: string
  onChange: (value) => void
}

const SelectBoxItem: React.FC<FormSelectProps> = ({ label, value, selectedValue, icon: Icon, onChange }) => {
  const wrapClass = value === selectedValue ? 'select-box-item selected' : 'select-box-item'
  return (
    <div className={wrapClass} onClick={() => onChange(value)}>
      {Icon ? <Icon /> : ''}
      <div className="label">{L(label)}</div>
    </div>
  )
}

export default SelectBoxItem
