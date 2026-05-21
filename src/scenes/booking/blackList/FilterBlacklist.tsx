import { L } from '@lib/abpUtility'
import AppConsts, { dateFormat, rangePickerPlaceholder } from '@lib/appconst'
import { renderOptions } from '@lib/helper'
import amenityService from '@services/booking/amenityService'
import AmenityStore from '@stores/booking/amenityStore'
import { Col, DatePicker, Row } from 'antd'
import Select from 'antd/es/select'
import Search from 'antd/lib/input/Search'
import debounce from 'lodash/debounce'
import React from 'react'
const { activeStatus } = AppConsts
type Props = {
  handleSearch: any
  amenityStore: AmenityStore
}

const FilterBlacklist = (props: Props) => {
  React.useEffect(() => {
    searchAmenity('')
  }, [])
  const keywordPlaceholder = `${L('UNIT_NAME')}`
  const [amenities, setAmenities] = React.useState<any[]>([])
  const searchAmenity = async (keyword) => {
    const res = await amenityService.getSearchAmenity({ keyword })
    setAmenities(res.items.map((item) => ({ id: item.id, label: item.amenityName })))
  }

  return (
    <Row gutter={[16, 8]}>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_KEYWORD')}</label>
        <Search
          maxLength={200}
          placeholder={keywordPlaceholder}
          onSearch={(value) => props.handleSearch('keyword', value)}
        />
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('AMENITY')}</label>
        <Select
          allowClear
          showSearch
          showArrow
          filterOption={false}
          onSearch={debounce(searchAmenity, 300)}
          className="w-100"
          onChange={(value) => props.handleSearch('amenityIds', value)}
          mode="multiple">
          {renderOptions(amenities)}
        </Select>
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_BLOCK_TIME')}</label>
        <DatePicker.RangePicker
          className="w-100"
          format={dateFormat}
          placeholder={rangePickerPlaceholder()}
          onChange={(dates) => props.handleSearch('date', dates)}
        />
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_STATUS')}</label>
        <Select allowClear className="w-100" onChange={(value) => props.handleSearch('isActive', value)}>
          {renderOptions(activeStatus)}
        </Select>
      </Col>
    </Row>
  )
}

export default FilterBlacklist
