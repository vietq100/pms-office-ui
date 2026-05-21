import { Col, Dropdown, Menu, Row } from 'antd'
import { L } from '@lib/abpUtility'
import { CalendarOutlined, UserOutlined, TagOutlined, BarcodeOutlined, EllipsisOutlined } from '@ant-design/icons/lib'
import { renderDate } from '@lib/helper'
import AppConst, { appPermissions } from '@lib/appconst'
import { IInventoryStockTypes } from '@models/Inventory/InventoryItemModel'

const { align } = AppConst

const columns = (self: any) => {
  return [
    {
      title: L('INVENTORY_ITEM'),
      dataIndex: 'inventory',
      key: 'inventory',
      width: '15%',
      render: (inventory, item: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <div>
              <div
                className="full-name text-truncate text-link-to-detail"
                onClick={() => self.showViewStockModal(IInventoryStockTypes.stockOut, item.id)}>
                <a className="link-text-table"> {inventory.name}</a>
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
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {self.isGranted(appPermissions.inventory.delete) && item.isActive === true && (
                    <Menu.Item onClick={() => self.activateOrDeactivate(item.id, !item.isActive)}>
                      {L(item.isActive ? 'BTN_DEACTIVATE' : 'BTN_ACTIVATE')}
                    </Menu.Item>
                  )}
                </Menu>
              }
              placement="bottomLeft">
              <button className="button-action-hiden-table-cell">
                <EllipsisOutlined />
              </button>
            </Dropdown>
          </Col>
        </Row>
      )
    },
    {
      title: L('INVENTORY_QUANTITY'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '8%',
      render: (quantity) => <>{quantity}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      key: 'description',
      width: '20%',
      ellipsis: true,
      render: (description) => description
    },
    {
      title: L('STATUS'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '10%',
      align: align.center,
      render: self.renderIsActive
    },
    {
      title: L('INVENTORY_UPDATED_AT'),
      dataIndex: 'creationTime',
      key: 'creationTime',

      ellipsis: true,
      render: (text, row) => (
        <div className="text-muted small">
          <CalendarOutlined className="mr-1" /> {renderDate(row.outputDate)}
          <div>
            <UserOutlined className="mr-1" /> {row.creatorUser?.displayName}
          </div>
        </div>
      )
    }
  ]
}

export default columns
