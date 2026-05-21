import DataTable from '@components/DataTable'
import withRouter from '@components/Layout/Router/withRouter'
import { isGranted, L } from '@lib/abpUtility'
import AppConsts, { appPermissions } from '@lib/appconst'
import { renderOptions } from '@lib/helper'
import FeeStore from '@stores/fee/feeStore'
import Stores from '@stores/storeIdentifier'
import { Col, Input, Row, Select, Table } from 'antd'

import { inject, observer } from 'mobx-react'
import React from 'react'
import { columns } from './FilterPaymentMethod'
import PaymentMethodDetailModal from './PaymentMethodDetailModal'
const { activeStatus } = AppConsts
const Search = Input.Search
type Props = {
  feeStore: FeeStore
}

const PaymentMethodManagement = inject(Stores.FeeStore)(
  observer((props: Props) => {
    const [filter, setFilter] = React.useState({
      maxResultCount: 10,
      skipCount: 0,
      keyword: '',
      isActive: undefined
    })
    const [settingVisible, setSettingVisible] = React.useState(false)
    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1
    const handleSearch = async (name, value) => {
      const newFilter = { ...filter, [name]: value }
      setFilter(newFilter)
    }
    const handleTableChange = (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      setFilter(newFilter)
    }
    React.useEffect(() => {
      props.feeStore.getPaymentChannels()
    }, [])
    React.useEffect(() => {
      props.feeStore.getPaymentMethodList(filter)
    }, [filter])

    const openSettingModal = () => {
      setSettingVisible(!settingVisible)
    }

    const gotoDetail = (item?) => {
      props.feeStore.paymentMethodDetail = item?.id ? item : {}
      setSettingVisible(true)
    }

    const column = columns({
      title: L('CODE'),
      dataIndex: 'code',
      key: 'code',
      width: '10%',
      render: (code: string, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              onClick={() => isGranted(appPermissions.paymentSetting.detail) && gotoDetail(item)}
              className="link-text-table">
              <div>
                {code}
                <div className="text-muted small">{item.visitorReason?.name}</div>
              </div>
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}></Col>
        </Row>
      )
    })

    const keywordPlaceholder = L('PAYMENT_METHOD_KEYWORD_SEARCH')

    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Search
            maxLength={200}
            placeholder={keywordPlaceholder}
            onSearch={(value) => handleSearch('keyword', value)}
          />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('STATUS')}</label>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder={L('SELECT_STATUS')}
            optionFilterProp="children"
            onChange={(value) => handleSearch('isActive', value)}>
            {renderOptions(activeStatus)}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          onRefresh={() => handleSearch('', '')}
          title={L('PAYMENT_METHOD_LIST')}
          onCreate={() => gotoDetail(null)}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.feeStore.paymentMethodList?.totalCount ?? 0,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.paymentSetting.create}>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={column}
            pagination={false}
            loading={props.feeStore.isLoading}
            dataSource={props.feeStore.paymentMethodList?.items ?? []}
          />
        </DataTable>

        <PaymentMethodDetailModal feeStore={props.feeStore} visible={settingVisible} closeModal={openSettingModal} />
      </>
    )
  })
)

export default withRouter(PaymentMethodManagement)
