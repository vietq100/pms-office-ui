import { Col, Row } from 'antd'
import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined, TagOutlined, BarcodeOutlined } from '@ant-design/icons/lib'
import { renderDate, formatCurrency } from '@lib/helper'
import { IInventoryStockTypes } from '@models/Inventory/InventoryItemModel'

const columns = (self: any) => {
  return [
    {
      title: L('INVENTORY_ITEM'),
      dataIndex: 'inventory',
      key: 'inventory',
      width: '15%',
      render: (inventory: any, item: any) => (
        <Row>
          <Col sm={{ span: 24, offset: 0 }}>
            <div>
              <div
                className="full-name text-truncate text-link-to-detail"
                onClick={() => self.showViewStockModal(IInventoryStockTypes.stockIn, item.id)}>
                {inventory.name}
              </div>
              <div className="text-muted small d-flex flex-column">
                {inventory.code && (
                  <span>
                    <BarcodeOutlined className="mr-1" /> {inventory.code}
                  </span>
                )}
                <span>
                  <TagOutlined className="mr-1" /> {inventory.category?.parent ? inventory.category.parent.name : ''} -{' '}
                  {inventory.category ? inventory.category.name : ''}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      )
    },
    {
      title: L('INVENTORY_COMPANY'),
      dataIndex: 'company',
      key: 'company',
      width: '10%',
      render: (company) => <>{company?.companyName}</>
    },
    {
      title: L('INVENTORY_BRAND'),
      dataIndex: 'brand',
      key: 'brand',
      ellipsis: true,
      width: '10%',
      render: (brand) => <>{brand?.name}</>
    },
    {
      title: L('INVENTORY_QUANTITY'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '6%',
      render: (quantity) => <>{quantity}</>
    },
    {
      title: L('INVENTORY_UNIT_PRICE'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: '10%',
      render: (unitPrice) => <>{formatCurrency(unitPrice)}</>
    },
    {
      title: L('INVENTORY_TOTAL_VALUE'),
      dataIndex: 'cost',
      key: 'cost',
      width: '10%',
      render: (cost) => <>{formatCurrency(cost)}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '15%',
      ellipsis: true,
      render: (description) => description
    },
    {
      title: L('INVENTORY_UPDATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(row.inputDate)}
          <div>
            <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
          </div>
        </div>
      )
    }
  ]
}

export default columns
