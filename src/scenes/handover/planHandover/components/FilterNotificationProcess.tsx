import Filter from '@components/Filter'
import { L } from '@lib/abpUtility'
import handoverService from '@services/handover/handoverService'
import HandoverStore from '@stores/handover/handoverStore'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import Col from 'antd/lib/col'
import Search from 'antd/lib/input/Search'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import debounce from 'lodash/debounce'
import React from 'react'
import { useParams } from 'react-router-dom'
type Props = {
  handleSearch: any
  handoverStore: HandoverStore
}

const FilterNotificationProcess = (props: Props) => {
  const [unitOptions, setUnitOptions] = React.useState<any[]>([])
  React.useEffect(() => {
    searchUnit('')
  }, [])
  const params: any = useParams()
  const searchUnit = async (keyword) => {
    const res = await handoverService.searchUnit({
      keyword,
      handoverId: params.id
    })
    setUnitOptions(res)
  }
  const keywordPlaceholder = L('NAME')
  return (
    <Filter title={L('FILTER')} handleRefresh={() => props.handleSearch()}>
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 12, offset: 0 }}>
          <Search placeholder={keywordPlaceholder} onSearch={(value) => props.handleSearch('keyword', value)} />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <Checkbox onChange={(e) => props.handleSearch('sendToEmailState', !e.target.checked)} className="mt-1">
            <label>{L('UN_RECEIVED_EMAIL')}</label>
          </Checkbox>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder={L('UNIT')}
            filterOption={false}
            onSearch={debounce(searchUnit)}
            onChange={(value) => props.handleSearch('unitId', value)}>
            {unitOptions.map((item, index) => (
              <Select.Option key={index} value={item.id}>
                {item.fullUnitCode}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </Filter>
  )
}

export default FilterNotificationProcess
