import DataTable from '@components/DataTable'
import { portalLayouts } from '@components/Layout/Router/router.config'
import withRouter from '@components/Layout/Router/withRouter'
import { isGranted, L } from '@lib/abpUtility'
import { appPermissions } from '@lib/appconst'
import ShopProductStore from '@stores/member/shopProduct/shopProductList'
import Stores from '@stores/storeIdentifier'
import { Col, Row, Select, Table } from 'antd'
import Search from 'antd/lib/input/Search'
import { inject, observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import getColumns from './columns'
const { Option } = Select

interface Props {
  shopProductStore: ShopProductStore
  navigate: any
  params: any
}

const ProductList = inject(Stores.ShopProductStore)(
  observer((props: Props) => {
    const [filter, setFilter] = useState({
      maxResultCount: 10,
      skipCount: 0,
      isActive: true,
      IsPublished: true
    })
    const currentPage = () => Math.floor(filter.skipCount / filter.maxResultCount) + 1
    const getAllProduct = async () => {
      await props.shopProductStore.getAll(filter)
    }

    const getProductCategory = async () => await props.shopProductStore.getProductCategory()
    useEffect(() => {
      if (!props.shopProductStore.productCategory[0]) {
        getProductCategory()
      }
      getAllProduct()
    }, [])
    const keywordPlaceholder = `${L('SHOP_OWNER_FULL_NAME')}, ${L('SHOP_OWNER_EMAIL')}`
    const filterComponent = (
      <Row gutter={[16, 8]}>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_KEYWORD')}</label>
          <Search placeholder={keywordPlaceholder} onSearch={(value) => handleSearch('keyword', value)} />
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_CATEGORY')}</label>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder="Select a category"
            optionFilterProp="children"
            onChange={(value) => handleSearch('ProductCategoryId', value)}>
            {props.shopProductStore.productCategory.map((item) => {
              if (item.targetName === 'Category') {
                return (
                  <Option value={item.id} key={item.id}>
                    {item.code}
                  </Option>
                )
              } else return null
            })}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_PRODUCTTYPE')}</label>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder="Select a category"
            optionFilterProp="children"
            onChange={(value) => handleSearch('ProductTypeId', value)}>
            {props.shopProductStore.productCategory.map((item) => {
              if (item.targetName === 'ProductType') {
                return (
                  <Option value={item.id} key={item.id}>
                    {item.code}
                  </Option>
                )
              } else return null
            })}
          </Select>
        </Col>
        <Col sm={{ span: 6, offset: 0 }}>
          <label>{L('FILTER_PRODUCT_PUBLISHED')}</label>
          <Select
            allowClear
            className="w-100"
            showSearch
            placeholder="Select a category"
            optionFilterProp="children"
            defaultValue="true"
            onChange={(value) => handleSearch('IsPublished', value === 'true')}>
            <Option value="false">{L('UNPUBLISHED')}</Option>
            <Option value="true">{L('PUBLISHED')}</Option>
          </Select>
        </Col>
      </Row>
    )
    const handleSearch = async (name, value) => {
      const newFilter = { ...filter, [name]: value }
      setFilter(newFilter)
      await props.shopProductStore.getAll({
        ...filter,
        [name]: value
      })
    }

    const gotoDetail = (id) => {
      id
        ? props.navigate(portalLayouts.shopProductDetail.path.replace(':id', id))
        : props.navigate(portalLayouts.shopProductCreate.path)
    }
    const handleTableChange = async (pagination: any) => {
      const newFilter = {
        ...filter,
        skipCount: (pagination.current - 1) * filter.maxResultCount
      }
      await setFilter(newFilter)
      await getAllProduct()
    }

    const columns = getColumns({
      title: L('PRODUCT_NAME'),
      dataIndex: 'name',
      key: 'name',

      width: '20%',
      render: (text: string, item: any) => (
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <div
              className="full-name text-truncate text-link-to-detail"
              onClick={isGranted(appPermissions.product.update) ? () => gotoDetail(item.id) : undefined}>
              <a className="link-text-table"> {text}</a>
            </div>
          </Col>
        </Row>
      )
    })
    return (
      <>
        <DataTable
          extraFilterComponent={filterComponent}
          title={L('SHOP_PRODUCT_LIST')}
          onCreate={() => gotoDetail(null)}
          pagination={{
            pageSize: filter.maxResultCount,
            current: currentPage(),
            total:
              props.shopProductStore.shopProductList === undefined
                ? 0
                : props.shopProductStore.shopProductList.totalCount,
            onChange: handleTableChange
          }}
          createPermission={appPermissions.product.create}>
          <Table
            size="middle"
            scroll={{ x: 1000, y: 500 }}
            className="custom-ant-table custom-ant-row"
            rowKey={(record) => record.id}
            columns={columns}
            pagination={false}
            loading={props.shopProductStore.isLoading}
            dataSource={
              props.shopProductStore.shopProductList === undefined ? [] : props.shopProductStore.shopProductList.items
            }
          />
        </DataTable>
      </>
    )
  })
)

export default withRouter(ProductList)
