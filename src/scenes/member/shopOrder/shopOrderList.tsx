import { CaretRightOutlined, EditOutlined } from '@ant-design/icons'
import DataTable from '@components/DataTable'
import { portalLayouts } from '@components/Layout/Router/router.config'
import { isGranted, L } from '@lib/abpUtility'
import AppConsts, { appPermissions, dateFormat } from '@lib/appconst'
import ShopProductStore from '@stores/member/shopProduct/shopProductList'
import ShopOrderStore from '@stores/member/shopOrderStore/shopOrderList'
import Stores from '@stores/storeIdentifier'
import { Button, Col, Collapse, DatePicker, Popover, Row, Select, Table } from 'antd'
import Search from 'antd/lib/input/Search'
import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import getColumns from './columns'
import './shopOrder.less'
import { StatisticItem } from '@components/Statisitc/StatisticItem'
import withRouter from '@components/Layout/Router/withRouter'
import { convertFilterDate } from '@lib/helper'

const { Option } = Select
const { align } = AppConsts
const { RangePicker } = DatePicker

interface Props {
  shopProductStore: ShopProductStore
  shopOrderStore: ShopOrderStore
  navigate: any
  params: any
}

interface filterProps {
  maxResultCount: number
  skipCount: number
  FromDate?: string
  ToDate?: string
}

const ShopOrderList = inject(
  Stores.ShopProductStore,
  Stores.ShopOrderStore
)(
  observer((props: Props) => {
    const [filter, setFilter] = useState<filterProps>({
      maxResultCount: 10,
      skipCount: 0
    })
    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1
    const handleSearchDate = async (dateString) => {
      const newFilter = convertFilterDate(filter, dateString)
      setFilter(newFilter)
      await props.shopOrderStore.getAllMyOrder(newFilter)
    }
    const handleSearch = async (name, value) => {
      const newFilter = { ...filter, [name]: value }
      setFilter(newFilter)
      await props.shopOrderStore.getAllMyOrder({
        ...filter,
        [name]: value
      })
    }

    const getAllMyOrder = async () => {
      await props.shopOrderStore.getAllMyOrder(filter)
    }

    const getOrderStatus = async () => await props.shopOrderStore.getOrderStatus()

    useEffect(() => {
      if (!props.shopOrderStore.orderStatus[0]) getOrderStatus()
      getAllMyOrder()
    }, [])

    const gotoDetail = (id) => {
      if (id) {
        props.navigate(portalLayouts.shopOrderDetail.path.replace(':id', id))
      }
      return
    }
    const handleTableChange = async (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      await setFilter(newFilter)
      await getAllMyOrder()
    }
    const columns = getColumns({
      title: L('ACTIONS'),
      dataIndex: 'operation',
      key: 'operation',
      fixed: align.right,
      align: align.right,
      width: 90,
      render: (text: string, item: any) => (
        <div>
          {isGranted(appPermissions.shopOwner.update) && (
            <Popover trigger="hover" content={'EDIT_STAFF'}>
              <Button
                size="small"
                className="ml-1"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => {
                  gotoDetail(item.id)
                  props.shopOrderStore.activeMessageTab(false)
                }}
              />
            </Popover>
          )}
        </div>
      )
    })
    const keywordPlaceholder = `${L('ID')}, ${L('CUSTOMER_NAME')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Search placeholder={keywordPlaceholder} onSearch={(value) => handleSearch('keyword', value)} />
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_ORDER_CREATE_TIME')}</label>
          <RangePicker className="w-100" format={dateFormat} onChange={(dates) => handleSearchDate(dates)} />
        </Col>
        <Col sm={{ span: 8, offset: 0 }}>
          <label>{L('FILTER_ORDER_STATUS')}</label>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder={L('SELECT_STATUS')}
            optionFilterProp="children"
            onChange={(value) => handleSearch('StatusId', value)}>
            {props.shopOrderStore.orderStatus.map((order) => {
              return (
                <Option value={order.id} key={order.id}>
                  {L(order.code)}
                </Option>
              )
            })}
          </Select>
        </Col>
      </Row>
    )
    return (
      <>
        {' '}
        <Collapse
          defaultActiveKey={['0']}
          ghost
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
          <Collapse.Panel className="overview-collapse" header={<strong>{L('OVERVIEW')}</strong>} key="1">
            <div className="shop-order-dashboard mb-3">
              {props.shopOrderStore.orderStatus[0] &&
                props.shopOrderStore.orderStatus.map((order, index) => {
                  const iconUrl = `assets/icons/${order.code}.svg`
                  return (
                    <StatisticItem
                      description={L(order.code)}
                      value={order.count}
                      key={index}
                      color={order.colorCode}
                      iconUrl={iconUrl}
                    />
                  )
                })}
            </div>
          </Collapse.Panel>
        </Collapse>
        <DataTable
          extraFilterComponent={filterComponent}
          title={L('SHOP_ORDER_LIST')}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total: props.shopOrderStore.shopOrderList === undefined ? 0 : props.shopOrderStore.shopOrderList.totalCount,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.shopOwner.create}>
          <Table
            size="middle"
            className="custom-ant-table"
            scroll={{ x: 1000, y: 500 }}
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={props.shopOrderStore.isLoading}
            dataSource={
              props.shopOrderStore.shopOrderList === undefined ? [] : props.shopOrderStore.shopOrderList.items
            }
          />
        </DataTable>
      </>
    )
  })
)

export default withRouter(ShopOrderList)
