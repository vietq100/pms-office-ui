import * as React from 'react'
import { Button, Col, Pagination, Row } from 'antd'
import { FilterFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { isGranted, L } from '../../lib/abpUtility'
import './DataTable.less'

export interface IDataTableProps {
  title?: string
  textAddNew?: string
  onCreate?: () => void
  pagination?: any
  createPermission?: string
  actionGroups?: () => React.ReactNode
  onRefresh?: () => void
  showChangePageSize?: boolean
  filterComponent?: any
  showTableTitle?: boolean
  extraFilterComponent?: React.ReactNode
  actionAfterTitle?: any
  noneFilter?: boolean
  children?: React.ReactNode
  renderActions?: () => React.ReactNode
}

const DataTable: React.FunctionComponent<IDataTableProps> = ({
  title,
  textAddNew,
  onCreate,
  pagination,
  onRefresh,
  createPermission,
  actionGroups,
  showChangePageSize,
  filterComponent,
  showTableTitle,
  extraFilterComponent,
  noneFilter = false,
  actionAfterTitle,
  ...props
}) => {
  const [openFilter, setOpenFilter] = React.useState(true)
  const handleCreate = () => {
    onCreate && onCreate()
  }
  const handleOnChange = (page, pageSize) => {
    if (pagination.onChange) {
      pagination.onChange({ current: page, pageSize: pageSize })
    }
  }

  const handleOpenFilter = () => {
    setOpenFilter(!openFilter)
  }

  return (
    <>
      {!noneFilter && (
        <Row className={'table-header'}>
          {openFilter && extraFilterComponent && (
            <Col sm={{ span: 24, offset: 0 }}>
              <div className="my-2">{extraFilterComponent}</div>
            </Col>
          )}
          <Col flex="auto">{filterComponent}</Col>

          {showTableTitle && (
            <Col sm={{ span: 8, offset: 0 }} className="title">
              {showTableTitle && <h3 className="mr-3 text-truncate">{title}</h3>}
              {actionAfterTitle && actionAfterTitle}
            </Col>
          )}

          <Col
            className="text-right d-flex align-items-end justify-content-end"
            flex={filterComponent ? '100px' : 'auto'}>
            {extraFilterComponent && (
              <Button
                type="primary"
                shape="circle"
                className="mr-1"
                size="middle"
                icon={<FilterFilled />}
                onClick={handleOpenFilter}
              />
            )}
            {actionGroups && actionGroups()}
            {onRefresh && (
              <Button type="primary" shape="circle" className="mr-1" icon={<ReloadOutlined />} onClick={onRefresh} />
            )}
            {onCreate && (!createPermission || isGranted(createPermission)) && (
              <Button type="primary" shape="circle" className="mr-1" icon={<PlusOutlined />} onClick={handleCreate}>
                {textAddNew}
              </Button>
            )}
          </Col>
        </Row>
      )}
      {props.children}
      {pagination && pagination.total > 0 && (
        <Row className="mt-3 pb-3">
          <Col sm={{ span: 24, offset: 0 }} style={{ textAlign: 'end' }}>
            <Pagination
              size="small"
              showTotal={(total) => L('TOTAL_{0}_ITEMS', total)}
              {...pagination}
              onChange={handleOnChange}
              showSizeChanger={!!showChangePageSize}
              pageSizeOptions={[10, 20, 50, 100, 500]}
            />
          </Col>
        </Row>
      )}
    </>
  )
}

export default DataTable
