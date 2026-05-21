import { Col, Dropdown, Menu, Row, Table, Tag } from 'antd'
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
          className={'table-group'}
          rowKey={(record: any) => record.id}
          dataSource={record.packages}
          scroll={{ x: 900, scrollToFirstRowOnChange: true }}
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
      width: '15%',
      render: (name, record: any) => (
        <Row>
          <Col sm={{ span: 21, offset: 0 }}>
            <a
              onClick={this.isGranted(appPermissions.feePackage.update) ? this.onEdit(record) : undefined}
              className="link-text-table">
              <div>{name}</div>
            </a>
          </Col>
          <Col sm={{ span: 3, offset: 0 }}>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {this.isGranted(appPermissions.feePackage.delete) && (
                    <Menu.Item onClick={() => this.onDelete(record.id)}>{L('BTN_DELETE')}</Menu.Item>
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
      width: '10%',
      align: 'center' as const,
      render: (text, record) => (
        <Tag className="cell-round mr-0" color="#2db7f5">
          {text}/{record.year}
        </Tag>
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
      dataIndex: 'startDate',
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
