import React from 'react'
import { Button, Col, Pagination, Row } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import { isGranted, L } from '../../lib/abpUtility'
import './DataTable.less'

export interface IDataTableProps {
  title?: string
  keywordPlaceholder?: string
  textAddNew?: string
  onCreate?: () => void
  onCopy?: () => void
  pagination?: any
  createPermission?: string
  handleRefresh?: (key, value) => void
  actionComponent?: () => void
  children: React.ReactNode
}

const DataTable: React.FunctionComponent<IDataTableProps> = ({
  textAddNew,
  onCreate,
  onCopy,
  pagination,
  createPermission,
  actionComponent,
  title,
  ...props
}) => {
  const handleCreate = () => {
    onCreate && onCreate()
  }
  const handleCopy = () => {
    onCopy && onCopy()
  }
  const handleOnChange = (page, pageSize) => {
    if (pagination.onChange) {
      pagination.onChange({ current: page, pageSize: pageSize })
    }
  }

  return (
    <>
      <Row className={'mb-2 table-header'} gutter={[8, 0]}>
        {title && <Col flex="auto">{title}</Col>}
        <Col className={'text-right my-1'} flex="auto">
          <>
            {actionComponent && actionComponent()}
            {onCopy && (!createPermission || isGranted(createPermission)) && (
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                style={{ boxShadow: '0px 4px 8px rgba(110, 186, 196, 0.2)' }}>
                {textAddNew}
              </Button>
            )}
          </>
        </Col>
      </Row>
      {props.children}
      {onCreate && (!createPermission || isGranted(createPermission)) && (
        <Button
          type="primary"
          shape="default"
          size="large"
          onClick={handleCreate}
          style={{
            boxShadow: '0px 4px 8px rgba(110, 186, 196, 0.2)',
            height: 40,
            marginTop: 10
          }}>
          {L('ADD_NEW')}
        </Button>
      )}
      {pagination && pagination.total > 0 && (
        <Row className="mt-1">
          <Col sm={{ span: 24, offset: 0 }} style={{ textAlign: 'end' }}>
            <Pagination
              size="small"
              showTotal={(total) => L('TOTAL_{0}_ITEMS', total)}
              {...pagination}
              onChange={handleOnChange}
              showSizeChanger={false}
            />
          </Col>
        </Row>
      )}
    </>
  )
}

export default DataTable
