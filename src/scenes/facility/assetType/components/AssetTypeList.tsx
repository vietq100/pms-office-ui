import { Col, Dropdown, Menu, Row, Table } from 'antd'
import { isGranted, L } from '@lib/abpUtility'
import orderBy from 'lodash/orderBy'
import { EllipsisOutlined } from '@ant-design/icons/lib'
import AppConsts, { appPermissions } from '@lib/appconst'

import SystemColumn from '@components/DataTable/columns'
import { renderDotActive } from '@lib/helper'
const { align } = AppConsts
export interface IAssetTypeList {
  data: any[]
  loading: boolean
  onEdit: (item: any) => void
  onActivateOrDeactivate: (id: number, isActive: boolean) => void
  //onPageChange: (page: number) => void,
  renderIsActive: any
}

export const AssetTypeList: any = ({ data = [], loading, onEdit, onActivateOrDeactivate }: IAssetTypeList) => {
  const sortData = orderBy(data, ['creationTime'], ['desc'])
  const columns = [
    {
      title: L(''),
      dataIndex: 'isActive',
      key: 'isActive',
      width: '2%',
      align: align.center,
      render: renderDotActive
    },
    {
      title: L('ASSET_TYPE_NAME'),
      key: 'assetTypeName',
      dataIndex: 'assetTypeName',
      width: '25%',
      ellipsis: true,
      render: (assetTypeName: string, item: any) => {
        return (
          <Row style={{ justifyContent: 'space-between' }}>
            <Col sm={{ span: 22, offset: 0 }} className="col-info">
              <div
                className="full-name text-truncate text-link-to-detail"
                onClick={() => {
                  isGranted(appPermissions.asset.detail) && onEdit(item)
                }}>
                <a className="link-text-table"> {assetTypeName}</a>
              </div>
            </Col>
            <Col sm={{ span: 2, offset: 0 }}>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {isGranted(appPermissions.asset.delete) && (
                      <Menu.Item onClick={() => onActivateOrDeactivate(item.id, !item.isActive)}>
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
      }
    },

    SystemColumn
  ]

  return (
    <div className="asset-type-list">
      <Table
        size={'middle'}
        dataSource={sortData}
        loading={loading}
        rowKey={(record: any) => record.id}
        columns={columns}
        scroll={{ x: 768, scrollToFirstRowOnChange: true }}
        className="custom-ant-table custom-ant-row"
        pagination={false}
      />
    </div>
  )
}
