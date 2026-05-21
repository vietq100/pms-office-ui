import React, { useEffect, useState } from 'react'
import { Select } from 'antd'
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import residentService from '@services/member/resident/residentService'
import unitService from '@services/project/unitService'
import assetService from '@services/facility/assetService'

const { Option } = Select

interface AsyncSelectProps {
  type: number
  value?: number
  filters?: any
  onChange?: (value, option) => void
  fieldName?: string
  fieldValue?: string
  fieldSecondaryInfo?: string
  disabled?: boolean
  alreadyAsset?: any[]
}

export const asyncSelectType = {
  resident: 1,
  unit: 2,
  asset: 3
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
  type,
  value,
  filters,
  disabled,
  fieldName = 'name',
  fieldValue = 'id',
  fieldSecondaryInfo,
  onChange,
  alreadyAsset
}) => {
  const [options, setOptions] = useState([])
  const [lastFilters, setLastFilters] = useState({})

  useEffect(() => {
    if (!isEqual(lastFilters, filters)) {
      setLastFilters(filters)
      handleSearch('')
    }
  }, [filters])

  const triggerChange = (value, option) => {
    if (onChange) {
      onChange(value, option)
    }
  }

  let handleSearch = debounce(async (keyword) => {
    switch (type) {
      case asyncSelectType.resident: {
        const results = await residentService.filterOptions({
          keyword,
          ...(filters || {})
        })
        setOptions((results || []) as any)
        break
      }

      case asyncSelectType.asset: {
        const results = await assetService.filterOptions({
          keyword,
          ...(filters || {})
        })
        setOptions((results || []) as any)
        break
      }

      default: {
        const results = await unitService.filterOptions({
          keyword,
          ...(filters || {})
        })
        setOptions((results || []) as any)
      }
    }
  }, 300)

  handleSearch = debounce(handleSearch, 300)

  return (
    <Select
      showSearch
      allowClear
      filterOption={false}
      style={{ width: '100%' }}
      onChange={triggerChange}
      onSearch={(text) => handleSearch(text)}
      disabled={disabled}
      value={value}>
      {(options || []).map((item: any, index) => {
        const disabled = alreadyAsset?.filter((i) => i.value === item.id).length ?? false
        return (
          <Option key={index} value={item[fieldValue]} disabled={disabled}>
            {item[fieldName]}
            {fieldSecondaryInfo && <div className="text-muted small">{item[fieldSecondaryInfo]}</div>}
          </Option>
        )
      })}
    </Select>
  )
}
