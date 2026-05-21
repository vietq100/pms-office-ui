import { L } from '@lib/abpUtility'
import { dateFormat } from '@lib/appconst'
import { renderOptions } from '@lib/helper'
import handoverService from '@services/handover/handoverService'
import staffService from '@services/member/staff/staffService'
import HandoverStore from '@stores/handover/handoverStore'
import DatePicker from 'antd/es/date-picker'
import Select from 'antd/es/select'
import Col from 'antd/lib/col'
import Search from 'antd/lib/input/Search'
import Row from 'antd/lib/row'
import debounce from 'lodash/debounce'
import React from 'react'

type Props = {
  handleSearch: any
  handoverStore: HandoverStore
  filter: any
  onChange: any
}

const FilterHandoverProcess = (props: Props) => {
  const [assignedUser, setAssignedUser] = React.useState<any[]>([])
  const [titleOptions, setTitleOptions] = React.useState<any[]>([])
  const [buildingOptions, setBuildingOptions] = React.useState<any[]>([])
  const [floorOptions, setFloorOptions] = React.useState<any[]>([])

  const handleChangeBuilding = async (buildingIds): Promise<any[]> => {
    const res = await handoverService.getListFloor({ buildingIds })

    // setFloorOptions(res)
    // return res

    const result = res.map((a) => {
      return { name: a.buildingCode + ' - ' + a.name, id: a.id }
    })
    setFloorOptions(result)
    return result
  }

  const searchTitleOptions = async (keyword?) => {
    const res = await handoverService.getHandoverSuggest(keyword)
    setTitleOptions(res)
  }
  const getUser = async (keyword?) => {
    const res = await staffService.getAll({ keyword })
    return res.items
  }
  const searchAssignedUser = async (keyword?) => {
    const res = await getUser(keyword)
    setAssignedUser(res)
  }
  const keywordPlaceholder = L('NAME_UNIT')
  React.useEffect(() => {
    searchAssignedUser('')
    searchTitleOptions('')
    getBuildingOption('')
    getFloorOption('')
  }, [])
  const getBuildingOption = async (keyword) => {
    const res = await handoverService.getListBuilding({ keyword })
    setBuildingOptions(res)
  }
  const getFloorOption = async (keyword) => {
    const buildingIds = props.filter.buildingIds
    const res = await handoverService.getListFloor({ keyword, buildingIds })

    const result = res.map((a) => {
      return { name: a.buildingCode + ' - ' + a.name, id: a.id }
    })
    setFloorOptions(result)
    // return result
  }

  // api/services/app/HandoverPlans/GetSuggests
  return (
    <Row gutter={[16, 8]}>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_KEYWORD')}</label>
        <Search
          maxLength={200}
          placeholder={keywordPlaceholder}
          onSearch={(value) => props.handleSearch('keyword', value)}
          onChange={(value) => props.onChange('keyword', value.target.value)}
        />
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('STATUS')}</label>
        <Select
          showArrow
          allowClear
          className="w-100"
          showSearch
          placeholder={L('SELECT_STATUS')}
          optionFilterProp="children"
          onChange={(value) => props.handleSearch('statusIds', value)}
          mode="multiple">
          {renderOptions(props.handoverStore.reservationHandoverStatus)}
        </Select>
      </Col>

      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_HANDOVER_TITLE')}</label>
        <Select
          allowClear
          className="w-100"
          showSearch
          placeholder={L('SELECT_HANDOVER_TITLE')}
          optionFilterProp="children"
          onChange={(value) => props.handleSearch('handoverId', value)}
          onSearch={debounce(searchTitleOptions, 300)}>
          {(titleOptions || []).map((opt, index) => (
            <Select.Option key={index} value={opt.id}>
              {opt.title}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_HANDOVER_ASSIGNER')}</label>
        <Select
          allowClear
          showArrow
          className="w-100"
          showSearch
          placeholder={L('SELECT_ASSIGNER')}
          optionFilterProp="children"
          onChange={(value) => props.handleSearch('assignUserIds', value)}
          onSearch={debounce(searchAssignedUser, 300)}
          mode="multiple">
          {(assignedUser || []).map((user, index) => (
            <Select.Option key={index} value={user.id}>
              {user.displayName}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_HANDOVER_TIME')}</label>
        <DatePicker.RangePicker
          className="w-100"
          format={dateFormat}
          onChange={(dates) => props.handleSearch('date', dates)}
        />
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_HANDOVER_RESERVATION_DATE')}</label>
        <DatePicker.RangePicker
          className="w-100"
          format={dateFormat}
          onChange={(dates) => props.handleSearch('reservationDate', dates)}
        />
      </Col>

      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_HANDOVER_BUILDING')}</label>
        <Select
          allowClear
          showArrow
          className="w-100"
          showSearch
          placeholder={L('FILTER_HANDOVER_BUILDING')}
          optionFilterProp="children"
          onChange={(value) => {
            props.handleSearch('buildingIds', value)
            handleChangeBuilding(value)
          }}
          onSearch={debounce(getBuildingOption, 300)}
          mode="multiple">
          {renderOptions(buildingOptions)}
        </Select>
      </Col>
      <Col sm={{ span: 6, offset: 0 }}>
        <label>{L('FILTER_HANDOVER_FLOORS')}</label>
        <Select
          allowClear
          showArrow
          className="w-100"
          showSearch
          placeholder={L('FILTER_HANDOVER_FLOORS')}
          optionFilterProp="children"
          onChange={(value) => props.handleSearch('floorIds', value)}
          onSearch={debounce(getFloorOption, 300)}
          mode="multiple">
          {renderOptions(floorOptions)}
        </Select>
      </Col>
    </Row>
  )
}

export default FilterHandoverProcess
