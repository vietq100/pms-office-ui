import { Col, Dropdown, Menu, Row, Table, Tag, Tooltip } from 'antd'
import { L } from '@lib/abpUtility'
import { EllipsisOutlined } from '@ant-design/icons/lib'
import { IPackageFee } from '@models/fee'
import orderBy from 'lodash/orderBy'
import './package-fee-list.less'
import { appPermissions } from '@lib/appconst'
import AppComponentBase from '@components/AppComponentBase'
import { renderDate } from '@lib/helper'

interface PackageFeeListProps {
  data: IPackageFee[]
  loading?: boolean
  total: number
  onEdit: (item: IPackageFee) => void
  onDelete: (id: number | undefined) => void
  onClose: (id: number | undefined, isClosed: boolean) => void
  onDeleteYear: (year: number | undefined) => void
  onPageChange: (page: number) => void
}

export class PackageFeeList extends AppComponentBase<PackageFeeListProps, any> {
  expandedRowRender = (record) => {
    return (
      <div style={{ marginTop: 2 }}>
        <Table
          bordered
          size="small"
          pagination={false}
          columns={this.columns}
          className="table-group custom-ant-table custom-ant-row"
          rowKey={(record: any) => record.id}
          dataSource={record.packages}
          scroll={{ x: 900, y: 800, scrollToFirstRowOnChange: true }}
        />
      </div>
    )
  }

  render() {
    const { data = [] } = this.props
    const sortData = orderBy(data, ['creationTime'], ['desc'])
    return (
      <div className="package-fee-list">
        <Table
          size={'middle'}
          dataSource={sortData}
          loading={this.props.loading}
          rowKey={(record: any) => record.year}
          columns={this.columnYears}
          scroll={{ x: 768, scrollToFirstRowOnChange: true }}
          expandable={{ expandedRowRender: this.expandedRowRender }}
          className="custom-ant-table custom-ant-row"
          pagination={false}
        />
      </div>
    )
  }

  onEdit = (item: IPackageFee) => () => this.props.onEdit(item)
  onDelete = (id: number | undefined) => () => this.props.onDelete(id)
  onClose = (id: number | undefined, isClosed: boolean) => () => this.props.onClose(id, isClosed)
  onDeleteYear = (year: number) => () => this.props.onDeleteYear(year)
  columnYears = [
    {
      title: L('PACKAGE_FEE_YEAR'),
      dataIndex: 'year',
      width: '15%',
      render: (year, record: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <div>{year}</div>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.feePackage.delete) && (
                    <Menu.Item onClick={this.onDeleteYear(record.year)}>{L('BTN_DELETE')}</Menu.Item>
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
      title: '',
      dataIndex: 'year',
      render: () => <></>
    }
  ]
  columns = [
    {
      title: L('PACKAGE_FEE_NAME'),
      dataIndex: 'name',
      width: '25%',
      render: (name, record: any) => (
        <Row className="justify-content-between">
          <Col sm={{ span: 22, offset: 0 }}>
            <div
              onClick={this.isGranted(appPermissions.feePackage.update) ? this.onEdit(record) : undefined}
              className="full-name text-link-to-detail text-truncate-2 link-text-table">
              <Tooltip title={name} trigger="contextMenu">
                <a className="link-text-table">{name}</a>
              </Tooltip>
            </div>
          </Col>
          <Col sm={{ span: 2, offset: 0 }} className="d-flex justify-content-end text-center">
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.feePackage.delete) && (
                    <Menu.Item onClick={() => this.props.onDelete(record.id)}>{L('BTN_DELETE')}</Menu.Item>
                  )}

                  {this.isGranted(appPermissions.feePackage.update) && (
                    <Menu.Item onClick={() => this.props.onClose(record.id, record.isClosed)}>
                      {L('BTN_CLOSE_PACKAGE')}
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
      title: L('PERIOD'),
      dataIndex: 'period',
      width: '25%',
      align: 'center' as const,
      render: (text, record) =>
        record.isClosed === true ? (
          <Tooltip title={`${text}/${record.year}`} trigger="contextMenu">
            <Tag className="cell-round mr-0 text-small" color="#f55f2d">
              {text}/{record.year}
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title={`${text}/${record.year}`} trigger="contextMenu">
            <Tag className="cell-round mr-0 text-small" color="#2db7f5">
              {text}/{record.year}
            </Tag>
          </Tooltip>
        )
    },
    {
      title: L('FROM_TO_DATE'),
      dataIndex: 'startDate',
      width: '15%',
      align: 'center' as const,
      render: (startDate) => <>{renderDate(startDate)}</>
    },
    {
      title: L('FROM_TO_DATE'),
      dataIndex: 'endDate',
      width: '15%',
      align: 'center' as const,
      render: (endDate) => <>{renderDate(endDate)}</>
    },
    {
      title: L('DESCRIPTION'),
      dataIndex: 'description',
      render: (text) => <div className="text-truncate-2">{text}</div>
    }
  ]
}
